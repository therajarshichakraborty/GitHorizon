import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "./lib/env.js";
import { rateLimit } from "./lib/rate-limiter.js";

export async function scaffoldApplication(): Promise<Express> {
  const expressApplication: Express = express();

  expressApplication.set("trust proxy", env.trustProxyHops);
  expressApplication.disable("x-powered-by");
  expressApplication.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  expressApplication.use(compression());
  expressApplication.use(helmet());
  expressApplication.use(express.json({ limit: "20kb" }));
  expressApplication.use(express.urlencoded({ extended: true, limit: "20kb" }));
  expressApplication.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  expressApplication.use((req: Request, res: Response, next: NextFunction) => {
    const id = req.header("x-user-id");
    if (id) res.locals.userId = id;
    next();
  });

  expressApplication.use(rateLimit());

  expressApplication.get("/", (req: Request, res: Response) => {
    res.json({ message: "Server is running" });
  });

  expressApplication.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(JSON.stringify({ level: "error", msg: err.message }));
    res.status(500).json({ error: "internal_error" });
  });

  return expressApplication;
}
