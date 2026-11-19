import { SMOKE_COLOR, wispPoints, type WispParams } from "./wisp.ts";

export interface SmokeContext {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  globalAlpha: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  lineCap: CanvasLineCap;
}

/** Draws one frame. Each segment is a short round-capped stroke so the wisp reads as one soft continuous line. */
export function drawSmoke(ctx: SmokeContext, width: number, height: number, params: Omit<WispParams, "height">): number {
  ctx.clearRect(0, 0, width, height);
  const points = wispPoints({ ...params, height: height - 4 });
  if (points.length < 2) return 0;
  ctx.save();
  ctx.translate(width / 2, height - 2);
  ctx.strokeStyle = SMOKE_COLOR;
  ctx.lineCap = "round";
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    ctx.globalAlpha = b.alpha;
    ctx.lineWidth = b.width;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
  return points.length - 1;
}
