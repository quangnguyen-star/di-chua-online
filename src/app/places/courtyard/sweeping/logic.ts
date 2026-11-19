export interface Leaf {
  id: number;
  /** Position inside the yard, in percent of its width and height. */
  x: number;
  y: number;
}

export const FIRST_SET: readonly Leaf[] = [
  { id: 1, x: 14, y: 22 },
  { id: 2, x: 38, y: 14 },
  { id: 3, x: 66, y: 24 },
  { id: 4, x: 84, y: 16 },
  { id: 5, x: 22, y: 58 },
  { id: 6, x: 50, y: 50 },
  { id: 7, x: 76, y: 62 },
  { id: 8, x: 40, y: 82 },
];

export const WIND_SET: readonly Leaf[] = [
  { id: 101, x: 20, y: 36 },
  { id: 102, x: 58, y: 30 },
  { id: 103, x: 30, y: 72 },
  { id: 104, x: 62, y: 76 },
  { id: 105, x: 80, y: 40 },
];

/** Compatibility alias: the leaves of the first set. */
export const LEAVES = FIRST_SET;

/** Never more than this many leaves are on the ground at once. */
export const LEAF_CAP = 12;

/** Where swept leaves gather, in percent of the yard. */
export const PILE = { x: 90, y: 86 } as const;

/** The pile stops growing past this many leaves. */
export const PILE_CAP = 20;

/** How close, in percent, a broom pass has to come to a leaf to sweep it. */
export const BRUSH_RADIUS = 12;

/** Minimum gap between two sweep sounds. */
export const CUE_INTERVAL_MS = 400;

/** The quiet pause after a set is cleared, before the wind brings the next. */
export const WIND_PAUSE_SECONDS = 6;

export const KEYBOARD_LANES = 4;
const LANE_HALF_HEIGHT = 100 / KEYBOARD_LANES / 2;

export const CLEARED_LINE = "Lá vẫn rơi. Cứ quét chậm thôi.";

export interface SweepState {
  /** Leaves currently on the ground or being swept; at most LEAF_CAP. */
  leaves: readonly Leaf[];
  /** Ids of the leaves already swept away. */
  cleared: readonly number[];
  /** Leaves gathered in the pile over the whole visit. */
  pile: number;
  /** Keyboard strokes made on the current set; picks the next lane. */
  strokes: number;
  /** Whether the wind has already brought its set. */
  windBlew: boolean;
  /** The closing line appears once, after the first set is cleared. */
  lineShown: boolean;
  remainingMs: number;
}

export type SweepEvent =
  | { type: "sweep"; x: number; y: number; radius?: number }
  | { type: "path"; from: Broom; to: Broom }
  | { type: "stroke" }
  | { type: "pass" };

export const freshState: SweepState = {
  leaves: FIRST_SET.slice(0, LEAF_CAP),
  cleared: [],
  pile: 0,
  strokes: 0,
  windBlew: false,
  lineShown: false,
  remainingMs: WIND_PAUSE_SECONDS * 1000,
};

export function remaining(state: SweepState): number {
  return state.leaves.length - state.cleared.length;
}

export function isComplete(state: SweepState): boolean {
  return remaining(state) === 0;
}

/** Whether the set is cleared and the wind has not yet come: the pause is running. */
export function isWaiting(state: SweepState): boolean {
  return isComplete(state) && !state.windBlew;
}

function clearIds(state: SweepState, ids: number[]): SweepState {
  if (ids.length === 0) return state;
  const next = {
    ...state,
    cleared: [...state.cleared, ...ids],
    pile: Math.min(PILE_CAP, state.pile + ids.length),
  };
  return isComplete(next) ? { ...next, lineShown: true } : next;
}

/** Clears every leaf within the brush radius of the point; returns the same state if none. */
export function sweepAt(state: SweepState, x: number, y: number, radius: number = BRUSH_RADIUS): SweepState {
  return clearIds(
    state,
    state.leaves
      .filter((leaf) => !state.cleared.includes(leaf.id) && Math.hypot(leaf.x - x, leaf.y - y) <= radius)
      .map((leaf) => leaf.id),
  );
}

