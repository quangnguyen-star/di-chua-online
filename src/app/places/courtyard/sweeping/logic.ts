export interface Leaf {
  id: number;
  /** Position inside the yard, in percent of its width and height. */
  x: number;
  y: number;
}

export const LEAVES: readonly Leaf[] = [
  { id: 1, x: 14, y: 22 },
  { id: 2, x: 38, y: 14 },
  { id: 3, x: 66, y: 24 },
  { id: 4, x: 84, y: 16 },
  { id: 5, x: 22, y: 58 },
  { id: 6, x: 50, y: 50 },
  { id: 7, x: 76, y: 62 },
  { id: 8, x: 40, y: 82 },
];

/** How close, in percent, a drag has to pass to a leaf to sweep it. */
export const BRUSH_RADIUS = 12;

/** Minimum gap between two sweep sounds. */
export const CUE_INTERVAL_MS = 400;

export interface SweepState {
  /** Ids of the leaves already swept away. */
  cleared: readonly number[];
}

export const freshState: SweepState = { cleared: [] };

export function remaining(state: SweepState): number {
  return LEAVES.length - state.cleared.length;
}

export function isComplete(state: SweepState): boolean {
  return remaining(state) === 0;
}

/** Clears every leaf within the brush radius of the point; returns the same state if none. */
export function sweepAt(state: SweepState, x: number, y: number, radius: number = BRUSH_RADIUS): SweepState {
  const hit = LEAVES.filter(
    (leaf) => !state.cleared.includes(leaf.id) && Math.hypot(leaf.x - x, leaf.y - y) <= radius,
  ).map((leaf) => leaf.id);
  return hit.length === 0 ? state : { cleared: [...state.cleared, ...hit] };
}

/** One full pass: the same end state a complete drag reaches. */
export function sweepAll(state: SweepState): SweepState {
  return isComplete(state) ? state : { cleared: LEAVES.map((leaf) => leaf.id) };
}

/** Whether a sweep sound may play now; lastCueAt is null before the first one. */
export function canCue(now: number, lastCueAt: number | null, interval: number = CUE_INTERVAL_MS): boolean {
  return lastCueAt === null || now - lastCueAt >= interval;
}
