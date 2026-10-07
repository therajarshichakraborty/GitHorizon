import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { env } from "../lib/env.js";
import { redis } from "../lib/redis.js";
import { queueViolation } from "../lib/violations.js";

/**
 * Sliding window log, executed atomically in Redis.
 *
 * KEYS[1] sorted set of request timestamps for this identity
 * KEYS[2] temp-ban key (set by the BullMQ worker)
 * ARGV[1] limit, ARGV[2] window in ms, ARGV[3] unique member for this request
 *
 * Returns { allowed, remaining, resetMs, banned }
 * Rejected requests are NOT recorded, so a blocked client recovers as soon
 * as its oldest request leaves the window.
 * Time comes from Redis (TIME) so app server clock skew cannot matter.
 */
const SLIDING_WINDOW_LUA = `
local t = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local banTtl = redis.call('PTTL', KEYS[2])
if banTtl > 0 then
  return {0, 0, banTtl, 1}
end

redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window)
local count = redis.call('ZCARD', KEYS[1])

if count >= limit then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local retry = tonumber(oldest[2]) + window - now
  if retry < 1 then retry = 1 end
  return {0, 0, retry, 0}
end

redis.call('ZADD', KEYS[1], now, ARGV[3])
redis.call('PEXPIRE', KEYS[1], window)
local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
local reset = tonumber(oldest[2]) + window - now
if reset < 1 then reset = 1 end
return {1, limit - count - 1, reset, 0}
`;

redis.defineCommand("slidingWindow", { numberOfKeys: 2, lua: SLIDING_WINDOW_LUA });

declare module "ioredis" {
  interface RedisCommander<Context> {
    slidingWindow(
      winKey: string,
      banKey: string,
      limit: number,
      windowMs: number,
      member: string,
    ): Promise<[number, number, number, number]>;
  }
}

const localStore = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of localStore) if (v.resetAt <= now) localStore.delete(k);
}, 30_000).unref();

function localCheck(id: string, limit: number, windowMs: number) {
  const now = Date.now();
  let e = localStore.get(id);
  if (!e || e.resetAt <= now) {
    e = { count: 0, resetAt: now + windowMs };
    localStore.set(id, e);
  }
  e.count++;
  return {
    allowed: e.count <= limit,
    remaining: Math.max(0, limit - e.count),
    resetMs: e.resetAt - now,
  };
}

function identify(req: Request, res: Response): string {
  const userId = res.locals.userId as string | undefined;
  return userId ? `u-${userId}` : `ip-${req.ip ?? "unknown"}`;
}

export function rateLimit() {
  const { limit, windowMs, failOpen } = env.rateLimit;

  return async (req: Request, res: Response, next: NextFunction) => {
    const id = identify(req, res);
    let allowed: boolean;
    let remaining: number;
    let resetMs: number;
    let banned = false;

    try {
      const [a, r, ms, b] = await redis.slidingWindow(
        `rl:{${id}}:win`,
        `rl:{${id}}:ban`,
        limit,
        windowMs,
        randomUUID(),
      );
      allowed = a === 1;
      remaining = r;
      resetMs = ms;
      banned = b === 1;
    } catch (err) {
      console.error(
        JSON.stringify({ level: "error", msg: "rate limiter redis failure", err: String(err) }),
      );
      if (!failOpen) {
        res.setHeader("Retry-After", "1");
        res.status(503).json({ error: "service_unavailable" });
        return;
      }
      const l = localCheck(id, limit, windowMs);
      allowed = l.allowed;
      remaining = l.remaining;
      resetMs = l.resetMs;
    }

    const resetSec = Math.max(1, Math.ceil(resetMs / 1000));
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(resetSec));

    if (allowed) return next();

    res.setHeader("Retry-After", String(resetSec));
    if (!banned) queueViolation(id, req.ip ?? "unknown", req.path);
    res.status(429).json({
      error: banned ? "temporarily_blocked" : "rate_limit_exceeded",
      retryAfterSeconds: resetSec,
    });
  };
}
