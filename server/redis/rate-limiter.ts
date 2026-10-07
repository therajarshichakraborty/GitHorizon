import type { Request, Response, NextFunction } from "express";
import { redis } from "./redis.js";
import { queueViolation } from "./violations.js";
import { env } from "../lib/env.js";
import { randomUUID } from "node:crypto";

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

redis.defineCommand("slidingWindow", {
  numberOfKeys: 2,
  lua: SLIDING_WINDOW_LUA,
});

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
  for (const [key, value] of localStore.entries()) {
    if (value.resetAt <= now) {
      localStore.delete(key);
    }
  }
}, 30000).unref();

export const localCheck = (id: string, limit: number, windowMs: number) => {
  const now = Date.now();
  let entries = localStore.get(id);

  if (!entries || entries.resetAt < now) {
    entries = { count: 0, resetAt: now + windowMs };
    localStore.set(id, entries);
  }

  entries.count += 1;

  return {
    allowed: entries.count <= limit,
    remaining: Math.max(0, limit - entries.count),
    resetMs: entries.resetAt - now,
  };
};
