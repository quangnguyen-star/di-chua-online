import type { Container } from "pixi.js";
import {
  bakeBoat, bakeGoldenMoon, bakeGoldRidge, bakeHangingLantern, bakeLilyPad, bakeLotusLantern, bakeSkyline, bakeUmbrellaTree,
  HORIZON_Y, LOTUS_COLOR_NAMES, rng, WORLD_W, type LotusColor,
} from "../art.ts";
import type { SceneContext } from "./types.ts";

/**
 * Shared stage motifs for the six stop scenes.
 *
 * Two kinds of helper, by where they may be used:
 *  - add*  (any place): registers a named layer on the context, so it shows up in SceneHandle.layers().
 *    The place must also list that name in its PlaceScene.layers. Names avoid the river-only words
 *    (lantern|water|lily|mote|bank|hill) on purpose.
 *  - make* (pond only): river motifs. They return a Container and register nothing; only the pond
 *    scene may pass the result to ctx.layer, with a river-only name.
 *
 * Counts are capped here, and halved on quality "low", so a scene cannot ask for an unbounded number of sprites.
 */

export const MOTIF_LAYERS = {
  moon: "moon",
  ridges: "ridges",
  umbrellaTrees: "umbrella-trees",
  hangingLamps: "hanging-lamps",
  skyline: "skyline",
} as const;

export const MAX_TREES = 8;
export const MAX_HANGING_LAMPS = 12;
export const MAX_LOTUS_LANTERNS = 14;
export const MAX_LILY_PADS = 16;

const cap = (ctx: SceneContext, n: number, max: number): number => Math.max(0, Math.min(Math.floor(n), ctx.options.quality === "low" ? Math.ceil(max / 2) : max));

/** Large golden moon with halo at world (x, y); layer "moon", barely parallaxed. */
export function addGoldenMoon(ctx: SceneContext, x: number, y: number): void {
  const s = new ctx.pixi.Sprite(ctx.tex(bakeGoldenMoon(Math.max(0.35, ctx.palette.haloAlpha))));
  s.anchor.set(0.5);
  s.position.set(x, y);
  ctx.depthLayer(MOTIF_LAYERS.moon, s, 0.05);
}

/** Two gold-edged mountain ridges (far, then near) rising from `horizon`; one layer "ridges" with the far ridge drifting slower. */
export function addGoldRidges(ctx: SceneContext, horizon = HORIZON_Y): void {
  const { pixi, palette: p } = ctx;
  const box = new pixi.Container();
  const far = new pixi.Sprite(ctx.tex(bakeGoldRidge(p.farMountain, horizon - 36, 130, 11, horizon)));
  const near = new pixi.Sprite(ctx.tex(bakeGoldRidge(p.midMountain, horizon - 8, 90, 29, horizon)));
  box.addChild(far, near);
  ctx.depthLayer(MOTIF_LAYERS.ridges, box, 0.2, -40);
}

/** Up to MAX_TREES umbrella-tree silhouettes standing on `groundY` at the given x positions; layer "umbrella-trees". */
export function addUmbrellaTrees(ctx: SceneContext, groundY: number, xs: readonly number[]): void {
  const { pixi } = ctx;
  const box = new pixi.Container();
  const tex = [ctx.tex(bakeUmbrellaTree(3)), ctx.tex(bakeUmbrellaTree(8))];
  xs.slice(0, cap(ctx, xs.length, MAX_TREES)).forEach((x, i) => {
    const s = new pixi.Sprite(tex[i % tex.length]);
    s.anchor.set(0.5, 1);
    s.position.set(x, groundY);
    box.addChild(s);
  });
  ctx.depthLayer(MOTIF_LAYERS.umbrellaTrees, box, 0.4);
}

/** Red hanging lanterns with additive glow, hung from `y` at the given xs (capped at MAX_HANGING_LAMPS); layer "hanging-lamps". */
export function addHangingLamps(ctx: SceneContext, y: number, xs: readonly number[]): void {
  const { pixi } = ctx;
  const { body, glow } = bakeHangingLantern();
  const bodyTex = ctx.tex(body);
  const glowTex = ctx.tex(glow);
  const box = new pixi.Container();
  for (const x of xs.slice(0, cap(ctx, xs.length, MAX_HANGING_LAMPS))) {
    const g = new pixi.Sprite(glowTex);
    g.anchor.set(0.5);
    g.position.set(x, y + 50);
    g.blendMode = "add";
    const b = new pixi.Sprite(bodyTex);
    b.anchor.set(0.5, 0);
    b.position.set(x, y);
    box.addChild(g, b);
  }
  ctx.layer(MOTIF_LAYERS.hangingLamps, box);
}

/** Lit-window skyline strip standing on `groundY`, spanning the world width; layer "skyline". `windows` is capped. */
export function addSkyline(ctx: SceneContext, groundY: number, maxHeight = 120, seed = 17, windows = 80): void {
  const s = new ctx.pixi.Sprite(ctx.tex(bakeSkyline(seed, WORLD_W, maxHeight, ctx.options.quality === "low" ? windows / 2 : windows)));
  s.y = groundY - maxHeight;
  ctx.depthLayer(MOTIF_LAYERS.skyline, s, 0.35);
}

/** Pond only. Lotus lanterns in the four colours (pink, yellow, white, purple), cycling through `colors`, each with a glow. */
export function makeLotusLanterns(ctx: SceneContext, spots: readonly (readonly [number, number])[], colors: readonly LotusColor[] = LOTUS_COLOR_NAMES): Container {
  const { pixi } = ctx;
  const baked = new Map<LotusColor, { body: ReturnType<typeof ctx.tex>; glow: ReturnType<typeof ctx.tex> }>();
  const box = new pixi.Container();
  spots.slice(0, cap(ctx, spots.length, MAX_LOTUS_LANTERNS)).forEach(([x, y], i) => {
    const color = colors[i % colors.length];
    let t = baked.get(color);
    if (!t) {
      const b = bakeLotusLantern(color);
      t = { body: ctx.tex(b.body), glow: ctx.tex(b.glow) };
      baked.set(color, t);
    }
    const g = new pixi.Sprite(t.glow);
    g.anchor.set(0.5);
    g.position.set(x, y - 12);
    g.blendMode = "add";
    const b = new pixi.Sprite(t.body);
    b.anchor.set(0.5, 1);
    b.position.set(x, y);
    box.addChild(g, b);
  });
  return box;
}

/** Pond only. Lily pads scattered deterministically inside the rectangle, capped at MAX_LILY_PADS. */
export function makeLilyPads(ctx: SceneContext, count: number, area: { x: number; y: number; w: number; h: number }, seed = 61): Container {
  const { pixi } = ctx;
  const tex = ctx.tex(bakeLilyPad());
  const rand = rng(seed);
  const box = new pixi.Container();
  for (let i = 0; i < cap(ctx, count, MAX_LILY_PADS); i++) {
    const s = new pixi.Sprite(tex);
    s.anchor.set(0.5);
    s.position.set(area.x + rand() * area.w, area.y + rand() * area.h);
    s.scale.set(0.6 + rand() * 0.6, 0.6 + rand() * 0.6);
    box.addChild(s);
  }
  return box;
}

/** Pond only. One small boat with its waterline at (x, y). */
export function makeBoat(ctx: SceneContext, x: number, y: number): Container {
  const box = new ctx.pixi.Container();
  const s = new ctx.pixi.Sprite(ctx.tex(bakeBoat()));
  s.anchor.set(0.5, 0.8);
  s.position.set(x, y);
  box.addChild(s);
  return box;
}
