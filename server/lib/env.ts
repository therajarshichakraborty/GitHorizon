import dotenv from 'dotenv';
dotenv.config();

import { safeParse, z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.literal('development').or(z.literal('production')),
  PORT: z.number(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
});

export const env = safeParse(envSchema, process.env);

if (!env.success) {
  console.error('Invalid environment variables:', env.error.issues);
  process.exit(1);
}

export const validatedEnv = env.data;
