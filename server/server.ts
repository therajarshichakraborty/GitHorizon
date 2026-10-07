import { createServer, type Server } from "node:http";
import process from "node:process";
import { scaffoldApplication } from "./application.js";
import { env } from "./lib/env.js";
import { redis } from "./lib/redis.js";
import { closeViolation } from "./lib/violations.js";

const PORT = Number(env.PORT) as number;
const HOST = String(env.HOST) as string;
const SHUTDOWN_TIMEOUT = 10_000;

let server: Server;
let isShuttingDown = false;

export default async function bootStrap(): Promise<void> {
  try {
    const nodeServer = await scaffoldApplication();
    server = createServer(nodeServer);

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.`);
      } else if (error.code === "EACCES") {
        console.error(`Permission denied while attempting to bind to ${HOST}:${PORT}.`);
      } else {
        console.error("HTTP server error:", error);
      }
      process.exit(1);
    });

    server.on("listening", () => {
      const address = server?.address();

      if (typeof address === "object" && address !== null) {
        console.log(`HTTP server listening on ${address.address}:${address.port}`);
      } else {
        console.log(`HTTP server listening on ${HOST}:${PORT}`);
      }
    });

    server.listen(PORT, HOST);
  } catch (error) {
    console.error("Failed to bootstrap application:", error);
    process.exit(1);
  }
}

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  const forceShutdownTimer = setTimeout(() => {
    console.error(`Graceful shutdown exceeded ${SHUTDOWN_TIMEOUT}ms. Forcing process termination.`);

    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close(error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });

      console.log("HTTP server closed successfully.");
      server.close(async () => {
        await closeViolation().catch(() => {});
        redis.disconnect();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    }

    clearTimeout(forceShutdownTimer);

    process.exit(0);
  } catch (error) {
    clearTimeout(forceShutdownTimer);

    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("uncaughtException", error => {
  console.error("Uncaught exception:", error);
  void shutdown("uncaughtException");
});

process.on("unhandledRejection", reason => {
  console.error("Unhandled promise rejection:", reason);
  void shutdown("unhandledRejection");
});

await bootStrap().catch((error: Error) => {
  console.error("Failed to bootstrap application:", error);
  process.exit(1);
});
