export const STEPS = ["arrive", "offering", "intention", "breathing", "reflection", "close"] as const;
export type Step = (typeof STEPS)[number];

export const SKIPPABLE: readonly Step[] = ["offering", "intention", "breathing"];
export const BREATHING_MS = 120_000;
export const INTENTION_MAX = 500;

export type Breath = {
  /** Active (unpaused, visible) milliseconds banked so far. */
  activeMs: number;
  /** Clock reading when the current active stretch began; null while paused. */
  runningSince: number | null;
  paused: boolean;
};

export type VisitState = {
  step: Step;
  offered: boolean;
  intention: string;
  confirmingEnd: boolean;
  ended: boolean;
  breath: Breath;
};

export type VisitAction =
  | { type: "next"; now: number }
  | { type: "skip"; now: number }
  | { type: "offer" }
  | { type: "setIntention"; text: string }
  | { type: "requestEnd" }
  | { type: "cancelEnd" }
  | { type: "confirmEnd" }
  | { type: "pause"; now: number }
  | { type: "hidden"; now: number }
  | { type: "resume"; now: number }
  | { type: "tick"; now: number }
  | { type: "clear" };

const idleBreath: Breath = { activeMs: 0, runningSince: null, paused: false };

export const initialState: VisitState = {
  step: "arrive",
  offered: false,
  intention: "",
  confirmingEnd: false,
  ended: false,
  breath: idleBreath,
};

export function stepIndex(step: Step): number {
  return STEPS.indexOf(step);
}

export function breathElapsed(breath: Breath, now: number): number {
  const live = breath.runningSince === null ? 0 : Math.max(0, now - breath.runningSince);
  return Math.min(BREATHING_MS, breath.activeMs + live);
}

function bank(breath: Breath, now: number): Breath {
  return { activeMs: breathElapsed(breath, now), runningSince: null, paused: true };
}

function advance(state: VisitState, now: number): VisitState {
  const i = stepIndex(state.step);
  if (i >= STEPS.length - 1) return state;
  const step = STEPS[i + 1];
  const next: VisitState = { ...state, step, confirmingEnd: false };
  if (step === "breathing") next.breath = { activeMs: 0, runningSince: now, paused: false };
  if (step === "close") next.intention = "";
  return next;
}

export function visitReducer(state: VisitState, action: VisitAction): VisitState {
  if (state.ended) return state;
  switch (action.type) {
    case "next":
      if (state.step === "breathing") return state;
      return advance(state, action.now);
    case "skip":
      return SKIPPABLE.includes(state.step) ? advance(state, action.now) : state;
    case "offer":
      return state.step === "offering" ? { ...state, offered: true } : state;
    case "setIntention":
      if (state.step !== "intention") return state;
      return { ...state, intention: action.text.slice(0, INTENTION_MAX) };
    case "requestEnd":
      if (state.intention.trim() === "") return { ...state, intention: "", ended: true };
      return { ...state, confirmingEnd: true };
    case "cancelEnd":
      return { ...state, confirmingEnd: false };
    case "confirmEnd":
    case "clear":
      return { ...state, intention: "", confirmingEnd: false, ended: action.type === "confirmEnd" || state.ended };
    case "pause":
    case "hidden":
      if (state.step !== "breathing" || state.breath.paused) return state;
      return { ...state, breath: bank(state.breath, action.now) };
    case "resume":
      if (state.step !== "breathing" || !state.breath.paused) return state;
      return { ...state, breath: { ...state.breath, runningSince: action.now, paused: false } };
    case "tick":
      if (state.step !== "breathing" || state.breath.paused) return state;
      if (breathElapsed(state.breath, action.now) >= BREATHING_MS) return advance(state, action.now);
      return state;
  }
}

export function durationBucket(ms: number): "lt30s" | "30s_2m" | "2m_5m" | "gt5m" {
  if (ms < 30_000) return "lt30s";
  if (ms < 120_000) return "30s_2m";
  if (ms < 300_000) return "2m_5m";
  return "gt5m";
}
