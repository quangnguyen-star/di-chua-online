"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewActions({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approved" | "changes_requested") {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/admin/practices/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) return router.refresh();
    const data = res ? await res.json().catch(() => ({})) : {};
    setMessage([data.error ?? "Request failed", ...(data.problems ?? [])].join(": "));
  }

  return (
    <div>
      <label>
        Note for {title} <input value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button type="button" disabled={busy} onClick={() => decide("approved")}>
        Publish
      </button>
      <button type="button" disabled={busy} onClick={() => decide("changes_requested")}>
        Request changes
      </button>
      {message ? <p role="alert">{message}</p> : null}
    </div>
  );
}
