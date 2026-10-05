import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "./lib/env.js";

export async function scaffoldApp(): Promise<Express> {
  const expressApplication: Express = express();

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

  return expressApplication;
}
