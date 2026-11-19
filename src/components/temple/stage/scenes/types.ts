import type { Application, Container, Texture } from "pixi.js";
import type { PlaceId } from "../../../../content/routes.ts";
import type { LightingPalette } from "../lighting.ts";
import type { StageLighting } from "../types.ts";

export type PixiModule = typeof import("pixi.js");

export interface SceneOptions {
  lighting: StageLighting;
  ram: boolean;
  /** "low" starts at DPR 1 with half the particles; "auto" starts at the device ratio and adapts. */
  quality: "auto" | "low";
  maxDpr: number;
}

/** What the pond scene exposes to the lantern flow (implemented in scenes/pond.ts). */
export interface PondApi {
  /** Picks the lantern colour held in hand, or puts it down with null. */
  setLantern(color: string | null): void;
  /** Lights the held lantern. */
  light(): void;
  /** Lowers the held lantern onto the water at world coordinates. */
  lower(wx: number, wy: number): void;
  /** A touch on the water, in client coordinates. */
  ripple(clientX: number, clientY: number): void;
  /** Current speed of the drift, 0 still to 1 full. */
  setDrift(amount: number): void;
  /** Eases the camera back from the water, 0 close to 1 fully pulled back. */
  pullBack(amount: number): void;
}

export interface SceneHandle {
  /** Runs or stops the loop; a stopped scene still shows its current frame. */
  setRunning(running: boolean): void;
  /** Names of the layers actually drawn, bottom to top. */
  layers(): string[];
  /** Present only on the pond scene. */
  pond?: PondApi;
  /** Stops the ticker and frees every texture and display object. */
  destroy(): void;
}

export interface DepthLayer { node: Container; depth: number; baseX: number }

export interface SceneContext {
  pixi: PixiModule;
  app: Application;
  options: SceneOptions;
  palette: LightingPalette;
  root: Container;
  /** Bakes a canvas to a texture that is freed with the scene. */
  tex(source: HTMLCanvasElement): Texture;
  /** Adds node to the root, drifting with the parallax at the given depth, and records the layer name. */
  depthLayer(name: string, node: Container, depth: number, baseX?: number): void;
  /** Adds node to the root and records the layer name. */
  layer(name: string, node: Container): void;
  /** Client pixel to world coordinate. */
  toWorld(clientX: number, clientY: number): [number, number];
  /** Camera zoom multiplier (1 = framed to fit). */
  setZoom(zoom: number): void;
  requestRender(): void;
}

export interface SceneInstance {
  tick(dt: number, time: number): void;
  /** Sheds one unit of load when frames run slow at DPR 1; returns false when nothing is left to shed. */
  degrade?(): boolean;
  pond?: PondApi;
  dispose?(): void;
}

export interface BackdropSpec {
  /** Where the sky meets the ground, in world pixels from the top. */
  horizon: number;
  groundTop: string;
  groundBottom: string;
  /** Colour of the thin band that edges the ground along the horizon. */
  edge: string;
}

export interface PlaceScene {
  horizon: number;
  /** Every layer this place may draw, bottom to top. */
  layers: readonly string[];
  /** Backdrop-only places; the pond draws its own. */
  backdrop?: BackdropSpec;
  build(ctx: SceneContext): SceneInstance;
}

export type SceneRegistry = Record<PlaceId, PlaceScene>;
