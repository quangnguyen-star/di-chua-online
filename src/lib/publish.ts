export type PracticeDraft = {
  slug: string;
  kind: "breathing" | "practice";
  title: string;
  summary: string;
  body: string;
  duration_sec: number;
  audio_key: string | null;
  transcript: string;
  rights_record: string;
  credits: string;
};

/** Reasons a draft may not be published; empty means it is publishable. */
export function publishProblems(d: PracticeDraft): string[] {
  const problems: string[] = [];
  if (!d.title.trim()) problems.push("title is required");
  if (!d.body.trim()) problems.push("body is required");
  if (d.audio_key && !d.transcript.trim()) problems.push("transcript is required when there is audio");
  if (!d.rights_record.trim()) problems.push("rights record is required");
  if (!d.credits.trim()) problems.push("credits are required");
  return problems;
}
