import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DURATION_BUCKETS, EVENT_NAMES } from "@/lib/analytics";
import { ensureEventsTable } from "./table";

export const dynamic = "force-dynamic";

function smallInt(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 100000 ? v : null;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const name = body.name;
  if (typeof name !== "string" || !(EVENT_NAMES as readonly string[]).includes(name)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const bucket = body.durationBucket;
  if (bucket !== undefined && !(DURATION_BUCKETS as readonly unknown[]).includes(bucket)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    await ensureEventsTable();
    await query(
      `INSERT INTO event_counts (day, name, step, practice_id, content_version, duration_bucket, count)
       VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, 1)
       ON CONFLICT (day, name, step, practice_id, content_version, duration_bucket)
       DO UPDATE SET count = event_counts.count + 1`,
      [
        name,
        smallInt(body.step) ?? -1,
        smallInt(body.practiceId) ?? -1,
        smallInt(body.contentVersion) ?? -1,
        (bucket as string | undefined) ?? "",
      ],
    );
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
