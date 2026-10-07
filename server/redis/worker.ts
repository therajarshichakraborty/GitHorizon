import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../lib/env.js";
import { workerConnection } from "./redis.js";
import { VIOLATION_QUEUE, type ViolationJob } from "./violations.js";

const redis = new Redis(env.redisUrl);
const { threshold, windowSec, durationSec } = env.ban;

const worker = new Worker<ViolationJob>(
  VIOLATION_QUEUE,
  async job => {
    const { id, ip, path } = job.data;
    const counterKey = `rl:{${id}}:viol`;

    const n = await redis.incr(counterKey);
    if (n === 1) await redis.expire(counterKey, windowSec);

    console.log(
      JSON.stringify({ level: "warn", msg: "rate limit violation", id, ip, path, count: n }),
    );

    if (n >= threshold) {
      await redis.set(`rl:{${id}}:ban`, "1", "EX", durationSec);
      await redis.del(counterKey);
      console.log(JSON.stringify({ level: "warn", msg: "temp ban applied", id, durationSec }));
    }
  },
  { connection: workerConnection(), concurrency: 20 },
);

worker.on("failed", (job, err) => {
  console.error(
    JSON.stringify({ level: "error", msg: "violation job failed", job: job?.id, err: err.message }),
  );
});

async function shutdown() {
  await worker.close();
  redis.disconnect();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
