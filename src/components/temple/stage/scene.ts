import type { Application, Container, Filter, Sprite, Texture } from "pixi.js";
import {
  bakeBankAndGate, bakeCrackle, bakeDot, bakeFarMountains, bakeLantern, bakeMidMountains, bakeOrb, bakeSky, bakeWater,
  HORIZON_Y, rng, WORLD_H, WORLD_W,
} from "./art.ts";
import { lanternCount, palettes } from "./lighting.ts";
import { createWaterFilter } from "./waterFilter.ts";
import type { StageLighting } from "./types.ts";

type PixiModule = typeof import("pixi.js");

const MAX_PARTICLES = 24;
const MAX_LANTERNS = 14;
const MAX_LANTERNS_LOW = 8;
const SLOW_FRAME_MS = 28;
const SAMPLE_FRAMES = 90;
const DPR_STEP = 0.25;

export interface SceneOptions {
  lighting: StageLighting;
  ram: boolean;
  /** "low" starts at DPR 1 with half the particles; "auto" starts at the device ratio and adapts. */
  quality: "auto" | "low";
  maxDpr: number;
}

export interface SceneHandle {
  /** Runs or stops the loop; a stopped scene still shows its current frame. */
  setRunning(running: boolean): void;
  addLantern(clientX: number, clientY: number): void;
  destroy(): void;
}

interface Lantern { box: Container; baseY: number; speed: number; phase: number; x: number }
interface Mote { sprite: Sprite; x: number; y: number; vx: number; vy: number; phase: number }
interface DepthLayer { node: Container; depth: number }

