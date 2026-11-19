import type { ActivityDefinition } from "@/lib/activity/activity";

export const DEFAULT_STICK = 30;
export const SPENT_KEY = "dc.incense.spent";
/** How long the stick is held at the lamp before it catches. */
export const LIGHT_HOLD_MS = 2000;
/** Pointer speed (px/ms) above which a movement over the flame counts as a flick. */
export const FLICK_SPEED = 1.2;

export type IncensePhase = "ready" | "pulled" | "burning" | "paused" | "extinguished" | "spent" | "placed";
export type IncenseEvent = { type: "pull" | "light" | "pause" | "resume" | "extinguish" | "place" };

export interface IncenseState {
  phase: IncensePhase;
  seconds: number;
  remainingMs: number;
}

export const phaseLabels: Record<IncensePhase, string> = {
  ready: "Những nén hương đã đặt sẵn trong lư. Rút một nén của bạn.",
  pulled: "Giữ nén hương bên ngọn đèn dầu cho đến khi nó bén lửa.",
  burning: "Nén hương đang cháy. Phẩy nhẹ để tắt ngọn lửa, tàn hương sẽ còn đỏ.",
  paused: "Đã tạm dừng. Nén hương chờ bạn.",
  extinguished: "Ngọn lửa đã tắt, tàn hương còn đỏ. Hãy đặt nén hương vào lư.",
  spent: "Nén hương đã tàn. Hãy đặt nén hương vào lư.",
  placed: "Nén hương đã được đặt vào lư.",
};

export const incenseActivity: ActivityDefinition<IncenseState, IncenseEvent> = {
  initial: ({ seconds }) => {
    const total = seconds ?? DEFAULT_STICK;
    return { phase: "ready", seconds: total, remainingMs: total * 1000 };
  },
  reduce(state, event) {
    const { phase } = state;
    switch (event.type) {
      case "pull":
        return phase === "ready" ? { ...state, phase: "pulled" } : state;
      case "light":
        return phase === "ready" || phase === "pulled" ? { ...state, phase: "burning" } : state;
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
