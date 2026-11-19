import type { Container, Graphics } from "pixi.js";
import { bakeCrackle, bakeGround, bakeOrb, bakeSky, WORLD_H, WORLD_W } from "../art.ts";
import type { PlaceScene, SceneContext, SceneInstance } from "./types.ts";

const HORIZON = 300;
const GROUND_TOP = "#4a3524";
const GROUND_BOTTOM = "#1a110b";
const VANISH_X = WORLD_W / 2;
const ROWS = 9;
const COLUMNS = 14;
const SWEEPERS = [
  { x: 250, phase: 0, robe: 0x8a5a2c },
  { x: 640, phase: 2.1, robe: 0x6b4a2a },
] as const;
const SWEEP_PERIOD = 3.2;

export const courtyardLayers = ["sky", "orb", "mist", "ground", "tiles", "sweepers", "wash", "crackle"] as const;

const reducedMotion = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Tile joints converging on the vanishing point: rows tighten toward the horizon, columns fan out from it. */
function drawTiles(g: Graphics): void {
  const depth = WORLD_H - HORIZON;
  for (let i = 1; i <= ROWS; i++) {
    const y = HORIZON + depth * Math.pow(i / ROWS, 2.2);
    g.moveTo(0, y).lineTo(WORLD_W, y);
  }
  for (let i = 0; i <= COLUMNS; i++) {
    const x = ((i / COLUMNS) * 2 - 0.5) * WORLD_W;
    g.moveTo(VANISH_X, HORIZON).lineTo(x * 1.9 - VANISH_X * 0.9, WORLD_H);
  }
  g.stroke({ color: 0x1a110b, width: 1.5, alpha: 0.55 });
}

/** One figure bent over a broom: robe, head, handle and bristles drawn once; tick swings the whole container. */
function figure(ctx: SceneContext, robe: number): Container {
  const { pixi } = ctx;
  const box = new pixi.Container();
  const body = new pixi.Graphics()
    .ellipse(0, 6, 15, 5).fill({ color: 0x000000, alpha: 0.3 })
    .roundRect(-7, -34, 14, 36, 6).fill({ color: robe })
    .circle(0, -40, 6).fill({ color: 0xd9b48a })
    .moveTo(6, -24).lineTo(24, 4).stroke({ color: 0x7a5a36, width: 2.5 })
    .roundRect(18, 2, 12, 5, 2).fill({ color: 0xa68242 });
  box.addChild(body);
  return box;
}

/** The courtyard: a perspective tiled floor and two figures sweeping on a loop behind the interaction band. */
function buildCourtyard(ctx: SceneContext): SceneInstance {
  const { pixi, palette: p, options: o } = ctx;
  ctx.layer("sky", new pixi.Sprite(ctx.tex(bakeSky(p, HORIZON))));

  const orbs = new pixi.Container();
  const addOrb = (kind: "sun" | "moon", x: number, y: number) => {
    const s = new pixi.Sprite(ctx.tex(bakeOrb(kind, p.haloAlpha)));
    s.anchor.set(0.5);
    s.position.set(x, y);
    orbs.addChild(s);
  };
  if (p.orb === "moon") addOrb("moon", 700, HORIZON - 250);
  else if (p.orb === "sun") addOrb("sun", 700, HORIZON - 200);
  if (o.ram && p.orb !== "moon") addOrb("moon", 840, HORIZON - 280);
  ctx.depthLayer("orb", orbs, 0.05);

  ctx.layer("mist", new pixi.Graphics().rect(0, HORIZON - 120, WORLD_W, 120).fill({ color: 0xfbf0d8, alpha: p.mist * 0.3 }));

  const ground = new pixi.Sprite(ctx.tex(bakeGround(HORIZON, GROUND_TOP, GROUND_BOTTOM)));
  ground.y = HORIZON;
  ctx.layer("ground", ground);
  const tiles = new pixi.Graphics();
  drawTiles(tiles);
  ctx.layer("tiles", tiles);

  const sweepers = new pixi.Container();
  const figures = SWEEPERS.map((s) => {
    const f = figure(ctx, s.robe);
    f.position.set(s.x, HORIZON + 26);
    f.scale.set(0.8);
    sweepers.addChild(f);
    return { node: f, ...s };
  });
  ctx.layer("sweepers", sweepers);

  const wash = new pixi.Graphics().rect(0, 0, WORLD_W, WORLD_H).fill({ color: Number.parseInt(p.wash.slice(1), 16), alpha: p.washAlpha });
  wash.blendMode = "add";
  ctx.layer("wash", wash);
  ctx.layer("crackle", new pixi.Sprite(ctx.tex(bakeCrackle())));

  const still = reducedMotion();
  const pose = (time: number) => {
    for (const f of figures) {
      const t = still ? 0 : Math.sin(((time + f.phase) / SWEEP_PERIOD) * Math.PI * 2);
      f.node.x = f.x + t * 22;
      f.node.rotation = t * 0.08;
      f.node.scale.x = still || Math.cos(((time + f.phase) / SWEEP_PERIOD) * Math.PI * 2) >= 0 ? 0.8 : -0.8;
    }
  };
  pose(0);

  return {
    tick(_dt, time) {
      if (!still) pose(time);
    },
  };
}

/** Courtyard scene, owned by the sweeping stop. */
export const courtyardScene: PlaceScene = {
  horizon: HORIZON,
  layers: courtyardLayers,
  backdrop: { horizon: HORIZON, groundTop: GROUND_TOP, groundBottom: GROUND_BOTTOM, edge: "#a98456" },
  build: buildCourtyard,
};