/** Builds every layer into app.stage. All art is baked from canvas into textures at build time. */
export function buildScene(pixi: PixiModule, app: Application, canvas: HTMLCanvasElement, o: SceneOptions): SceneHandle {
  const p = palettes[o.lighting];
  const textures: Texture[] = [];
  const tex = (source: HTMLCanvasElement): Texture => {
    const t = pixi.Texture.from(source);
    textures.push(t);
    return t;
  };
  const root = new pixi.Container();
  app.stage.addChild(root);
  const layers: DepthLayer[] = [];
  const depthLayer = (node: Container, depth: number) => {
    root.addChild(node);
    layers.push({ node, depth });
    return node;
  };

  const sky = new pixi.Sprite(tex(bakeSky(p)));
  root.addChild(sky);

  const orbs: Sprite[] = [];
  const addOrb = (kind: "sun" | "moon", x: number, y: number) => {
    const s = new pixi.Sprite(tex(bakeOrb(kind, p.haloAlpha)));
    s.anchor.set(0.5);
    s.position.set(x, y);
    orbs.push(s);
    depthLayer(s, 0.05);
  };
  if (p.orb === "moon") addOrb("moon", 700, 120);
  else if (p.orb === "sun") addOrb("sun", 700, 170);
  if (o.ram && p.orb !== "moon") addOrb("moon", 840, 90);

  const far = new pixi.Sprite(tex(bakeFarMountains(p)));
  far.x = -40;
  depthLayer(far, 0.15);
  const mid = new pixi.Sprite(tex(bakeMidMountains(p)));
  mid.x = -40;
  depthLayer(mid, 0.3);

  const mist = new pixi.Graphics().rect(0, HORIZON_Y - 150, WORLD_W, 150).fill({ color: 0xfbf0d8, alpha: p.mist * 0.35 });
  root.addChild(mist);

  const gate = new pixi.Sprite(tex(bakeBankAndGate()));
  gate.y = HORIZON_Y - 40;
  depthLayer(gate, 0.5);

  const waterBox = new pixi.Container();
  const water = new pixi.Sprite(tex(bakeWater(p, o.ram)));
  water.y = HORIZON_Y;
  waterBox.addChild(water);
  let waterFx: { filter: Filter; setTime(s: number): void } | null = createWaterFilter(pixi);
  waterBox.filters = [waterFx.filter];
  root.addChild(waterBox);

  const lanternTex = bakeLantern();
  const bodyTex = tex(lanternTex.body);
  const glowTex = tex(lanternTex.glow);
  const reflectionTex = tex(lanternTex.reflection);
  const lanternLayer = new pixi.Container();
  root.addChild(lanternLayer);
  const lanterns: Lantern[] = [];
  const maxLanterns = o.quality === "low" ? MAX_LANTERNS_LOW : MAX_LANTERNS;
  const rand = rng(5);

  const spawnLantern = (x: number, y: number) => {
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
    box.addChild(reflection, glow, body);
    box.position.set(x, y);
    lanternLayer.addChild(box);
    lanterns.push({ box, baseY: y, x, speed: 2 + rand() * 4, phase: rand() * 6.28 });
    while (lanterns.length > maxLanterns) lanterns.shift()?.box.destroy({ children: true });
  };
  const initial = Math.min(lanternCount(o.lighting, o.ram), maxLanterns);
  for (let i = 0; i < initial; i++) spawnLantern(100 + rand() * (WORLD_W - 200), HORIZON_Y + 50 + rand() * 110);

  const dotTex = tex(bakeDot());
  const motes: Mote[] = [];
  const moteCount = Math.min(MAX_PARTICLES, o.quality === "low" ? Math.ceil(p.fireflies / 2) : p.fireflies);
  for (let i = 0; i < moteCount; i++) {
    const sprite = new pixi.Sprite(dotTex);
    sprite.anchor.set(0.5);
    sprite.blendMode = "add";
    sprite.scale.set(0.4 + rand() * 0.5);
    root.addChild(sprite);
    motes.push({ sprite, x: rand() * WORLD_W, y: 120 + rand() * 330, vx: (rand() - 0.5) * 6, vy: -1 - rand() * 3, phase: rand() * 6.28 });
  }

  const wash = new pixi.Graphics().rect(0, 0, WORLD_W, WORLD_H).fill({ color: Number.parseInt(p.wash.slice(1), 16), alpha: p.washAlpha });
  wash.blendMode = "add";
  root.addChild(wash);
  const crackle = new pixi.Sprite(tex(bakeCrackle()));
  root.addChild(crackle);

  let time = 0;
  let running = false;
  let frames = 0;
  let frameMs = 0;
  let activeMotes = motes.length;

  const layout = () => {
    const w = app.screen.width;
    const h = app.screen.height;
    const scale = Math.max(w / WORLD_W, h / WORLD_H);
    root.scale.set(scale);
    root.position.set((w - WORLD_W * scale) / 2, h - WORLD_H * scale);
    if (!running) app.render();
  };

  const adapt = () => {
    if (o.quality !== "auto" || frames < SAMPLE_FRAMES) return;
    const avg = frameMs / frames;
    frames = 0;
    frameMs = 0;
    if (avg <= SLOW_FRAME_MS) return;
    const res = app.renderer.resolution;
    if (res > 1) {
      app.renderer.resize(app.screen.width, app.screen.height, Math.max(1, res - DPR_STEP));
    } else if (activeMotes > 0) {
      activeMotes = Math.floor(activeMotes / 2);
      motes.forEach((m, i) => { m.sprite.visible = i < activeMotes; });
    } else if (waterFx) {
      waterBox.filters = [];
      waterFx.filter.destroy();
      waterFx = null;
    }
  };

  const tick = (ticker: { deltaMS: number }) => {
    const dt = Math.min(ticker.deltaMS, 100) / 1000;
    time += dt;
    frames += 1;
    frameMs += ticker.deltaMS;
    const drift = Math.sin(time * 0.15) * 14;
    for (const l of layers) l.node.x = -drift * l.depth + (l.node === far || l.node === mid ? -40 : 0);
    waterFx?.setTime(time);
    for (const l of lanterns) {
      l.x += l.speed * dt;
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
    adapt();
  };

  const resolution = o.quality === "low" ? 1 : Math.min(o.maxDpr, app.renderer.resolution);
  if (resolution !== app.renderer.resolution) app.renderer.resize(app.screen.width, app.screen.height, resolution);
  app.renderer.on("resize", layout);
  app.ticker.add(tick);
  layout();

  return {
    setRunning(next) {
      running = next;
      if (next) app.ticker.start();
      else {
        app.ticker.stop();
        app.render();
      }
    },
    addLantern(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left - root.x) / root.scale.x;
      const y = (clientY - rect.top - root.y) / root.scale.y;
      if (y < HORIZON_Y + 10 || y > WORLD_H - 10 || x < 0 || x > WORLD_W) return;
      spawnLantern(x, y);
      if (!running) app.render();
    },
    destroy() {
      app.ticker.remove(tick);
      app.renderer.off("resize", layout);
      root.destroy({ children: true });
      waterFx?.filter.destroy();
      for (const t of textures) t.destroy(true);
    },
  };
}
