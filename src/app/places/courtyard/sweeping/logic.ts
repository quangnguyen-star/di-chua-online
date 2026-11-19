/** Courtyard leaf physics. Coordinates are percentages of the yard (0-100), speeds are percent per second. */

export interface Leaf {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  /** Degrees per second while sliding, so a pushed leaf tumbles a little. */
  spin: number;
  /** Index into LEAF_TINTS. */
  kind: number;
  landed: boolean;
}

export interface Mark {
  x: number;
  y: number;
  /** Direction of the stroke in degrees. */
  angle: number;
  /** Seconds since it was drawn. */
  age: number;
}

export interface World {
  leaves: Leaf[];
  /** Leaves gathered into the corner pile so far, capped at PILE_CAP; drives the pile's height only. */
  pile: number;
  nextId: number;
  /** Seconds until the next leaf falls. */
  spawnIn: number;
  /** Faint strokes the broom leaves on the ground; they fade and are capped. */
  marks: Mark[];
}

export interface Broom {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Hard cap on live leaves; new ones stop falling while the yard is this full. */
export const LEAF_CAP = 14;
export const LEAF_TINTS = ["#d79a3c", "#b5532a", "#c9b037", "#8a6a2c"] as const;
export const PILE = { x: 88, y: 66 } as const;
export const PILE_CAP = 20;
export const MARK_CAP = 36;
export const MARK_LIFE = 2.6;
export const BRUSH_RADIUS = 10;
/** Broom speed below which it is resting and moves nothing. */
export const PUSH_MIN_SPEED = 4;
export const CUE_INTERVAL_MS = 400;
export const SPAWN_SECONDS = 1.4;
/** Where leaves land, as a band of the yard's height: the interaction band, below the horizon. */
export const GROUND_TOP = 52;
export const GROUND_BOTTOM = 70;
/** Horizontal distance a leaf jumps per arrow press when motion is reduced. */
export const KEY_STEP = 16;
/** Broom speed a held arrow key applies. */
export const KEY_SPEED = 34;
export const KEY_ROW = 62;
const FALL_SPEED = 14;
const DRIFT = 4;
const PILE_REACH = 6;
const PUSH_GAIN = 1.15;
const FRICTION = 2.4;
const MARK_SPACING = 3;

export const freshWorld: World = { leaves: [], pile: 0, nextId: 1, spawnIn: 0.4, marks: [] };

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export type Rand = () => number;

/** Where a leaf with this id comes to rest: its own row on the ground band. */
const groundFor = (id: number) => GROUND_TOP + (((id * 37) % 100) / 100) * (GROUND_BOTTOM - GROUND_TOP);

/** Leaves nearer the viewer (lower on screen) are drawn larger. */
export const depthScale = (y: number) => 0.6 + clamp((y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP), 0, 1) * 0.55;

/** The broom leans into the direction it is dragged, up to 35 degrees. */
export const broomTilt = (broom: Broom) => clamp(broom.vx * 0.7, -35, 35);

/** The corner pile's scale: it rises as leaves gather and stops at PILE_CAP. */
export const pileScale = (pile: number) => 0.5 + (Math.min(pile, PILE_CAP) / PILE_CAP) * 1.1;

/** A new leaf at the top edge, or the world unchanged while the cap is reached. */
export function spawnLeaf(world: World, rand: Rand): World {
  if (world.leaves.length >= LEAF_CAP) return world;
  const leaf: Leaf = {
    id: world.nextId,
    x: 4 + rand() * 80,
    y: GROUND_TOP - 30,
    vx: (rand() - 0.5) * DRIFT,
    vy: FALL_SPEED * (0.7 + rand() * 0.6),
    rot: rand() * 360,
    spin: 0,
    kind: Math.floor(rand() * LEAF_TINTS.length) % LEAF_TINTS.length,
    landed: false,
  };
  return { ...world, leaves: [...world.leaves, leaf], nextId: world.nextId + 1 };
}

/** A leaf already lying on the ground: how leaves arrive when motion is reduced. */
export function settleLeaf(world: World, rand: Rand): World {
  const next = spawnLeaf(world, rand);
  if (next === world) return world;
  const leaves = next.leaves.slice();
  const last = leaves[leaves.length - 1];
  leaves[leaves.length - 1] = { ...last, y: GROUND_TOP + rand() * (GROUND_BOTTOM - GROUND_TOP), vx: 0, vy: 0, landed: true };
  return { ...next, leaves };
}

const inPile = (leaf: Leaf) => Math.hypot(leaf.x - PILE.x, (leaf.y - PILE.y) * 1.6) < PILE_REACH;

function absorb(world: World, leaves: Leaf[]): World {
  const kept = leaves.filter((l) => !inPile(l));
  const gathered = leaves.length - kept.length;
  return { ...world, leaves: kept, pile: Math.min(PILE_CAP, world.pile + gathered) };
}

/** Ages the strokes, drops the faded ones and adds a new one when the broom has travelled far enough. */
export function stepMarks(marks: Mark[], broom: Broom, dt: number, sweeping: boolean): Mark[] {
  const aged = marks.map((m) => ({ ...m, age: m.age + dt })).filter((m) => m.age < MARK_LIFE);
  const speed = Math.hypot(broom.vx, broom.vy);
  if (!sweeping || speed < PUSH_MIN_SPEED) return aged;
  const last = aged[aged.length - 1];
  if (last && Math.hypot(last.x - broom.x, last.y - broom.y) < MARK_SPACING) return aged;
  const angle = (Math.atan2(broom.vy, broom.vx) * 180) / Math.PI;
  return [...aged, { x: broom.x, y: broom.y, angle, age: 0 }].slice(-MARK_CAP);
}

/**
 * Advances the yard by dt seconds. A moving broom pushes the landed leaves under it along its own velocity;
 * the leaves keep sliding on that momentum and friction slows them. Falling leaves ignore the broom.
 */
export function stepWorld(world: World, broom: Broom, dt: number, rand: Rand, sweeping = true): World {
  const step = Math.min(dt, 0.05);
  const speed = Math.hypot(broom.vx, broom.vy);
  const pushing = sweeping && speed > PUSH_MIN_SPEED;
  const moved = world.leaves.map((leaf): Leaf => {
    if (!leaf.landed) {
      const y = leaf.y + leaf.vy * step;
      const x = clamp(leaf.x + leaf.vx * step, 0, 100);
      const ground = groundFor(leaf.id);
      return y >= ground ? { ...leaf, x, y: ground, vx: 0, vy: 0, landed: true } : { ...leaf, x, y, rot: leaf.rot + 40 * step };
    }
    let { vx, vy, spin } = leaf;
    if (pushing && Math.hypot(leaf.x - broom.x, (leaf.y - broom.y) * 1.6) < BRUSH_RADIUS) {
      const blend = Math.min(1, 12 * step);
      vx += (broom.vx * PUSH_GAIN - vx) * blend + (rand() - 0.5) * 2;
      vy += (broom.vy * PUSH_GAIN * 0.5 - vy) * blend + (rand() - 0.5) * 2;
      spin = clamp(vx * 3, -240, 240);
    }
    const drag = Math.exp(-FRICTION * step);
    return {
      ...leaf,
      x: clamp(leaf.x + vx * step, 0, 100),
      y: clamp(leaf.y + vy * step, GROUND_TOP, GROUND_BOTTOM),
      vx: vx * drag,
      vy: vy * drag,
      spin: spin * drag,
      rot: leaf.rot + spin * step,
    };
  });
  let next = absorb(world, moved);
  next = { ...next, marks: stepMarks(world.marks, broom, step, sweeping) };
  const spawnIn = next.spawnIn - step;
  return spawnIn > 0 ? { ...next, spawnIn } : { ...spawnLeaf(next, rand), spawnIn: SPAWN_SECONDS * (0.6 + rand() * 0.8) };
}

/** Reduced motion: one arrow press moves every landed leaf in reach one discrete hop. */
export function relocateLeaves(world: World, fromX: number, dir: -1 | 1): World {
  const reach = KEY_STEP * 1.5;
  const hopped = world.leaves.map((leaf): Leaf => {
    if (!leaf.landed || Math.abs(leaf.x - fromX) > reach) return leaf;
    return { ...leaf, x: clamp(leaf.x + dir * KEY_STEP, 0, 100) };
  });
  const toPile = hopped.map((leaf): Leaf => (leaf.landed && Math.abs(leaf.x - PILE.x) < KEY_STEP && Math.abs(leaf.y - PILE.y) < 14 ? { ...leaf, x: PILE.x, y: PILE.y } : leaf));
  return absorb(world, toPile);
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

/** Whether a sweep sound may play now; lastCueAt is null before the first one. */
export function canCue(now: number, lastCueAt: number | null, interval: number = CUE_INTERVAL_MS): boolean {
  return lastCueAt === null || now - lastCueAt >= interval;
}
