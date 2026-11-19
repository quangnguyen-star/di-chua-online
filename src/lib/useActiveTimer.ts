"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TICK_MS = 250;

/** Countdown over active time only: elapsed comes from timestamp deltas, and pausing banks it. */
export function useActiveTimer(seconds: number, clock: () => number = Date.now) {
  const total = Math.max(0, seconds) * 1000;
  const [remainingMs, setRemainingMs] = useState(total);
  const [running, setRunning] = useState(false);
  const anchor = useRef<number | null>(null);
  const remaining = useRef(total);
  const clockRef = useRef(clock);
  clockRef.current = clock;

  const settle = useCallback(() => {
    const now = clockRef.current();
    if (anchor.current !== null) {
      remaining.current = Math.max(0, remaining.current - Math.max(0, now - anchor.current));
      anchor.current = now;
    }
    setRemainingMs(remaining.current);
    return remaining.current;
  }, []);

  const start = useCallback(() => {
    if (remaining.current <= 0) return;
    anchor.current = clockRef.current();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    settle();
    anchor.current = null;
    setRunning(false);
  }, [settle]);

  const reset = useCallback(() => {
    anchor.current = null;
    remaining.current = total;
    setRemainingMs(total);
    setRunning(false);
  }, [total]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (settle() <= 0) {
        anchor.current = null;
        setRunning(false);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, settle]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause]);

  return { remainingMs, running, done: remainingMs <= 0, start, pause, resume: start, reset };
}
