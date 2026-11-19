/* Lantern bake: a pure description of a lotus lantern plus a 2D-context painter. Works from DOM canvas and Pixi
   (draw into an offscreen canvas, hand it to a texture). Colors mirror the lacquer tokens in src/styles/tokens.css. */
export type LanternColor = "pink" | "gold" | "white";

export const LANTERN_COLORS: readonly LanternColor[] = ["pink", "gold", "white"];

export interface LanternBake {
  color: LanternColor;
  prominent: boolean;
  width: number;
  height: number;
  petal: string;
  petalEdge: string;
  glow: string;
  /** 1 for a regular lantern, higher for the visitor's own. */
  brightness: number;
  petalCount: number;
}

const PALETTE: Record<LanternColor, { petal: string; petalEdge: string; glow: string }> = {
  pink: { petal: "#f2a0b4", petalEdge: "#b8261a", glow: "#ffb3c4" },
  gold: { petal: "#f4d98c", petalEdge: "#9c6f22", glow: "#ffd36b" },
  white: { petal: "#fbf1dc", petalEdge: "#c9c6c0", glow: "#fff6e0" },
};

const BASE_WIDTH = 48;
const BASE_HEIGHT = 40;
const PROMINENT_SCALE = 1.5;
const PROMINENT_BRIGHTNESS = 1.4;

export function lanternBake(color: LanternColor, prominent = false): LanternBake {
  const scale = prominent ? PROMINENT_SCALE : 1;
  return {
    color,
    prominent,
    width: Math.round(BASE_WIDTH * scale),
    height: Math.round(BASE_HEIGHT * scale),
    ...PALETTE[color],
    brightness: prominent ? PROMINENT_BRIGHTNESS : 1,
    petalCount: 7,
  };
}

/** The drawing surface subset used by the painter, satisfied by CanvasRenderingContext2D and OffscreenCanvas contexts. */
export interface Paint2D {
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  beginPath(): void;
  ellipse(x: number, y: number, rx: number, ry: number, rotation: number, start: number, end: number): void;
  fill(): void;
  stroke(): void;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  fillRect(x: number, y: number, w: number, h: number): void;
  globalAlpha: number;
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
}

export function drawLantern(ctx: Paint2D, bake: LanternBake): void {
  const { width, height } = bake;
  const cx = width / 2;
  const cy = height * 0.6;
  const unit = width / BASE_WIDTH;

  ctx.save();
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, width / 2);
  halo.addColorStop(0, bake.glow);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = Math.min(1, 0.45 * bake.brightness);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = Math.min(1, 0.85 + 0.1 * (bake.brightness - 1));
  ctx.translate(cx, cy);
  ctx.fillStyle = bake.petal;
  ctx.strokeStyle = bake.petalEdge;
  ctx.lineWidth = Math.max(1, unit);
  const spread = Math.PI * 0.9;
  for (let i = 0; i < bake.petalCount; i++) {
    const t = bake.petalCount === 1 ? 0 : i / (bake.petalCount - 1) - 0.5;
    ctx.save();
    ctx.rotate(t * spread);
    ctx.beginPath();
    ctx.ellipse(0, -9 * unit, 5 * unit, 11 * unit, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** Bake to an offscreen canvas (browser only); the result can be a DOM node or a Pixi texture source. */
export function createLanternCanvas(color: LanternColor, prominent = false): HTMLCanvasElement {
  const bake = lanternBake(color, prominent);
  const canvas = document.createElement("canvas");
  canvas.width = bake.width;
  canvas.height = bake.height;
  const ctx = canvas.getContext("2d");
  if (ctx) drawLantern(ctx, bake);
  return canvas;
}
