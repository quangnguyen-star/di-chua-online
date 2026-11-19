"use client";

import { useEffect } from "react";
import { useAtmosphere } from "../atmosphere";
import { useAppearance } from "./useAppearance";

/** Mirrors the chosen appearance onto html[data-theme]; pure attribute change, so running activities never remount. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { appearance } = useAtmosphere();
  const resolved = useAppearance(appearance === "system" ? "auto" : appearance);

  useEffect(() => {
    if (resolved) document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  return <>{children}</>;
}
