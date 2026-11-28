"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ActiveTimerCore, type TimerConfig } from "./activity/timerCore.ts";

export { ActiveTimerCore, type TimerConfig, type TimerOptions, type TimerSnapshot } from "./activity/timerCore.ts";

export function useActiveTimer(seconds: number, clock: () => number = Date.now, config?: TimerConfig) {
  const effective = config?.seconds ?? seconds;
  const clockRef = useRef(clock);
  useEffect(() => {
    clockRef.current = clock;
  }, [clock]);
  const [timer] = useState(() => new ActiveTimerCore(effective, { now: () => clockRef.current() }));

  const snap = useSyncExternalStore(timer.subscribe, timer.getSnapshot, timer.getSnapshot);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    timer.reset(effective);
  }, [timer, effective]);

  useEffect(() => {
    const onVisibility = () => timer.setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      timer.dispose();
    };
  }, [timer]);

  const start = useCallback(() => timer.start(), [timer]);
  const pause = useCallback(() => timer.pause(), [timer]);
  const reset = useCallback(() => timer.reset(), [timer]);

  return {
    remainingMs: snap.remainingMs,
    running: snap.running,
    done: snap.remainingMs <= 0,
    start,
    pause,
    resume: start,
    reset,
  };
}
