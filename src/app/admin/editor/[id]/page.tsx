import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkingCopy } from "@/lib/admin";
import { requirePageSession } from "@/lib/admin-session";
import type { PracticeDraft } from "@/lib/publish";
import { EditorForm } from "./editor-form";

export const dynamic = "force-dynamic";

const EMPTY: PracticeDraft = {
  slug: "",
  kind: "practice",
  title: "",
  summary: "",
  body: "",
  duration_sec: 120,
  audio_key: null,
  transcript: "",
  rights_record: "",
  credits: "",
};

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageSession(["editor"]);
  const { id } = await params;
  let draft = EMPTY;
  let status = "new";
  if (id !== "new") {
    const item = /^\d+$/.test(id) ? await getWorkingCopy(Number(id)) : undefined;
    if (!item) notFound();
    draft = item.draft;
    status = item.pending_revision ? `published v${item.version} with a pending revision` : item.status;
  }
  return (
    <main>
      <h1>{id === "new" ? "New practice" : `Edit ${draft.title}`}</h1>
      <Link href="/admin">Back to content</Link>
      <p>Status: {status}</p>
      <EditorForm id={id === "new" ? null : Number(id)} initial={draft} />
    </main>
  );
}
