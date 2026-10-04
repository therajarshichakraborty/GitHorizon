import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pool from "../src/shared/config/db";

async function runMigration(): Promise<void> {

    // migrations/init.sql
    const path = resolve(process.cwd(), "migrations", "init.sql");

    // execute the SQL file
    const sql = await readFile(path, "utf-8");
    await pool.query(sql);

    // file executed 
    console.log("Migration completed: users and seats tables are ready.");
}

runMigration()
    .catch((error: unknown) => {
        console.error("Migration failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
    });
