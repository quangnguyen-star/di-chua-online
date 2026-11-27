import { bakeBoat, bakeLilyPad, bakeLotusLantern, bakeSky, rng, WORLD_H, WORLD_W, bakeCrackle, bakeGround } from "../art.ts";
import { addGoldenMoon, addGoldRidges } from "./common.ts";
import { bakeCup, bakeRailing, bakeTable, bakeTeapot, bakeWindowFrame, VERANDA } from "./veranda.art.ts";
import type { BackdropSpec, PlaceScene, SceneContext, SceneInstance } from "./types.ts";

const HORIZON = VERANDA.horizon;
const RAIN_DROPS = 46;
const RAIN_SLANT = 0.22;
const RAIN_TOP = 60;
const PADS = [[130, 392], [210, 440], [330, 372], [600, 410], [760, 384], [880, 372], [90, 462], [690, 452]] as const;
const CANDLES = [[262, 424, "yellow"], [730, 418, "pink"], [820, 402, "white"], [455, 392, "yellow"]] as const;

const spec: BackdropSpec = { horizon: HORIZON, groundTop: "#2a1a14", groundBottom: "#120a07", edge: "#b8863c" };

export const verandaLayers = [
  "sky", "moon", "ridges", "mist", "ground", "pads", "candles", "boat", "window-frame",
  "table", "teapot", "cup", "railing", "rain", "wash", "crackle",
] as const;

interface Drop { line: { position: { set(x: number, y: number): void } }; x: number; y: number; speed: number }

/**
 * The veranda, laid out to match art/stops/veranda.jpg: a window onto mountains and a moon, a lotus pond with pads,
 * floating candles and a boat, then the low table with its teapot and cup, the railing and rain. The steam over the
 * cup is the shared Smoke drawn by the activity overlay, which is lined up over the painted teapot and cup.
 */
function buildVeranda(ctx: SceneContext): SceneInstance {
  const { pixi, palette: p, options: o } = ctx;
  ctx.layer("sky", new pixi.Sprite(ctx.tex(bakeSky(p, HORIZON))));
  addGoldenMoon(ctx, 700, 158);
  addGoldRidges(ctx, HORIZON);
  ctx.layer("mist", new pixi.Graphics().rect(0, HORIZON - 120, WORLD_W, 120).fill({ color: 0xfbf0d8, alpha: p.mist * 0.3 }));

  const ground = new pixi.Sprite(ctx.tex(bakeGround(HORIZON, spec.groundTop, spec.groundBottom)));
  ground.y = HORIZON;
  ctx.layer("ground", ground);

  const padTex = ctx.tex(bakeLilyPad());
  const pads = new pixi.Container();
  const quality = o.quality === "low" ? Math.ceil(PADS.length / 2) : PADS.length;
  PADS.slice(0, quality).forEach(([x, y], i) => {
    const s = new pixi.Sprite(padTex);
    s.anchor.set(0.5);
    s.position.set(x, y);
    s.scale.set(0.9 + (i % 3) * 0.25, 0.8 + (i % 2) * 0.2);
    pads.addChild(s);
  });
  ctx.layer("pads", pads);

  const candles = new pixi.Container();
  const baked = new Map<string, { body: ReturnType<typeof ctx.tex>; glow: ReturnType<typeof ctx.tex> }>();
  CANDLES.slice(0, o.quality === "low" ? 2 : CANDLES.length).forEach(([x, y, color]) => {
    let t = baked.get(color);
    if (!t) {
      const b = bakeLotusLantern(color);
      t = { body: ctx.tex(b.body), glow: ctx.tex(b.glow) };
      baked.set(color, t);
    }
    const g = new pixi.Sprite(t.glow);
    g.anchor.set(0.5);
    g.position.set(x, y - 10);
    g.blendMode = "add";
    const b = new pixi.Sprite(t.body);
    b.anchor.set(0.5, 1);
    b.scale.set(0.6);
    b.position.set(x, y);
    candles.addChild(g, b);
  });
  ctx.layer("candles", candles);

  const boat = new pixi.Sprite(ctx.tex(bakeBoat()));
  boat.anchor.set(0.5, 0.8);
  boat.position.set(676, 364);
  boat.scale.set(0.8);
  ctx.layer("boat", boat);

  ctx.layer("window-frame", new pixi.Sprite(ctx.tex(bakeWindowFrame())));

  const table = new pixi.Sprite(ctx.tex(bakeTable()));
  table.position.set(VERANDA.tableX, VERANDA.tableTop);
  ctx.layer("table", table);
  const teapot = new pixi.Sprite(ctx.tex(bakeTeapot()));
  teapot.anchor.set(0.5, 1);
  teapot.position.set(VERANDA.potX, VERANDA.setBase);
  ctx.layer("teapot", teapot);
  const cup = new pixi.Sprite(ctx.tex(bakeCup()));
  cup.anchor.set(0.5, 1);
  cup.position.set(VERANDA.cupX, VERANDA.setBase);
  ctx.layer("cup", cup);

  const railing = new pixi.Sprite(ctx.tex(bakeRailing()));
  railing.y = VERANDA.railTop;
  ctx.layer("railing", railing);

  const rainLayer = new pixi.Container();
  ctx.layer("rain", rainLayer);
  const rand = rng(11);
  const total = o.quality === "low" ? Math.ceil(RAIN_DROPS / 2) : RAIN_DROPS;
  const drops: Drop[] = [];
  for (let i = 0; i < total; i++) {
    const line = new pixi.Graphics().moveTo(0, 0).lineTo(RAIN_SLANT * 18, 18).stroke({ color: 0xdcf0f5, width: 1, alpha: 0.35 });
    const drop = { line, x: rand() * WORLD_W, y: RAIN_TOP + rand() * (WORLD_H - RAIN_TOP), speed: 260 + rand() * 160 };
    line.position.set(drop.x, drop.y);
    rainLayer.addChild(line);
    drops.push(drop);
  }
  let active = drops.length;
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wash = new pixi.Graphics().rect(0, 0, WORLD_W, WORLD_H).fill({ color: Number.parseInt(p.wash.slice(1), 16), alpha: p.washAlpha });
  wash.blendMode = "add";
  ctx.layer("wash", wash);
  ctx.layer("crackle", new pixi.Sprite(ctx.tex(bakeCrackle())));

  return {
    tick(dt) {
      if (reduced) return;
      for (let i = 0; i < active; i++) {
        const d = drops[i];
        d.y += d.speed * dt;
        d.x += d.speed * RAIN_SLANT * dt;
        if (d.y > WORLD_H) {
          d.y = RAIN_TOP;
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

/** Owned by the veranda stop (DCO-84). */
export const verandaScene: PlaceScene = { horizon: HORIZON, layers: verandaLayers, backdrop: spec, build: buildVeranda };
