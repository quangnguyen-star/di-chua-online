import type { Container, Filter, Graphics, Sprite, Texture } from "pixi.js";
import {
  bakeCrackle, bakeDot, bakeLotusLantern, bakeSky, bakeUmbrellaTree, bakeWater,
  HORIZON_Y, LOTUS_COLOR_NAMES, rng, WORLD_H, WORLD_W, type LotusColor,
} from "../art.ts";
import type { LanternColor } from "../../lantern/bake.ts";
import { addGoldenMoon, addGoldRidges, makeBoat, makeLilyPads } from "./common.ts";
import { bakeBankStrip, bakeBoatman, bakeLitTamQuan, bakeReeds, GATE_H, GATE_W } from "./pond.art.ts";
import { lanternCount } from "../lighting.ts";
import { createWaterFilter } from "../waterFilter.ts";
import type { PlaceScene, PondApi, SceneContext, SceneInstance } from "./types.ts";

const MAX_PARTICLES = 24;
const MAX_LANTERNS = 14;
const MAX_LANTERNS_LOW = 8;
const MAX_ZOOM_OUT = 0.12;
const MAX_RINGS = 6;
const RING_S = 1.4;
const FIELD_COLORS = LOTUS_COLOR_NAMES;
/** The flow's colour names map onto the shared lotus colours; the visitor's lantern is the same motif, just brighter and closer. */
const LOTUS_OF: Record<LanternColor, LotusColor> = {
  pink: "pink", gold: "yellow", white: "white", red: "red", violet: "purple", blue: "blue", green: "green",
};
const LOTUS_HEX: Record<LotusColor, string> = { pink: "#ffb3c4", yellow: "#ffd36b", white: "#fff6e0", purple: "#ba8cec",
  red: "#ff7864", blue: "#82b4ff", green: "#96e6a0",
};
/** Where the still shows its lotus lanterns, in world pixels (colour, x, y). */
const FIELD_SPOTS: readonly (readonly [LotusColor, number, number])[] = [
  ["yellow", 438, 448], ["white", 436, 492], ["pink", 243, 497], ["pink", 177, 456], ["purple", 576, 512], ["pink", 660, 450],
];
/** Umbrella trees from the still: [x, scale] standing on the bank. */
const TREES: readonly (readonly [number, number])[] = [[62, 2.3], [412, 1], [818, 1.5], [900, 1.9]];
/** Reflection strokes: [dy, half-width, dx] from the lantern, each one shorter and offset so the column reads as broken water. */
const REFLECTION_BREAKS: readonly (readonly [number, number, number])[] = [[0, 12, 0], [9, 9, -4], [19, 7, 5], [31, 5, -3]];

interface Lantern { box: Container; reflection: Container; baseY: number; speed: number; phase: number; x: number }
interface Ring { g: Graphics; age: number }
interface Mote { sprite: Sprite; x: number; y: number; vx: number; vy: number; phase: number }

export const pondLayers = [
  "sky", "moon", "ridges", "mist", "bank-and-gate", "umbrella-trees", "water", "lily-pads", "boat", "lanterns", "reeds", "motes", "wash", "crackle",
] as const;

