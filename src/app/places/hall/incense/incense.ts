export const INCENSE_SECONDS = 180;

export type IncensePhase = "ready" | "burning" | "paused" | "finished";

export const phaseLabels: Record<IncensePhase, string> = {
  ready: "Một nén hương đang chờ bạn.",
  burning: "Nén hương đang cháy. Cứ thở nhẹ.",
  paused: "Đã tạm dừng. Nén hương chờ bạn.",
  finished: "Nén hương đã tàn.",
};

/** Phase derived from the lit flag and the timer; a stick is lit at most once per visit. */
export function incensePhase(lit: boolean, running: boolean, remainingMs: number): IncensePhase {
  if (!lit) return "ready";
  if (remainingMs <= 0) return "finished";
  return running ? "burning" : "paused";
}

/** 0 when freshly lit, 1 when burnt out. */
export function burnProgress(remainingMs: number, seconds: number = INCENSE_SECONDS): number {
  const total = seconds * 1000;
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - remainingMs / total));
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
