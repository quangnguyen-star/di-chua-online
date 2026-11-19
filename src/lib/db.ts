import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { seedIfEmpty } from "./seed";

const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
  pgReady?: Promise<void>;
};

function pool(): Pool {
  if (!globalForDb.pgPool) {
    globalForDb.pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return globalForDb.pgPool;
}

/** Applies the idempotent schema and seed once per process; later calls reuse the result. */
export function ensureReady(): Promise<void> {
  if (!globalForDb.pgReady) {
    globalForDb.pgReady = (async () => {
      const sql = await readFile(path.join(process.cwd(), "lib", "schema.sql"), "utf8");
      await pool().query(sql);
      await seedIfEmpty(pool());
    })().catch((err) => {
      globalForDb.pgReady = undefined;
      throw err;
    });
  }
  return globalForDb.pgReady;
}

export async function query<T extends object>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureReady();
  const res = await pool().query<T>(text, params);
  return res.rows;
}
