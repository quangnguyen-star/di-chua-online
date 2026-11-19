export type EventName =
  | "visit_started"
  | "step_viewed"
  | "step_completed"
  | "audio_played"
  | "audio_completed"
  | "practice_opened"
  | "visit_completed";

export type DurationBucket = "lt30s" | "30s_2m" | "2m_5m" | "gt5m";

export type EventProps = {
  step?: number;
  practiceId?: number;
  contentVersion?: number;
  durationBucket?: DurationBucket;
  visitId?: string;
};

export const EVENT_NAMES: readonly EventName[] = [
  "visit_started",
  "step_viewed",
  "step_completed",
  "audio_played",
  "audio_completed",
  "practice_opened",
  "visit_completed",
];

export const DURATION_BUCKETS: readonly DurationBucket[] = ["lt30s", "30s_2m", "2m_5m", "gt5m"];

let memoryVisitId: string | undefined;

/** Random per page load, held in memory only: never stored in cookies or storage. */
function currentVisitId(): string {
  if (!memoryVisitId) {
    memoryVisitId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  }
  return memoryVisitId;
}

/** Frozen signature. Sends an aggregate-only event; failures are swallowed. */
export function track(name: EventName, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ name, ...props, visitId: props.visitId ?? currentVisitId() });
  try {
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    return;
  }
}
