import { bakeCrackle, bakeGround, bakeSky, WORLD_H, WORLD_W } from "../art.ts";
import { addGoldenMoon, addGoldRidges, addHangingLamps, addUmbrellaTrees, MOTIF_LAYERS } from "./common.ts";
import {
  bakeFoliage, bakeStairs, bakeStoneLamp, bakeTamQuan, GATE_HORIZON, GATE_LAMP_XS, GATE_LAMP_Y, STAIR_LAMP_SPOTS, STAIRS, TAM_QUAN_AT,
} from "./gate.art.ts";
import type { PlaceScene, SceneContext, SceneInstance } from "./types.ts";

const GROUND_TOP = "#241510";
const GROUND_BOTTOM = "#0d0806";

/** Bottom to top. No river words (lantern, water, lily, mote, bank, hill) anywhere in these names. */
export const gateLayers = [
  "sky", MOTIF_LAYERS.moon, "mist", MOTIF_LAYERS.ridges, "ground", MOTIF_LAYERS.umbrellaTrees,
  "tam-quan", MOTIF_LAYERS.hangingLamps, "stairs", "stair-lamps", "foliage", "wash", "crackle",
] as const;

function buildGate(ctx: SceneContext): SceneInstance {
  const { pixi, palette: p } = ctx;
  ctx.layer("sky", new pixi.Sprite(ctx.tex(bakeSky(p, GATE_HORIZON))));
  if (p.orb !== "none") addGoldenMoon(ctx, 670, 130);
  ctx.layer("mist", new pixi.Graphics().rect(0, GATE_HORIZON - 120, WORLD_W, 120).fill({ color: 0xfbf0d8, alpha: p.mist * 0.3 }));
  addGoldRidges(ctx, GATE_HORIZON);

  const ground = new pixi.Sprite(ctx.tex(bakeGround(GATE_HORIZON, GROUND_TOP, GROUND_BOTTOM)));
  ground.y = GATE_HORIZON;
  ctx.layer("ground", ground);

  addUmbrellaTrees(ctx, GATE_HORIZON + 10, [200, 330, 640, 760]);

  const gate = new pixi.Sprite(ctx.tex(bakeTamQuan()));
  gate.position.set(TAM_QUAN_AT.x, TAM_QUAN_AT.y + 8);
  ctx.layer("tam-quan", gate);
  addHangingLamps(ctx, GATE_LAMP_Y, GATE_LAMP_XS);

  const stairs = new pixi.Sprite(ctx.tex(bakeStairs()));
  stairs.y = STAIRS.top;
  ctx.layer("stairs", stairs);

  const { body, glow } = bakeStoneLamp();
  const bodyTex = ctx.tex(body);
  const glowTex = ctx.tex(glow);
  const lamps = new pixi.Container();
  for (const [x, y] of STAIR_LAMP_SPOTS) {
    const g = new pixi.Sprite(glowTex);
    g.anchor.set(0.5);
    g.position.set(x, y - 34);
    g.blendMode = "add";
    const b = new pixi.Sprite(bodyTex);
    b.anchor.set(0.5, 1);
    b.position.set(x, y);
    lamps.addChild(g, b);
  }
  ctx.layer("stair-lamps", lamps);

  const foliage = new pixi.Container();
  const left = new pixi.Sprite(ctx.tex(bakeFoliage(false)));
  left.position.set(-30, WORLD_H - 200);
  const right = new pixi.Sprite(ctx.tex(bakeFoliage(true)));
  right.position.set(WORLD_W - 330, WORLD_H - 200);
  foliage.addChild(left, right);
  ctx.layer("foliage", foliage);

  const wash = new pixi.Graphics().rect(0, 0, WORLD_W, WORLD_H).fill({ color: Number.parseInt(p.wash.slice(1), 16), alpha: p.washAlpha });
  wash.blendMode = "add";
  ctx.layer("wash", wash);
  ctx.layer("crackle", new pixi.Sprite(ctx.tex(bakeCrackle())));

  return { tick() {} };
}

/** The gate: moon, gold-edged ridges, umbrella trees, a three-passage tam quan with hanging lamps, a long staircase and four lit stone lanterns. */
export const gateScene: PlaceScene = {
  horizon: GATE_HORIZON,
  layers: gateLayers,
  backdrop: { horizon: GATE_HORIZON, groundTop: GROUND_TOP, groundBottom: GROUND_BOTTOM, edge: "#c89a48" },
  build: buildGate,
};
