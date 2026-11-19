import { rng, WORLD_H, WORLD_W } from "../art.ts";
import { BACKDROP_LAYERS, buildBackdrop } from "./backdrop.ts";
import type { BackdropSpec, PlaceScene, SceneContext, SceneInstance } from "./types.ts";

const HORIZON = 350;
const RAIN_DROPS = 46;
const RAIN_SLANT = 0.22;

const spec: BackdropSpec = { horizon: HORIZON, groundTop: "#33201a", groundBottom: "#120a07", edge: "#b8863c" };

export const verandaLayers = [...BACKDROP_LAYERS, "pond-view", "roof", "rain"] as const;

interface Drop { line: { position: { set(x: number, y: number): void } }; x: number; y: number; speed: number }

/** The veranda: the shared backdrop, a still pond seen past the rail, the eave of the roof and slanting rain. */
function buildVeranda(ctx: SceneContext): SceneInstance {
  const { pixi, options: o } = ctx;
  const base = buildBackdrop(ctx, spec);

  const pondView = new pixi.Graphics();
  pondView.ellipse(WORLD_W * 0.5, HORIZON + 70, 300, 38).fill({ color: 0x2c4a52, alpha: 0.85 });
  pondView.ellipse(WORLD_W * 0.5, HORIZON + 66, 250, 26).fill({ color: 0x6f98a0, alpha: 0.35 });
  pondView.ellipse(WORLD_W * 0.3, HORIZON + 78, 26, 7).fill({ color: 0x3f7442, alpha: 0.9 });
  pondView.ellipse(WORLD_W * 0.66, HORIZON + 62, 20, 5).fill({ color: 0x3f7442, alpha: 0.9 });
  ctx.layer("pond-view", pondView);

  const roof = new pixi.Graphics();
  roof.rect(0, 0, WORLD_W, 58).fill({ color: 0x1a0f0a });
  roof.rect(0, 58, WORLD_W, 5).fill({ color: 0xb8863c, alpha: 0.7 });
  for (let x = 0; x < WORLD_W; x += 24) roof.rect(x, 0, 2, 58).fill({ color: 0x000000, alpha: 0.25 });
  ctx.layer("roof", roof);

  const rainLayer = new pixi.Container();
  ctx.layer("rain", rainLayer);
  const rand = rng(11);
  const total = o.quality === "low" ? Math.ceil(RAIN_DROPS / 2) : RAIN_DROPS;
  const drops: Drop[] = [];
  for (let i = 0; i < total; i++) {
    const line = new pixi.Graphics().moveTo(0, 0).lineTo(RAIN_SLANT * 18, 18).stroke({ color: 0xdcf0f5, width: 1, alpha: 0.35 });
    const drop = { line, x: rand() * WORLD_W, y: 60 + rand() * (WORLD_H - 60), speed: 260 + rand() * 160 };
    line.position.set(drop.x, drop.y);
    rainLayer.addChild(line);
    drops.push(drop);
  }
  let active = drops.length;
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return {
    tick(dt, time) {
      base.tick(dt, time);
      if (reduced) return;
      for (let i = 0; i < active; i++) {
        const d = drops[i];
        d.y += d.speed * dt;
        d.x += d.speed * RAIN_SLANT * dt;
        if (d.y > WORLD_H) {
          d.y = 60;
          d.x = rand() * WORLD_W;
        }
        d.line.position.set(d.x, d.y);
      }
    },
    degrade() {
      if (active <= 8) return false;
      active = Math.floor(active / 2);
      rainLayer.children.forEach((c, i) => { c.visible = i < active; });
      return true;
    },
  };
}

/** Owned by the veranda stop (DCO-68). */
export const verandaScene: PlaceScene = { horizon: HORIZON, layers: verandaLayers, backdrop: spec, build: buildVeranda };
