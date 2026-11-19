"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { initialState, reduce, type Action, type Clock, type Stage, type VisitState } from "./reducer.ts";

const TICK_MS = 250;

type Options = { clock?: Clock; onComplete?: () => void };

export function useVisit(stages: readonly Stage[], options: Options = {}) {
  const clock = options.clock ?? Date.now;
  const clockRef = useRef(clock);
  const stagesRef = useRef(stages);
  const onCompleteRef = useRef(options.onComplete);
  clockRef.current = clock;
  stagesRef.current = stages;
  onCompleteRef.current = options.onComplete;

  const [engine, dispatch] = useReducer(
    (s: typeof initialState, a: Action) => reduce(stagesRef.current, s, a, clockRef.current()),
    initialState,
  );

  const send = useCallback((a: Action) => dispatch(a), []);

  useEffect(() => {
    if (engine.phase !== "running") return;
    const id = setInterval(() => send("tick"), TICK_MS);
    return () => clearInterval(id);
  }, [engine.phase, send]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) send("hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [send]);

  useEffect(() => {
    if (engine.phase === "complete") onCompleteRef.current?.();
  }, [engine.phase]);

  const state: VisitState = {
    phase: engine.phase,
    stageIndex: engine.stageIndex,
    remainingMs: engine.remainingMs,
    skipped: engine.skipped,
  };

  return {
    state,
    begin: useCallback(() => send("begin"), [send]),
    pause: useCallback(() => send("pause"), [send]),
    resume: useCallback(() => send("resume"), [send]),
    skip: useCallback(() => send("skip"), [send]),
    exit: useCallback(() => send("exit"), [send]),
  };
}
