"use client";

import { useEffect, useState } from "react";
import { appearanceFor, msUntilNextBoundary, vnNow, type AppearanceMode } from "../../lib/clock.ts";

/** Resolves a mode to day or evening on the clock authority; null until mounted, so the server render stays neutral. */
export function useAppearance(mode: AppearanceMode): "day" | "evening" | null {
  const [resolved, setResolved] = useState<"day" | "evening" | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const apply = () => {
      setResolved(appearanceFor(mode, vnNow().hour));
      if (mode === "auto") timer = setTimeout(apply, msUntilNextBoundary() + 50);
    };
    apply();
    return () => clearTimeout(timer);
  }, [mode]);

  return resolved;
}
