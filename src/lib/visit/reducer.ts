export type Stage = { id: string; label: string; seconds: number; prompt: string };

export type Phase = "running" | "paused" | "complete";
/** idle: not due yet; shown: the gentle prompt; faded: the faint arrow; done: dismissed for this stop. */
export type Nudge = "idle" | "shown" | "faded" | "done";

export type VisitState = {
  phase: Phase;
  stageIndex: number;
  /** Active milliseconds spent on this stop; never counts while paused or hidden. */
  activeMs: number;
  /** Set once when activeMs reaches the stop's length; never advances the stage by itself. */
  due: boolean;
  nudge: Nudge;
};

export type Action =
  | { type: "begin"; index: number }
  | { type: "tick"; dt: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "stay" }
  | { type: "exit" }
  | { type: "hidden" };

/** How long the nudge stays full-size after it appears before it shrinks to a faint arrow. */
export const NUDGE_SHOWN_MS = 8000;

const fresh = (stageIndex: number, phase: Phase = "running"): VisitState => ({
  phase,
  stageIndex,
  activeMs: 0,
  due: false,
  nudge: "idle",
});

export const initialState: VisitState = fresh(0);

export function reduce(stages: readonly Stage[], state: VisitState, action: Action): VisitState {
  switch (action.type) {
    case "begin": {
      const index = Math.trunc(action.index);
      if (!(index >= 0 && index < stages.length)) return { ...state, phase: "complete" };
      return fresh(index);
    }
    case "tick": {
      if (state.phase !== "running") return state;
      const stage = stages[state.stageIndex];
      if (!stage) return state;
      const activeMs = state.activeMs + Math.max(0, action.dt);
      const dueAt = Math.max(0, stage.seconds) * 1000;
      let { due, nudge } = state;
      if (!due && activeMs >= dueAt) {
        due = true;
        nudge = "shown";
      }
      if (nudge === "shown" && activeMs >= dueAt + NUDGE_SHOWN_MS) nudge = "faded";
      return { ...state, activeMs, due, nudge };
    }
    case "pause":
    case "hidden":
      return state.phase === "running" ? { ...state, phase: "paused" } : state;
    case "resume":
      return state.phase === "paused" ? { ...state, phase: "running" } : state;
    case "next":
      if (state.phase === "complete") return state;
      if (state.stageIndex + 1 >= stages.length) return { ...state, phase: "complete", nudge: "done" };
      return fresh(state.stageIndex + 1, state.phase);
    case "prev":
      if (state.phase === "complete" || state.stageIndex === 0) return state;
      return fresh(state.stageIndex - 1, state.phase);
    case "stay": {
      if (state.nudge === "shown") return { ...state, nudge: "faded" };
      if (state.nudge === "faded") return { ...state, nudge: "done" };
      return state;
    }
    case "exit":
      return { ...state, phase: "complete", nudge: "done" };
  }
}