/** The river: the only scene with water, lotus lanterns, lily pads and motes. The lantern flow drives it through PondApi; it draws, React keeps the clock. */
function buildPond(ctx: SceneContext): SceneInstance {
  const { pixi, palette: p, options: o } = ctx;
  ctx.layer("sky", new pixi.Sprite(ctx.tex(bakeSky(p, HORIZON_Y))));

  addGoldenMoon(ctx, 697, 142);
  addGoldRidges(ctx, HORIZON_Y);

  ctx.layer("mist", new pixi.Graphics().rect(0, HORIZON_Y - 150, WORLD_W, 150).fill({ color: 0xfbf0d8, alpha: p.mist * 0.35 }));

  const bank = new pixi.Container();
  const strip = new pixi.Sprite(ctx.tex(bakeBankStrip(WORLD_W)));
  strip.y = HORIZON_Y - 6;
  const gateTex = ctx.tex(bakeLitTamQuan());
  const gate = new pixi.Sprite(gateTex);
  gate.position.set(60, HORIZON_Y - GATE_H + 2);
  const gateGlow = new pixi.Sprite(ctx.tex(bakeDot()));
  gateGlow.anchor.set(0.5);
  gateGlow.blendMode = "add";
  gateGlow.tint = 0xffb050;
  gateGlow.alpha = 0.5;
  gateGlow.scale.set(11, 9);
  gateGlow.position.set(60 + GATE_W / 2, HORIZON_Y - 50);
  bank.addChild(strip, gateGlow, gate);
  ctx.layer("bank-and-gate", bank);

  const treeBox = new pixi.Container();
  const treeTex = [ctx.tex(bakeUmbrellaTree(3)), ctx.tex(bakeUmbrellaTree(8))];
  TREES.forEach(([x, scale], i) => {
    const t = new pixi.Sprite(treeTex[i % treeTex.length]);
    t.anchor.set(0.5, 1);
    t.scale.set(scale);
    t.position.set(x, HORIZON_Y + 2);
    treeBox.addChild(t);
  });
  ctx.layer("umbrella-trees", treeBox);

  const waterBox = new pixi.Container();
  const water = new pixi.Sprite(ctx.tex(bakeWater(p, o.ram)));
  water.y = HORIZON_Y;
  waterBox.addChild(water);
  const gateReflection = new pixi.Sprite(gateTex);
  gateReflection.scale.y = -0.8;
  gateReflection.alpha = 0.32;
  gateReflection.position.set(60, HORIZON_Y + 6 + GATE_H * 0.8);
  waterBox.addChild(gateReflection);
  let waterFx: { filter: Filter; setTime(s: number): void } | null = createWaterFilter(pixi);
  waterBox.filters = [waterFx.filter];
  ctx.layer("water", waterBox);

  ctx.layer("lily-pads", (() => {
    const box = new pixi.Container();
    box.addChild(makeLilyPads(ctx, 8, { x: 40, y: HORIZON_Y + 30, w: WORLD_W - 80, h: 90 }, 61));
    const big = makeLilyPads(ctx, 5, { x: 20 / 1.8, y: (HORIZON_Y + 120) / 1.8, w: (WORLD_W - 40) / 1.8, h: 40 / 1.8 }, 77);
    big.scale.set(1.8);
    box.addChild(big);
    return box;
  })());

  const boat = makeBoat(ctx, 0, 0);
  const boatman = new pixi.Sprite(ctx.tex(bakeBoatman()));
  boatman.anchor.set(0.5, 1);
  boatman.position.set(-26, -2);
  boat.addChild(boatman);
  boat.scale.set(1.4);
  boat.position.set(800, HORIZON_Y + 56);
  ctx.layer("boat", boat);

  const lanternLayer = new pixi.Container();
  ctx.layer("lanterns", lanternLayer);
  ctx.layer("reeds", (() => {
    const box = new pixi.Container();
    const tex = ctx.tex(bakeReeds(60, 150));
    for (const [x, scale] of [[884, 1.2], [926, 1.5]] as const) {
      const r = new pixi.Sprite(tex);
      r.anchor.set(0.5, 1);
      r.scale.set(scale);
      r.position.set(x, WORLD_H + 4);
      box.addChild(r);
    }
    return box;
  })());
  const reflectionLayer = new pixi.Container();
  waterBox.addChild(reflectionLayer);
  const lanterns: Lantern[] = [];
  const rings: Ring[] = [];
  const maxLanterns = o.quality === "low" ? MAX_LANTERNS_LOW : MAX_LANTERNS;
  const rand = rng(5);
  let held: LanternColor | null = null;
  let lit = false;
  let drift = 1;

  const lotusTex = new Map<LotusColor, { body: Texture; glow: Texture }>();
  const lotus = (color: LotusColor) => {
    let t = lotusTex.get(color);
    if (!t) {
      const b = bakeLotusLantern(color);
      t = { body: ctx.tex(b.body), glow: ctx.tex(b.glow) };
      lotusTex.set(color, t);
    }
    return t;
  };

  /** Reflection: short horizontal strokes with gaps, so the water filter breaks them up instead of leaving a vertical line. */
  const makeReflection = (color: LotusColor, scale: number) => {
    const box = new pixi.Container();
    const g = new pixi.Graphics();
    REFLECTION_BREAKS.forEach(([dy, w, dx], i) => {
      g.ellipse(dx * scale, dy * scale, w * scale, 2.2 * scale).fill({ color: Number.parseInt(LOTUS_HEX[color].slice(1), 16), alpha: 0.42 - i * 0.07 });
    });
    box.addChild(g);
    return box;
  };

  const spawnLantern = (x: number, y: number, color: LotusColor, mine: boolean) => {
    const box = new pixi.Container();
    const scale = mine ? 1.3 : 0.95;
    const tex = lotus(color);
    const glow = new pixi.Sprite(tex.glow);
    glow.anchor.set(0.5);
    glow.blendMode = "add";
    glow.alpha = mine ? 1 : 0.7;
    glow.scale.set(mine ? 1.4 : 1);
    glow.position.set(0, -12);
    const body = new pixi.Sprite(tex.body);
    body.anchor.set(0.5, 1);
    body.alpha = mine ? 1 : 0.92;
    box.addChild(glow, body);
    box.scale.set(scale);
    box.position.set(x, y);
    lanternLayer.addChild(box);
    const reflection = makeReflection(color, scale);
    reflectionLayer.addChild(reflection);
    lanterns.push({ box, reflection, baseY: y, x, speed: 2 + rand() * 4, phase: rand() * 6.28 });
    while (lanterns.length > maxLanterns) {
      const old = lanterns.shift();
      old?.box.destroy({ children: true });
      old?.reflection.destroy({ children: true });
    }
  };
  const initial = Math.min(Math.max(FIELD_SPOTS.length, lanternCount(o.lighting, o.ram)), maxLanterns);
  for (let i = 0; i < initial; i++) {
    const spot = FIELD_SPOTS[i];
    if (spot) spawnLantern(spot[1], spot[2], spot[0], false);
    else spawnLantern(100 + rand() * (WORLD_W - 200), HORIZON_Y + 60 + rand() * 110, FIELD_COLORS[i % FIELD_COLORS.length], false);
  }

  const dotTex = ctx.tex(bakeDot());
  const motes: Mote[] = [];
  const motesLayer = new pixi.Container();
  const moteCount = Math.min(MAX_PARTICLES, o.quality === "low" ? Math.ceil(p.fireflies / 2) : p.fireflies);
  for (let i = 0; i < moteCount; i++) {
    const sprite = new pixi.Sprite(dotTex);
    sprite.anchor.set(0.5);
    sprite.blendMode = "add";
    sprite.scale.set(0.4 + rand() * 0.5);
    motesLayer.addChild(sprite);
    motes.push({ sprite, x: rand() * WORLD_W, y: 120 + rand() * 330, vx: (rand() - 0.5) * 6, vy: -1 - rand() * 3, phase: rand() * 6.28 });
  }
  ctx.layer("motes", motesLayer);

  const wash = new pixi.Graphics().rect(0, 0, WORLD_W, WORLD_H).fill({ color: Number.parseInt(p.wash.slice(1), 16), alpha: p.washAlpha });
  wash.blendMode = "add";
  ctx.layer("wash", wash);
  ctx.layer("crackle", new pixi.Sprite(ctx.tex(bakeCrackle())));

  let activeMotes = motes.length;

  const ringAt = (x: number, y: number) => {
    const g = new pixi.Graphics().ellipse(0, 0, 26, 8).stroke({ width: 1.5, color: 0xfff4dc, alpha: 0.8 });
    g.position.set(x, y);
    reflectionLayer.addChild(g);
    rings.push({ g, age: 0 });
    while (rings.length > MAX_RINGS) rings.shift()?.g.destroy();
    ctx.requestRender();
  };

  const lowerAt = (x: number, y: number) => {
    if (y < HORIZON_Y + 10 || y > WORLD_H - 10 || x < 0 || x > WORLD_W) return;
    ringAt(x, y);
    if (!held || !lit) return;
    spawnLantern(x, y, LOTUS_OF[held], true);
    held = null;
    lit = false;
    ctx.requestRender();
  };

  const pond: PondApi = {
    setLantern(color) {
      held = color !== null && color in LOTUS_OF ? (color as LanternColor) : null;
      lit = false;
    },
    light() {
      if (held) lit = true;
    },
    lower: lowerAt,
    ripple(clientX, clientY) {
      const [x, y] = ctx.toWorld(clientX, clientY);
      if (y >= HORIZON_Y + 10 && y <= WORLD_H - 10 && x >= 0 && x <= WORLD_W) ringAt(x, y);
    },
    setDrift(amount) {
      drift = Math.min(1, Math.max(0, amount));
    },
    pullBack(amount) {
      ctx.setZoom(1 - MAX_ZOOM_OUT * Math.min(1, Math.max(0, amount)));
    },
  };

  return {
    pond,
    tick(dt, time) {
      waterFx?.setTime(time);
      for (const l of lanterns) {
        l.x += l.speed * drift * dt;
        if (l.x > WORLD_W + 40) l.x = -40;
        const y = l.baseY + Math.sin(time * 0.9 + l.phase) * 1.5;
        l.box.position.set(l.x, y);
        l.reflection.position.set(l.x + Math.sin(time * 1.3 + l.phase) * 3, y + 14);
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.age += dt;
        const t = r.age / RING_S;
        if (t >= 1) {
          r.g.destroy();
          rings.splice(i, 1);
          continue;
        }
        r.g.scale.set(0.3 + t * 1.7);
        r.g.alpha = 1 - t;
      }
      for (let i = 0; i < activeMotes; i++) {
        const m = motes[i];
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.y < 60) m.y = HORIZON_Y + 80;
        if (m.x < 0) m.x = WORLD_W;
        if (m.x > WORLD_W) m.x = 0;
        m.sprite.position.set(m.x, m.y);
        m.sprite.alpha = 0.35 + 0.35 * Math.sin(time * 1.4 + m.phase);
      }
    },
    degrade() {
      if (activeMotes > 0) {
        activeMotes = Math.floor(activeMotes / 2);
        motes.forEach((m, i) => { m.sprite.visible = i < activeMotes; });
        return true;
      }
      if (waterFx) {
        waterBox.filters = [];
        waterFx.filter.destroy();
        waterFx = null;
        return true;
      }
      return false;
    },
    dispose() {
      waterFx?.filter.destroy();
      waterFx = null;
    },
  };
}

export const pondScene: PlaceScene = { horizon: HORIZON_Y, layers: pondLayers, build: buildPond };
