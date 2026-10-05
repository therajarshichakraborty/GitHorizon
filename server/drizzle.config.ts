import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'drizzle-kit';
import { env } from './lib/env.js';

export default defineConfig({
  out: './schemas/migrations',
  schema: './schemas/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: String(env.DATABASE_URL) as string,
  },
});
