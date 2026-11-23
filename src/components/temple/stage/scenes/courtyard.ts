import type { Container, Graphics } from "pixi.js";
import { bakeCrackle, bakeGround, bakeSky, rng, WORLD_H, WORLD_W } from "../art.ts";
import { bakeBanyan, bakeFallenLeaf, bakeMainHall, bakePlanter, bakeStandingBroom, HALL_H, HALL_LAMP_XS, HALL_W } from "./courtyard.art.ts";
import { addGoldenMoon, addHangingLamps, MOTIF_LAYERS } from "./common.ts";
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

const BANYANS = [{ x: 120, seed: 5 }, { x: 830, seed: 9 }] as const;
const PLANTER_Y = 372;
const LEAF_TINTS = ["#d79a3c", "#b5532a", "#c9b037", "#8a5a1c"] as const;
const DRIFT_LEAVES = 14;

export const courtyardLayers = [
  "sky", MOTIF_LAYERS.moon, "mist", "hall", MOTIF_LAYERS.hangingLamps, "ground", "tiles", "banyans", "planters", "fallen-leaves", "broom",
  "sweepers", "drifting-leaves", "wash", "crackle",
] as const;

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
  const { pixi, palette: p } = ctx;
  ctx.layer("sky", new pixi.Sprite(ctx.tex(bakeSky(p, HORIZON))));

  addGoldenMoon(ctx, 700, 110);

  ctx.layer("mist", new pixi.Graphics().rect(0, HORIZON - 120, WORLD_W, 120).fill({ color: 0xfbf0d8, alpha: p.mist * 0.3 }));

  const hall = new pixi.Sprite(ctx.tex(bakeMainHall()));
  hall.anchor.set(0.5, 1);
  hall.position.set(WORLD_W / 2, HORIZON);
  ctx.layer("hall", hall);
  addHangingLamps(ctx, HORIZON - HALL_H + 71, HALL_LAMP_XS.map((x) => WORLD_W / 2 - HALL_W / 2 + x));

  const ground = new pixi.Sprite(ctx.tex(bakeGround(HORIZON, GROUND_TOP, GROUND_BOTTOM)));
  ground.y = HORIZON;
  ctx.layer("ground", ground);
  const tiles = new pixi.Graphics();
  drawTiles(tiles);
  ctx.layer("tiles", tiles);

  const banyans = new pixi.Container();
  const planters = new pixi.Container();
  const fallen = new pixi.Container();
  const rand = rng(23);
  BANYANS.forEach((b, i) => {
    const tree = new pixi.Sprite(ctx.tex(bakeBanyan(b.seed)));
    tree.anchor.set(0.5, 1);
    tree.position.set(b.x, PLANTER_Y);
    banyans.addChild(tree);
    const planter = new pixi.Sprite(ctx.tex(bakePlanter(b.seed)));
    planter.anchor.set(0.5);
    planter.position.set(b.x, PLANTER_Y);
    planters.addChild(planter);
    for (let k = 0; k < 6; k++) {
      const leaf = new pixi.Sprite(ctx.tex(bakeFallenLeaf(k + i, LEAF_TINTS[k % LEAF_TINTS.length])));
      leaf.anchor.set(0.5);
      leaf.position.set(b.x + (rand() - 0.5) * 220, PLANTER_Y + 10 + rand() * 50);
      leaf.rotation = rand() * Math.PI;
      fallen.addChild(leaf);
    }
  });
  ctx.layer("banyans", banyans);
  ctx.layer("planters", planters);
  ctx.layer("fallen-leaves", fallen);

  const broom = new pixi.Sprite(ctx.tex(bakeStandingBroom()));
  broom.anchor.set(0.5, 1);
  broom.position.set(WORLD_W / 2, HORIZON + 40);
  broom.scale.set(1.4);
  ctx.layer("broom", broom);

  const sweepers = new pixi.Container();
  const figures = SWEEPERS.map((s) => {
    const f = figure(ctx, s.robe);
    f.position.set(s.x, HORIZON + 26);
    f.scale.set(0.8);
    sweepers.addChild(f);
    return { node: f, ...s };
  });
  ctx.layer("sweepers", sweepers);

  const drifting = new pixi.Container();
  const driftCount = ctx.options.quality === "low" ? DRIFT_LEAVES / 2 : DRIFT_LEAVES;
  const drift = Array.from({ length: driftCount }, (_, i) => {
    const node = new pixi.Sprite(ctx.tex(bakeFallenLeaf(i, LEAF_TINTS[i % LEAF_TINTS.length])));
    node.anchor.set(0.5);
    drifting.addChild(node);
    return { node, x: rand() * WORLD_W, y: HORIZON - 40 + rand() * 160, speed: 8 + rand() * 10, phase: rand() * 6 };
  });
  ctx.layer("drifting-leaves", drifting);

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
  const driftTo = (time: number) => {
    for (const d of drift) {
      const t = still ? 0 : time;
      d.node.x = (d.x + t * d.speed) % WORLD_W;
      d.node.y = d.y + Math.sin(t * 0.8 + d.phase) * 6;
      d.node.rotation = still ? d.phase : t * 0.6 + d.phase;
    }
  };
  pose(0);
  driftTo(0);

  return {
    tick(_dt, time) {
      if (still) return;
      pose(time);
      driftTo(time);
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
