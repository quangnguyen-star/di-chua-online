import type { ActivityDefinition } from "@/lib/activity/activity";

export const STICKS = [120, 300, 600] as const;
export const DEFAULT_STICK = 300;
export const SPENT_KEY = "dc.incense.spent";

export type IncensePhase = "ready" | "burning" | "paused" | "extinguished" | "spent" | "placed";
export type IncenseEvent = { type: "light" | "pause" | "resume" | "extinguish" | "place" };
export type BreathCue = "natural" | "paced";
export type Variant = "incense" | "breathing" | "sitting";

export interface IncenseState {
  phase: IncensePhase;
  seconds: number;
  remainingMs: number;
}

export const phaseLabels: Record<IncensePhase, string> = {
  ready: "Một nén hương đang chờ bạn.",
  burning: "Nén hương đang cháy. Cứ thở nhẹ.",
  paused: "Đã tạm dừng. Nén hương chờ bạn.",
  extinguished: "Ngọn lửa đã tắt. Bạn có thể đặt nén hương vào lư.",
  spent: "Nén hương đã tàn. Bạn có thể đặt nén hương vào lư.",
  placed: "Nén hương đã được đặt vào lư.",
};

export function stickLabel(seconds: number): string {
  return `${seconds / 60} phút`;
}

export const incenseActivity: ActivityDefinition<IncenseState, IncenseEvent> = {
  initial: ({ seconds }) => {
    const total = seconds ?? DEFAULT_STICK;
    return { phase: "ready", seconds: total, remainingMs: total * 1000 };
  },
  reduce(state, event) {
    const { phase } = state;
    switch (event.type) {
      case "light":
        return phase === "ready" ? { ...state, phase: "burning" } : state;
      case "pause":
        return phase === "burning" ? { ...state, phase: "paused" } : state;
      case "resume":
        return phase === "paused" ? { ...state, phase: "burning" } : state;
      case "extinguish":
        return phase === "burning" || phase === "paused" ? { ...state, phase: "extinguished" } : state;
      case "place":
        return phase === "extinguished" || phase === "spent" ? { ...state, phase: "placed" } : state;
      default:
        return state;
    }
  },
  tick(state, remainingMs) {
    if (state.phase !== "burning" && state.phase !== "paused") return state;
    if (remainingMs <= 0) return { ...state, phase: "spent", remainingMs: 0 };
    return remainingMs === state.remainingMs ? state : { ...state, remainingMs };
  },
};

/** 0 when freshly lit, 1 when burnt out. */
export function burnProgress(remainingMs: number, seconds: number): number {
  const total = seconds * 1000;
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - remainingMs / total));
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** 4 s in, 6 s out, repeating, from elapsed active time. */
export function breathPhase(elapsedMs: number): "in" | "out" {
  const t = ((Math.max(0, elapsedMs) % 10000) + 10000) % 10000;
  return t < 4000 ? "in" : "out";
}

/** The variant a stick length and cue start from; the practice routes open these. */
export function variantDefaults(variant: Variant): { seconds: number; cue: BreathCue } {
  if (variant === "breathing") return { seconds: 120, cue: "paced" };
  if (variant === "sitting") return { seconds: 300, cue: "natural" };
  return { seconds: DEFAULT_STICK, cue: "natural" };
}

export function parseVariant(value: string | string[] | undefined): Variant {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "breathing" || v === "sitting" ? v : "incense";
}

type SpentStorage = Pick<Storage, "getItem" | "setItem">;
let memorySpent = false;

/** The only thing the hall keeps: a spent-stick flag. Falls back to memory when storage is unavailable. */
export function readSpent(storage?: SpentStorage): boolean {
  try {
    const store = storage ?? window.localStorage;
    return store.getItem(SPENT_KEY) === "1" || memorySpent;
  } catch {
    return memorySpent;
  }
}

export function markSpent(storage?: SpentStorage): void {
  memorySpent = true;
  try {
    (storage ?? window.localStorage).setItem(SPENT_KEY, "1");
  } catch {
    // storage refused: the in-memory flag above is the fallback
  }
}

export function resetSpentMemory(): void {
  memorySpent = false;
}