/** Sweeps everything near the straight path between two points, so a fast drag skips nothing. */
export function sweepPath(state: SweepState, from: Broom, to: Broom, radius: number = BRUSH_RADIUS): SweepState {
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / (radius / 2)));
  let next = state;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    next = sweepAt(next, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, radius);
  }
  return next;
}

/** The keyboard equivalent of a drag: each stroke sweeps one horizontal lane, cycling top to bottom. */
export function strokeLane(state: SweepState): SweepState {
  if (isComplete(state)) return state;
  const lane = state.strokes % KEYBOARD_LANES;
  const centre = (lane + 0.5) * (100 / KEYBOARD_LANES);
  const hit = state.leaves
    .filter((leaf) => !state.cleared.includes(leaf.id) && Math.abs(leaf.y - centre) <= LANE_HALF_HEIGHT)
    .map((leaf) => leaf.id);
  const next = clearIds(state, hit);
  return { ...next, strokes: state.strokes + 1 };
}

/** One full pass: the same end state a complete drag reaches. */
export function sweepAll(state: SweepState): SweepState {
  return isComplete(state)
    ? state
    : clearIds(
        state,
        state.leaves.filter((leaf) => !state.cleared.includes(leaf.id)).map((leaf) => leaf.id),
      );
}

/** The wind brings one more, smaller set, once; the pile and the closing line stay as they were. */
export function blowWind(state: SweepState): SweepState {
  if (!isWaiting(state)) return state;
  return {
    ...state,
    leaves: WIND_SET.slice(0, LEAF_CAP),
    cleared: [],
    strokes: 0,
    windBlew: true,
  };
}

/** Timer tick: when the pause runs out the wind blows. */
export function tickSweep(state: SweepState, remainingMs: number): SweepState {
  const next = state.remainingMs === remainingMs ? state : { ...state, remainingMs };
  return remainingMs <= 0 ? blowWind(next) : next;
}

export function reduceSweep(state: SweepState, event: SweepEvent): SweepState {
  switch (event.type) {
    case "sweep":
      return sweepAt(state, event.x, event.y, event.radius);
    case "path":
      return sweepPath(state, event.from, event.to);
    case "stroke":
      return strokeLane(state);
    case "pass":
      return sweepAll(state);
  }
}

export interface Broom {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Spring and drag tuned so the broom trails the pointer and glides on a little after release. */
const STIFFNESS = 90;
const DAMPING = 14;

/** Advances the broom toward its target with inertia; dt is in seconds. With no target it coasts to a stop. */
export function stepBroom(broom: Broom, target: { x: number; y: number } | null, dt: number): Broom {
  const step = Math.min(dt, 0.05);
  const ax = (target ? (target.x - broom.x) * STIFFNESS : 0) - broom.vx * DAMPING;
  const ay = (target ? (target.y - broom.y) * STIFFNESS : 0) - broom.vy * DAMPING;
  const vx = broom.vx + ax * step;
  const vy = broom.vy + ay * step;
  return { x: broom.x + vx * step, y: broom.y + vy * step, vx, vy };
}

/** True once the broom has effectively stopped, so the animation loop can end. */
export function isBroomAtRest(broom: Broom, target: { x: number; y: number } | null): boolean {
  const speed = Math.hypot(broom.vx, broom.vy);
  const gap = target ? Math.hypot(target.x - broom.x, target.y - broom.y) : 0;
  return speed < 0.5 && gap < 0.3;
}

/** Whether a sweep sound may play now; lastCueAt is null before the first one. */
export function canCue(now: number, lastCueAt: number | null, interval: number = CUE_INTERVAL_MS): boolean {
  return lastCueAt === null || now - lastCueAt >= interval;
}
