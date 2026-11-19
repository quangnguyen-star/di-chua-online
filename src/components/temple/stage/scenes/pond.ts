import type { Container, Filter, Sprite } from "pixi.js";
import {
  bakeBankAndGate, bakeCrackle, bakeDot, bakeFarMountains, bakeLantern, bakeMidMountains, bakeOrb, bakeSky, bakeWater,
  HORIZON_Y, rng, WORLD_H, WORLD_W,
} from "../art.ts";
import { lanternCount } from "../lighting.ts";
import { createWaterFilter } from "../waterFilter.ts";
import type { PlaceScene, PondApi, SceneContext, SceneInstance } from "./types.ts";

const MAX_PARTICLES = 24;
const MAX_LANTERNS = 14;
const MAX_LANTERNS_LOW = 8;
const MAX_ZOOM_OUT = 0.12;

interface Lantern { box: Container; baseY: number; speed: number; phase: number; x: number }
interface Mote { sprite: Sprite; x: number; y: number; vx: number; vy: number; phase: number }

export const pondLayers = ["sky", "orb", "far-hills", "mid-hills", "mist", "bank-and-gate", "water", "lanterns", "motes", "wash", "crackle"] as const;

/** The river: the only scene with water, lanterns, lily pads and motes. C4 builds the lantern flow on this file. */
function buildPond(ctx: SceneContext): SceneInstance {
  const { pixi, palette: p, options: o } = ctx;
  ctx.layer("sky", new pixi.Sprite(ctx.tex(bakeSky(p, HORIZON_Y))));

  const orbs = new pixi.Container();
  const addOrb = (kind: "sun" | "moon", x: number, y: number) => {
    const s = new pixi.Sprite(ctx.tex(bakeOrb(kind, p.haloAlpha)));
    s.anchor.set(0.5);
    s.position.set(x, y);
    orbs.addChild(s);
  };
  if (p.orb === "moon") addOrb("moon", 700, 120);
  else if (p.orb === "sun") addOrb("sun", 700, 170);
  if (o.ram && p.orb !== "moon") addOrb("moon", 840, 90);
  ctx.depthLayer("orb", orbs, 0.05);

  const far = new pixi.Sprite(ctx.tex(bakeFarMountains(p)));
  ctx.depthLayer("far-hills", far, 0.15, -40);
  const mid = new pixi.Sprite(ctx.tex(bakeMidMountains(p)));
  ctx.depthLayer("mid-hills", mid, 0.3, -40);

  ctx.layer("mist", new pixi.Graphics().rect(0, HORIZON_Y - 150, WORLD_W, 150).fill({ color: 0xfbf0d8, alpha: p.mist * 0.35 }));

  const gate = new pixi.Sprite(ctx.tex(bakeBankAndGate()));
  gate.y = HORIZON_Y - 40;
  ctx.depthLayer("bank-and-gate", gate, 0.5);

  const waterBox = new pixi.Container();
  const water = new pixi.Sprite(ctx.tex(bakeWater(p, o.ram)));
  water.y = HORIZON_Y;
  waterBox.addChild(water);
  let waterFx: { filter: Filter; setTime(s: number): void } | null = createWaterFilter(pixi);
  waterBox.filters = [waterFx.filter];
  ctx.layer("water", waterBox);

  const lanternTex = bakeLantern();
  const bodyTex = ctx.tex(lanternTex.body);
  const glowTex = ctx.tex(lanternTex.glow);
  const reflectionTex = ctx.tex(lanternTex.reflection);
  const lanternLayer = new pixi.Container();
  ctx.layer("lanterns", lanternLayer);
  const lanterns: Lantern[] = [];
  const maxLanterns = o.quality === "low" ? MAX_LANTERNS_LOW : MAX_LANTERNS;
  const rand = rng(5);
  let held: string | null = null;
  let lit = false;
  let drift = 1;

  const spawnLantern = (x: number, y: number, tint?: string) => {
    const box = new pixi.Container();
    const glow = new pixi.Sprite(glowTex);
    glow.anchor.set(0.5);
    glow.blendMode = "add";
    glow.position.set(0, -10);
    const reflection = new pixi.Sprite(reflectionTex);
    reflection.anchor.set(0.5, 0);
    reflection.position.set(0, 14);
    const body = new pixi.Sprite(bodyTex);
    body.anchor.set(0.5, 0.8);
    if (tint) body.tint = tint;
    box.addChild(reflection, glow, body);
    box.position.set(x, y);
    lanternLayer.addChild(box);
    lanterns.push({ box, baseY: y, x, speed: 2 + rand() * 4, phase: rand() * 6.28 });
    while (lanterns.length > maxLanterns) lanterns.shift()?.box.destroy({ children: true });
  };
  const initial = Math.min(lanternCount(o.lighting, o.ram), maxLanterns);
  for (let i = 0; i < initial; i++) spawnLantern(100 + rand() * (WORLD_W - 200), HORIZON_Y + 50 + rand() * 110);

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

  const lowerAt = (x: number, y: number) => {
    if (y < HORIZON_Y + 10 || y > WORLD_H - 10 || x < 0 || x > WORLD_W) return;
    spawnLantern(x, y, held && lit ? held : undefined);
    held = null;
    lit = false;
    ctx.requestRender();
  };

  const pond: PondApi = {
    setLantern(color) {
      held = color;
      lit = false;
    },
    light() {
      if (held) lit = true;
    },
    lower: lowerAt,
    ripple(clientX, clientY) {
      const [x, y] = ctx.toWorld(clientX, clientY);
      lowerAt(x, y);
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
        l.box.position.set(l.x, l.baseY + Math.sin(time * 0.9 + l.phase) * 1.5);
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
