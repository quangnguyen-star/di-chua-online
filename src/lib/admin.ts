import { query } from "./db";
import { publishProblems, type PracticeDraft } from "./publish";
import { sanitizeHtml } from "./sanitize";

type Row = PracticeDraft & { id: number; status: string; version: number; updated_at: string };
type Revision = { id: number; snapshot: PracticeDraft & { submitted?: boolean } };

const FIELDS = ["slug", "kind", "title", "summary", "body", "duration_sec", "audio_key", "transcript", "rights_record", "credits"] as const;

export type AdminItem = Row & { pending_revision: boolean; revision_submitted: boolean };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Validates and normalizes a request body; the body HTML is sanitized here, before anything is stored. */
export function parseDraft(input: unknown): { draft: PracticeDraft; error?: undefined } | { draft?: undefined; error: string } {
  if (!input || typeof input !== "object") return { error: "invalid body" };
  const o = input as Record<string, unknown>;
  const slug = str(o.slug);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: "slug must be lowercase words joined by hyphens" };
  if (!str(o.title)) return { error: "title is required" };
  const kind = o.kind === "breathing" ? "breathing" : "practice";
  const duration = Number(o.duration_sec ?? 120);
  if (!Number.isInteger(duration) || duration < 1 || duration > 7200) return { error: "duration_sec out of range" };
  const audio = str(o.audio_key);
  if (audio && !/^audio\/[A-Za-z0-9._-]+$/.test(audio)) return { error: "invalid audio_key" };
  return {
    draft: {
      slug,
      kind,
      title: str(o.title),
      summary: str(o.summary),
      body: sanitizeHtml(typeof o.body === "string" ? o.body : ""),
      duration_sec: duration,
      audio_key: audio || null,
      transcript: str(o.transcript),
      rights_record: str(o.rights_record),
      credits: str(o.credits),
    },
  };
}

const draftOf = (r: PracticeDraft): PracticeDraft => Object.fromEntries(FIELDS.map((f) => [f, r[f]])) as PracticeDraft;

async function revisionFor(row: Row): Promise<Revision | undefined> {
  const rows = await query<Revision>(
    "SELECT id, snapshot FROM practice_revision WHERE practice_id = $1 AND version = $2",
    [row.id, row.version + 1],
  );
  return rows[0];
}

async function getRow(id: number): Promise<Row | undefined> {
  return (await query<Row>("SELECT * FROM practice WHERE id = $1", [id]))[0];
}

export async function listItems(): Promise<AdminItem[]> {
  return query<AdminItem>(
    `SELECT p.*, (r.id IS NOT NULL) AS pending_revision,
            COALESCE((r.snapshot->>'submitted')::boolean, false) AS revision_submitted
       FROM practice p
       LEFT JOIN practice_revision r ON r.practice_id = p.id AND r.version = p.version + 1
      ORDER BY p.updated_at DESC, p.id`,
  );
}

/** The version the editor works on: the pending revision for a published item, otherwise the row itself. */
export async function getWorkingCopy(id: number): Promise<(AdminItem & { draft: PracticeDraft }) | undefined> {
  const row = await getRow(id);
  if (!row) return undefined;
  const rev = row.status === "published" ? await revisionFor(row) : undefined;
  return {
    ...row,
    pending_revision: !!rev,
    revision_submitted: !!rev?.snapshot.submitted,
    draft: rev ? draftOf(rev.snapshot) : draftOf(row),
  };
}

export async function createPractice(d: PracticeDraft): Promise<number> {
  const rows = await query<{ id: number }>(
    `INSERT INTO practice (slug, kind, title, summary, body, duration_sec, audio_key, transcript, rights_record, credits, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft') RETURNING id`,
    FIELDS.map((f) => d[f]),
  );
  return rows[0].id;
}

/** Published items are never touched in place: the edit lands in a practice_revision for version + 1. */
export async function updatePractice(id: number, d: PracticeDraft): Promise<"ok" | "not_found"> {
  const row = await getRow(id);
  if (!row) return "not_found";
  if (row.status === "published") {
    await query(
      `INSERT INTO practice_revision (practice_id, version, snapshot) VALUES ($1, $2, $3)
       ON CONFLICT (practice_id, version) DO UPDATE SET snapshot = EXCLUDED.snapshot`,
      [id, row.version + 1, JSON.stringify({ ...d, submitted: false })],
    );
    return "ok";
  }
  await query(
    `UPDATE practice SET slug=$2, kind=$3, title=$4, summary=$5, body=$6, duration_sec=$7, audio_key=$8,
            transcript=$9, rights_record=$10, credits=$11, status='draft', updated_at=now() WHERE id=$1`,
    [id, ...FIELDS.map((f) => d[f])],
  );
  return "ok";
}

export async function submitPractice(id: number): Promise<"ok" | "not_found" | "nothing_to_submit"> {
  const row = await getRow(id);
  if (!row) return "not_found";
  if (row.status === "published") {
    const rev = await revisionFor(row);
    if (!rev) return "nothing_to_submit";
    await query("UPDATE practice_revision SET snapshot = snapshot || '{\"submitted\": true}'::jsonb WHERE id = $1", [rev.id]);
    return "ok";
  }
  if (row.status !== "draft") return "nothing_to_submit";
  await query("UPDATE practice SET status='in_review', updated_at=now() WHERE id=$1", [id]);
  return "ok";
}

export type ReviewResult =
  | { ok: true; status: string; version: number }
  | { ok: false; code: 404 | 409 | 422; error: string; problems?: string[] };

export async function reviewPractice(
  id: number,
  reviewer: string,
  decision: "approved" | "changes_requested",
  note: string,
): Promise<ReviewResult> {
  const row = await getRow(id);
  if (!row) return { ok: false, code: 404, error: "not found" };
  const rev = row.status === "published" ? await revisionFor(row) : undefined;
  const awaiting = rev ? !!rev.snapshot.submitted : row.status === "in_review";
  if (!awaiting) return { ok: false, code: 409, error: "item is not awaiting review" };

  const log = () =>
    query("INSERT INTO content_review (practice_id, reviewer, decision, note) VALUES ($1,$2,$3,$4)", [id, reviewer, decision, note]);

  if (decision === "changes_requested") {
    if (rev) {
      await query("UPDATE practice_revision SET snapshot = snapshot || '{\"submitted\": false}'::jsonb WHERE id = $1", [rev.id]);
    } else {
      await query("UPDATE practice SET status='draft', updated_at=now() WHERE id=$1", [id]);
    }
    await log();
    return { ok: true, status: rev ? "published" : "draft", version: row.version };
  }

  const draft = rev ? draftOf(rev.snapshot) : draftOf(row);
  const clean = { ...draft, body: sanitizeHtml(draft.body) };
  const problems = publishProblems(clean);
  if (problems.length) return { ok: false, code: 422, error: "not publishable", problems };

  const rows = await query<{ version: number }>(
    `UPDATE practice SET slug=$2, kind=$3, title=$4, summary=$5, body=$6, duration_sec=$7, audio_key=$8,
            transcript=$9, rights_record=$10, credits=$11, status='published', version=version+1, updated_at=now()
      WHERE id=$1 RETURNING version`,
    [id, ...FIELDS.map((f) => clean[f])],
  );
  await log();
  return { ok: true, status: "published", version: rows[0].version };
}
