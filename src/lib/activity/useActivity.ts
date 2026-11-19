"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createActivity, type ActivityConfig, type ActivityDefinition, type ActivityEvent } from "./activity.ts";

export * from "./activity.ts";

export function useActivity<TState, TEvent extends ActivityEvent = ActivityEvent>(
  def: ActivityDefinition<TState, TEvent>,
  config?: ActivityConfig,
) {
  const latest = useRef({ def, config });
  latest.current = { def, config };
  const [activity, setActivity] = useState(() => createActivity(def, config));

  useEffect(() => {
    let current = activity;
    if (current.disposed) {
      current = createActivity(latest.current.def, latest.current.config);
      setActivity(current);
    }
    const onVisibility = () => {
      if (document.hidden) current.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      current.dispose();
    };
  }, [activity]);

  const state = useSyncExternalStore(activity.subscribe, activity.getState, activity.getState);
  return { state, send: activity.send, pause: activity.pause, resume: activity.resume, dispose: activity.dispose };
}
