export type Stage = { id: string; label: string; seconds: number; prompt: string };

export type VisitState = {
  phase: "ready" | "running" | "paused" | "complete";
  stageIndex: number;
  remainingMs: number;
  skipped: boolean;
};

export type Action = "begin" | "tick" | "pause" | "resume" | "skip" | "exit" | "hidden";

/** The public state plus the clock reading the running stretch started at (null unless running). */
export type EngineState = VisitState & { anchor: number | null };

export type Clock = () => number;

export const initialState: EngineState = {
  phase: "ready",
  stageIndex: 0,
  remainingMs: 0,
  skipped: false,
  anchor: null,
};

const stageMs = (stages: readonly Stage[], index: number) =>
  Math.max(0, stages[index].seconds) * 1000;

function enter(stages: readonly Stage[], state: EngineState, index: number, now: number): EngineState {
  if (index >= stages.length) {
    return { ...state, phase: "complete", stageIndex: stages.length - 1, remainingMs: 0, anchor: null };
  }
  const running = state.phase === "running";
  return {
    ...state,
    stageIndex: index,
    remainingMs: stageMs(stages, index),
    anchor: running ? now : null,
  };
}

/** Bank the active time elapsed since the anchor into remainingMs. */
function settle(state: EngineState, now: number): EngineState {
  if (state.phase !== "running" || state.anchor === null) return state;
  const elapsed = Math.max(0, now - state.anchor);
  return { ...state, remainingMs: Math.max(0, state.remainingMs - elapsed), anchor: now };
}

export function reduce(
  stages: readonly Stage[],
  state: EngineState,
  action: Action,
  now: number,
): EngineState {
  switch (action) {
    case "begin": {
      if (state.phase !== "ready") return state;
      if (stages.length === 0) return { ...state, phase: "complete" };
      return enter(stages, { ...state, phase: "running", skipped: false }, 0, now);
    }
    case "tick": {
      const next = settle(state, now);
      if (next.phase !== "running" || next.remainingMs > 0) return next;
      return enter(stages, next, next.stageIndex + 1, now);
    }
    case "pause":
    case "hidden": {
      if (state.phase !== "running") return state;
      return { ...settle(state, now), phase: "paused", anchor: null };
    }
    case "resume": {
      if (state.phase !== "paused") return state;
      return { ...state, phase: "running", anchor: now };
    }
    case "skip": {
      if (state.phase !== "running" && state.phase !== "paused") return state;
      return enter(stages, { ...state, skipped: true }, state.stageIndex + 1, now);
    }
    case "exit":
      return initialState;
  }
}
