"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PracticeDraft } from "@/lib/publish";

export function EditorForm({ id, initial }: { id: number | null; initial: PracticeDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof PracticeDraft>(key: K, value: PracticeDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function call(url: string, method: string, body?: BodyInit, json = true) {
    const res = await fetch(url, { method, body, headers: json && body ? { "Content-Type": "application/json" } : undefined }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) throw new Error(data.error ?? "Request failed");
    return data;
  }

  async function save(thenSubmit: boolean) {
    setBusy(true);
    setMessage("");
    try {
      let target = id;
      if (target === null) {
        target = (await call("/api/admin/practices", "POST", JSON.stringify(draft))).id as number;
      } else {
        await call(`/api/admin/practices/${target}`, "PUT", JSON.stringify(draft));
      }
      if (thenSubmit) await call(`/api/admin/practices/${target}/submit`, "POST");
      setMessage(thenSubmit ? "Submitted for review." : "Saved.");
      if (id === null) router.replace(`/admin/editor/${target}`);
      else router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", file);
      set("audio_key", (await call("/api/admin/assets", "POST", form, false)).audio_key as string);
      setMessage("Audio uploaded. Save to keep it.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <p>
        <label>
          Title <input value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          Slug <input value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          Kind{" "}
          <select value={draft.kind} onChange={(e) => set("kind", e.target.value as PracticeDraft["kind"])}>
            <option value="practice">Practice</option>
            <option value="breathing">Breathing</option>
          </select>
        </label>
      </p>
      <p>
        <label>
          Summary <input value={draft.summary} onChange={(e) => set("summary", e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          Duration (seconds){" "}
          <input type="number" value={draft.duration_sec} onChange={(e) => set("duration_sec", Number(e.target.value))} />
        </label>
      </p>
      <p>
        <label>
          Body (basic HTML: p, strong, em, lists, links)
          <textarea rows={8} value={draft.body} onChange={(e) => set("body", e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          Audio file (mp3, m4a or ogg) <input type="file" accept=".mp3,.m4a,.ogg,audio/mpeg,audio/mp4,audio/ogg" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
        {draft.audio_key ? <span> Attached: {draft.audio_key}</span> : null}
      </p>
      <p>
        <label>
          Transcript (required with audio)
          <textarea rows={4} value={draft.transcript} onChange={(e) => set("transcript", e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          Rights record <input value={draft.rights_record} onChange={(e) => set("rights_record", e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          Credits <input value={draft.credits} onChange={(e) => set("credits", e.target.value)} />
        </label>
      </p>
      <button type="button" disabled={busy} onClick={() => save(false)}>
        Save draft
      </button>
      <button type="button" disabled={busy} onClick={() => save(true)}>
        Save and submit for review
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}
