import type { Application, Container, Texture } from "pixi.js";
import type { PlaceId } from "../../../content/routes.ts";
import { WORLD_H, WORLD_W } from "./art.ts";
import { palettes } from "./lighting.ts";
import { sceneFor } from "./scenes/registry.ts";
import type { DepthLayer, PixiModule, SceneContext, SceneHandle, SceneOptions } from "./scenes/types.ts";

export type { PondApi, SceneHandle, SceneOptions } from "./scenes/types.ts";
export { HORIZON, SCENES } from "./scenes/registry.ts";

const SLOW_FRAME_MS = 28;
const SAMPLE_FRAMES = 90;
const DPR_STEP = 0.25;

/** Builds the place's layers into app.stage. All art is baked from canvas into textures at build time. */
export function buildScene(pixi: PixiModule, app: Application, canvas: HTMLCanvasElement, place: PlaceId, o: SceneOptions): SceneHandle {
  const textures: Texture[] = [];
  const root = new pixi.Container();
  app.stage.addChild(root);
  const depth: DepthLayer[] = [];
  const drawn: string[] = [];
  let zoom = 1;
  let running = false;

  const layout = () => {
    const w = app.screen.width;
    const h = app.screen.height;
    const scale = Math.max(w / WORLD_W, h / WORLD_H) * zoom;
    root.scale.set(scale);
    root.position.set((w - WORLD_W * scale) / 2, h - WORLD_H * scale);
    if (!running) app.render();
  };

  const ctx: SceneContext = {
    pixi,
    app,
    options: o,
    palette: palettes[o.lighting],
    root,
    tex(source) {
      const t = pixi.Texture.from(source);
      textures.push(t);
      return t;
    },
    layer(name, node: Container) {
      root.addChild(node);
      drawn.push(name);
    },
    depthLayer(name, node: Container, d, baseX = 0) {
      ctx.layer(name, node);
      node.x = baseX;
      depth.push({ node, depth: d, baseX });
    },
    toWorld(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      return [(clientX - rect.left - root.x) / root.scale.x, (clientY - rect.top - root.y) / root.scale.y];
    },
    setZoom(next) {
      zoom = next;
      layout();
    },
    requestRender() {
      if (!running) app.render();
    },
  };

  const scene = sceneFor(place).build(ctx);

  let time = 0;
  let frames = 0;
  let frameMs = 0;

  const adapt = () => {
    if (o.quality !== "auto" || frames < SAMPLE_FRAMES) return;
    const avg = frameMs / frames;
    frames = 0;
    frameMs = 0;
    if (avg <= SLOW_FRAME_MS) return;
    const res = app.renderer.resolution;
    if (res > 1) app.renderer.resize(app.screen.width, app.screen.height, Math.max(1, res - DPR_STEP));
    else scene.degrade?.();
  };

  const tick = (ticker: { deltaMS: number }) => {
    const dt = Math.min(ticker.deltaMS, 100) / 1000;
    time += dt;
    frames += 1;
    frameMs += ticker.deltaMS;
    const drift = Math.sin(time * 0.15) * 14;
    for (const l of depth) l.node.x = -drift * l.depth + l.baseX;
    scene.tick(dt, time);
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
    layers: () => [...drawn],
    pond: scene.pond,
    destroy() {
      app.ticker.stop();
      app.ticker.remove(tick);
      app.renderer.off("resize", layout);
      scene.dispose?.();
      root.destroy({ children: true });
      for (const t of textures) t.destroy(true);
    },
  };
}
