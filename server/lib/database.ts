import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env.js";

const pool = new Pool({
  connectionString: String(env.DATABASE_URL) as string
});

export const db = drizzle({ client: pool });
