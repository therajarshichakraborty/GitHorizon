import dotenv from "dotenv";
dotenv.config();

import process from "node:process";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "testing"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  HOST: z.string().default("0.0.0.0"),
  CORS_ORIGIN: z.string().default("http://localhost:4000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
export const validatedEnv = env;
export type Env = z.infer<typeof envSchema>;
