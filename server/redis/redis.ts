import { Redis } from "ioredis";
import { env } from "../lib/env.js";

export const redis = new Redis(env.redisUrl, {
  enableOfflineQueue: false,
  commandTimeout: 100,
  maxRetriesPerRequest: 1,
  retryStrategy: (times: number) => {
    return Math.min(times * 100, 20000);
  },
});

redis.on("error", (error: any) => {
  console.log(JSON.stringify({ level: "error", msg: "redis error", err: error.message }));
});

export const queueConnections = () => {
  return new Redis(env.redisUrl, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: null,
  });
};

export const workerConnection = () => {
  return new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
  });
};
