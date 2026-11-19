/** Courtyard leaf physics. Coordinates are percentages of the yard (0-100), speeds are percent per second. */

export interface Leaf {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  landed: boolean;
}

export interface World {
  leaves: Leaf[];
  /** Leaves gathered into the pile so far, capped at PILE_CAP; drives the pile's size only. */
  pile: number;
  nextId: number;
  /** Seconds until the next leaf falls. */
  spawnIn: number;
}

export interface Broom {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Hard cap on live leaves; new ones stop falling while the yard is this full. */
export const LEAF_CAP = 14;
export const PILE = { x: 88, y: 84 } as const;
export const PILE_CAP = 20;
export const BRUSH_RADIUS = 11;
/** Below this broom speed leaves are gathered; above FAST_SPEED they are scattered; between, they stay put. */
export const SLOW_SPEED = 45;
export const FAST_SPEED = 110;
export const CUE_INTERVAL_MS = 400;
export const SPAWN_SECONDS = 1.4;
/** Where leaves land, as a band of the yard's height. */
export const GROUND_TOP = 58;
export const GROUND_BOTTOM = 94;
/** Horizontal distance a leaf jumps per arrow press when motion is reduced, and how far the broom reaches. */
export const KEY_STEP = 16;
/** Broom speed a held arrow key applies: slow enough to gather. */
export const KEY_SPEED = 30;
const FALL_SPEED = 14;
const DRIFT = 4;
const PILE_REACH = 6;
const GATHER_PULL = 26;
const SCATTER_KICK = 1.1;
const FRICTION = 2.2;

export const freshWorld: World = { leaves: [], pile: 0, nextId: 1, spawnIn: 0.4 };

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export type Rand = () => number;

/** A new leaf at the top edge, or the world unchanged while the cap is reached. */
export function spawnLeaf(world: World, rand: Rand): World {
  if (world.leaves.length >= LEAF_CAP) return world;
  const leaf: Leaf = { id: world.nextId, x: 4 + rand() * 80, y: -4, vx: (rand() - 0.5) * DRIFT, vy: FALL_SPEED * (0.7 + rand() * 0.6), rot: rand() * 360, landed: false };
  return { ...world, leaves: [...world.leaves, leaf], nextId: world.nextId + 1 };
}

/** A leaf already lying on the ground: how leaves arrive when motion is reduced. */
export function settleLeaf(world: World, rand: Rand): World {
  const next = spawnLeaf(world, rand);
  if (next === world) return world;
  const leaves = next.leaves.slice();
  const last = leaves[leaves.length - 1];
  leaves[leaves.length - 1] = { ...last, y: GROUND_TOP + rand() * (GROUND_BOTTOM - GROUND_TOP - 12), vx: 0, vy: 0, landed: true };
  return { ...next, leaves };
}

const inPile = (leaf: Leaf) => Math.hypot(leaf.x - PILE.x, (leaf.y - PILE.y) * 1.6) < PILE_REACH;

function absorb(world: World, leaves: Leaf[]): World {
  const kept = leaves.filter((l) => !inPile(l));
  const gathered = leaves.length - kept.length;
  return { ...world, leaves: kept, pile: Math.min(PILE_CAP, world.pile + gathered) };
}

/**
 * Advances the yard by dt seconds. Landed leaves near the broom follow it toward the pile when it moves slowly
 * and are flung away when it moves fast; falling leaves ignore the broom.
 */
export function stepWorld(world: World, broom: Broom, dt: number, rand: Rand): World {
  const step = Math.min(dt, 0.05);
  const speed = Math.hypot(broom.vx, broom.vy);
  const moved = world.leaves.map((leaf): Leaf => {
    if (!leaf.landed) {
      const y = leaf.y + leaf.vy * step;
      const x = clamp(leaf.x + leaf.vx * step, 0, 100);
      const ground = GROUND_TOP + ((leaf.id * 37) % 100) / 100 * (GROUND_BOTTOM - GROUND_TOP - 12);
      return y >= ground ? { ...leaf, x, y: ground, vx: 0, vy: 0, landed: true } : { ...leaf, x, y, rot: leaf.rot + 40 * step };
    }
    const near = Math.hypot(leaf.x - broom.x, (leaf.y - broom.y) * 1.6) < BRUSH_RADIUS;
    let { vx, vy } = leaf;
    if (near && speed >= FAST_SPEED) {
      const dx = leaf.x - broom.x;
      const dy = leaf.y - broom.y;
      const len = Math.hypot(dx, dy) || 1;
      vx = (dx / len) * speed * SCATTER_KICK + (rand() - 0.5) * 30;
      vy = (dy / len) * speed * SCATTER_KICK * 0.5 + (rand() - 0.5) * 20;
    } else if (near && speed > 4 && speed < SLOW_SPEED) {
      const dx = PILE.x - leaf.x;
      const dy = PILE.y - leaf.y;
      const len = Math.hypot(dx, dy) || 1;
      vx = broom.vx * 0.6 + (dx / len) * GATHER_PULL;
      vy = broom.vy * 0.6 + (dy / len) * GATHER_PULL;
    }
    const drag = Math.exp(-FRICTION * step);
    return {
      ...leaf,
      x: clamp(leaf.x + vx * step, 0, 100),
      y: clamp(leaf.y + vy * step, GROUND_TOP, GROUND_BOTTOM),
      vx: vx * drag,
      vy: vy * drag,
      rot: leaf.rot + (Math.abs(vx) + Math.abs(vy)) * step,
    };
  });
  let next = absorb(world, moved);
  const spawnIn = next.spawnIn - step;
  next = spawnIn > 0 ? { ...next, spawnIn } : { ...spawnLeaf(next, rand), spawnIn: SPAWN_SECONDS * (0.6 + rand() * 0.8) };
  return next;
}

/** Reduced motion: one arrow press moves every landed leaf in reach one discrete hop toward the pile. */
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
