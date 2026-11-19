import { query } from "./db";

export type PracticeType = "breathing" | "meditation";

export type PracticeCard = {
  id: number;
  type: PracticeType;
  slug: string;
  title: string;
  summary: string;
  durationSec: number;
};

export type Practice = PracticeCard & {
  body: string;
  version: number;
  audioUrl: string | null;
};

export type VisitSnapshot = {
  version: number;
  reflection: { id: number; text: string; attribution: string };
  breathing: {
    id: number;
    title: string;
    body: string;
    durationSec: 120;
    audioUrl: string | null;
  };
};

type PracticeRow = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  kind: "breathing" | "practice";
  duration_sec: number;
  audio_key: string | null;
  version: number;
};

const practiceType = (row: PracticeRow): PracticeType =>
  row.kind === "breathing" ? "breathing" : "meditation";

const audioUrl = (row: PracticeRow) => (row.audio_key ? `/api/audio/${row.id}` : null);

export async function listPublishedPractices(): Promise<PracticeCard[]> {
  const rows = await query<PracticeRow>(
    "SELECT * FROM practice WHERE status = 'published' ORDER BY sort_order, id",
  );
  return rows.map((r) => ({
    id: r.id,
    type: practiceType(r),
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    durationSec: r.duration_sec,
  }));
}

export async function getPublishedPractice(slug: string): Promise<Practice | null> {
  const rows = await query<PracticeRow>(
    "SELECT * FROM practice WHERE slug = $1 AND status = 'published'",
    [slug],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    type: practiceType(r),
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    durationSec: r.duration_sec,
    body: r.body,
    version: r.version,
    audioUrl: audioUrl(r),
  };
}

/** Returns null when no published reflection or breathing practice exists yet. */
export async function getVisitSnapshot(): Promise<VisitSnapshot | null> {
  const reflections = await query<{ id: number; text: string; attribution: string; version: number }>(
    "SELECT id, text, attribution, version FROM reflection WHERE status = 'published' ORDER BY id",
  );
  const breathing = await query<PracticeRow>(
    "SELECT * FROM practice WHERE status = 'published' AND kind = 'breathing' ORDER BY sort_order, id LIMIT 1",
  );
  const b = breathing[0];
  if (reflections.length === 0 || !b) return null;

  const dayIndex = Math.floor(Date.now() / 86_400_000) % reflections.length;
  const r = reflections[dayIndex];
  return {
    version: Math.max(b.version, r.version),
    reflection: { id: r.id, text: r.text, attribution: r.attribution },
    breathing: { id: b.id, title: b.title, body: b.body, durationSec: 120, audioUrl: audioUrl(b) },
  };
}
