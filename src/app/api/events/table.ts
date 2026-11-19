import { query } from "@/lib/db";

/** Aggregate counters only: no visit id, IP or user agent is ever written. */
const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS event_counts (
  day date NOT NULL,
  name text NOT NULL,
  step integer NOT NULL DEFAULT -1,
  practice_id integer NOT NULL DEFAULT -1,
  content_version integer NOT NULL DEFAULT -1,
  duration_bucket text NOT NULL DEFAULT '',
  count bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (day, name, step, practice_id, content_version, duration_bucket)
)`;

let tableReady: Promise<unknown> | undefined;

export function ensureEventsTable(): Promise<unknown> {
  if (!tableReady) {
    tableReady = query(CREATE_TABLE).catch((err) => {
      tableReady = undefined;
      throw err;
    });
  }
  return tableReady;
}
