import { Queue } from "bullmq";
import { queueConnections } from "./redis.js";

export const VIOLATION_QUEUE = "rate-limit-violations";
export type ViolationJob = {
  id: string;
  ip: string;
  path: string;
  ts: number;
};

const violationQueue = new Queue<ViolationJob>(VIOLATION_QUEUE, {
  connection: queueConnections(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      age: 20 * 60,
      count: 10000,
    },
    removeOnFail: {
      age: 24 * 60 * 60,
      count: 1000,
    },
  },
});

export const queueViolation = (id: string, ip: string, path: string):void => {
  const minute = Math.floor(Date.now() / 60000);
  const jobId = `${id.replaceAll(":", "_")}-${minute}`;

  violationQueue.add("violation", { id, ip, path, ts: Date.now() }, { jobId }).catch(() => {
    console.log("Failed to queue violation");
  });
};

export const closeViolation = async () => {
  await violationQueue.close();
};
