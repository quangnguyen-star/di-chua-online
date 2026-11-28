"use client";

import { useSyncExternalStore } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const reducedQuery = () => (typeof window.matchMedia === "function" ? window.matchMedia(REDUCED_QUERY) : null);

const subscribeReduced = (onChange: () => void) => {
  const query = reducedQuery();
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
};

const readReduced = () => reducedQuery()?.matches ?? false;

const subscribeHidden = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

const readHidden = () => document.hidden;

const never = () => false;

/** True when the visitor prefers reduced motion; false on the server and during hydration. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, readReduced, never);
}

/** True while the tab is hidden; false on the server and during hydration. */
export function usePageHidden(): boolean {
  return useSyncExternalStore(subscribeHidden, readHidden, never);
}
