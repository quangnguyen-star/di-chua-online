"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { reduce, type Action, type Stage, type VisitState } from "./reducer.ts";

const TICK_MS = 250;
/** A throttled background timer can report a huge gap; no single tick may count more than this. */
const MAX_DT_MS = 1000;

type Options = { startIndex?: number; untimed?: boolean; clock?: () => number };

export function useVisit(stages: readonly Stage[], options: Options = {}) {
  const { startIndex = 0, untimed = false } = options;
  const clockRef = useRef(options.clock ?? Date.now);
  const clock = options.clock ?? Date.now;
  useEffect(() => {
    clockRef.current = clock;
  }, [clock]);
  const hiddenPause = useRef(false);

  const [state, dispatch] = useReducer(
    (s: VisitState, a: Action) => reduce(stages, s, a),
    startIndex,
    (index): VisitState => reduce(stages, { phase: "running", stageIndex: 0, activeMs: 0, due: false, nudge: "idle" }, { type: "begin", index }),
  );

  const { phase } = state;
  useEffect(() => {
    if (phase !== "running" || untimed) return;
    let last = clockRef.current();
    const id = setInterval(() => {
      const now = clockRef.current();
      const dt = Math.min(MAX_DT_MS, Math.max(0, now - last));
      last = now;
      dispatch({ type: "tick", dt });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, untimed]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        hiddenPause.current = true;
        dispatch({ type: "hidden" });
      } else if (hiddenPause.current) {
        hiddenPause.current = false;
        dispatch({ type: "resume" });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return {
    state,
    begin: useCallback((index: number) => dispatch({ type: "begin", index }), []),
    pause: useCallback(() => dispatch({ type: "pause" }), []),
    resume: useCallback(() => dispatch({ type: "resume" }), []),
    next: useCallback(() => dispatch({ type: "next" }), []),
    prev: useCallback(() => dispatch({ type: "prev" }), []),
    stay: useCallback(() => dispatch({ type: "stay" }), []),
    exit: useCallback(() => dispatch({ type: "exit" }), []),
  };
}
