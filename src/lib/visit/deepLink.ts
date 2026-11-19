import type { Stage } from "./reducer.ts";

export type VisitStart = {
  /** True when ?stop= named a known stop: that stop runs alone and offers the tour at its end. */
  single: boolean;
  index: number;
};

/** /visit runs the tour from stop 1; ?stop=<PlaceId> runs one stop; anything else falls back to /visit. */
export function resolveStart(stop: string | string[] | undefined, stages: readonly Stage[]): VisitStart {
  const index = typeof stop === "string" ? stages.findIndex((s) => s.id === stop) : -1;
  return index >= 0 ? { single: true, index } : { single: false, index: 0 };
}
