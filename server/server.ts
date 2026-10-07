import { createServer, type Server } from "node:http";
import { type Request, type Response, type NextFunction } from "express";
import process from "node:process";
import { scaffoldApp } from "./scaffoldApplication.js";
import { env } from "./lib/env.js";
import { redis } from "./redis/redis.js";
import { rateLimit } from "./redis/rate-limiter.js";
import { closeViolation } from "./redis/violations.js";

const PORT = Number(env.PORT) as number;
const HOST = String(env.HOST) as string;
const SHUTDOWN_TIMEOUT = 10_000;

let server: Server;
let isShuttingDown = false;

export default async function bootStrap(): Promise<void> {
  try {
    const nodeServer = await scaffoldApp();
    server = createServer(nodeServer);

    // Health checks stay outside the limiter so orchestrators never get 429s.
    nodeServer.get("/healthz", (_req, res) => {
      res.json({ ok: true });
    });

    nodeServer.use((req: Request, res: Response, next: NextFunction) => {
      const id = req.header("x-user-id");
      if (id) res.locals.userId = id;
      next();
    });

    nodeServer.use(rateLimit());

    nodeServer.get("/", (req: Request, res: Response) => {
      res.json({ message: "Server is running" });
    });

    nodeServer.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(JSON.stringify({ level: "error", msg: err.message }));
      res.status(500).json({ error: "internal_error" });
    });

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
