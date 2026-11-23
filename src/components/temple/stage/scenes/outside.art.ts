import { WORLD_H, WORLD_W } from "../art.ts";

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const c = el.getContext("2d");
  if (!c) throw new Error("2d canvas unavailable");
  return [el, c];
}

/** Top of the stairway at the skyline, and where it meets the foreground, in world pixels. */
export const STAIR_TOP_Y = 352;
export const STAIR_BOTTOM_Y = 474;
export const STAIR_TOP_HALF_W = 24;
export const STAIR_BOTTOM_HALF_W = 120;
const STEPS = 11;

/** Half-width of the stairway at world y, interpolated between the top and the foot. */
export function stairHalfWidth(y: number): number {
  const t = (y - STAIR_TOP_Y) / (STAIR_BOTTOM_Y - STAIR_TOP_Y);
  return STAIR_TOP_HALF_W + (STAIR_BOTTOM_HALF_W - STAIR_TOP_HALF_W) * t;
}

/**
 * Stone stairway in perspective, full world size: the flight narrowing to the skyline, a low wall down each side
 * and the dark foreground floor with its rail along the bottom.
 */
export function bakeStairway(): HTMLCanvasElement {
  const [el, c] = canvas(WORLD_W, WORLD_H);
  const cx = WORLD_W / 2;

  c.fillStyle = "#2a1c14";
  c.fillRect(0, STAIR_BOTTOM_Y, WORLD_W, WORLD_H - STAIR_BOTTOM_Y);
  c.fillStyle = "rgba(0,0,0,.25)";
  for (let x = 0; x < WORLD_W; x += 40) c.fillRect(x, STAIR_BOTTOM_Y + 18, 1, WORLD_H);

  for (const side of [-1, 1]) {
    c.fillStyle = "#3b281b";
    c.beginPath();
    c.moveTo(cx + side * (STAIR_TOP_HALF_W + 2), STAIR_TOP_Y);
    c.lineTo(cx + side * (STAIR_TOP_HALF_W + 16), STAIR_TOP_Y);
    c.lineTo(cx + side * (STAIR_BOTTOM_HALF_W + 150), STAIR_BOTTOM_Y);
    c.lineTo(cx + side * (STAIR_BOTTOM_HALF_W + 2), STAIR_BOTTOM_Y);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(226,160,100,.5)";
    c.lineWidth = 1;
    c.stroke();
  }

  for (let i = 0; i < STEPS; i++) {
    const y0 = STAIR_TOP_Y + ((STAIR_BOTTOM_Y - STAIR_TOP_Y) * i) / STEPS;
    const y1 = STAIR_TOP_Y + ((STAIR_BOTTOM_Y - STAIR_TOP_Y) * (i + 1)) / STEPS;
    const w0 = stairHalfWidth(y0);
    const w1 = stairHalfWidth(y1);
    c.fillStyle = i % 2 ? "#6b4a36" : "#5d4030";
    c.beginPath();
    c.moveTo(cx - w0, y0);
    c.lineTo(cx + w0, y0);
    c.lineTo(cx + w1, y1);
    c.lineTo(cx - w1, y1);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(240,190,140,.35)";
    c.fillRect(cx - w0, y0, w0 * 2, 1.5);
    c.fillStyle = "rgba(0,0,0,.3)";
    c.fillRect(cx - w1, y1 - 2, w1 * 2, 2);
  }

  c.fillStyle = "#120b07";
  c.fillRect(0, WORLD_H - 52, WORLD_W, 5);
  c.fillStyle = "rgba(226,160,100,.4)";
  c.fillRect(0, WORLD_H - 52, WORLD_W, 1);
  for (let x = 20; x < WORLD_W; x += 36) c.fillRect(x, WORLD_H - 47, 3, 24);
  return el;
}

/** Faceted rock silhouette `w` x `h`, standing on its bottom edge; `tone` is the lit face colour. */
export function bakeRock(w: number, h: number, tone: string, peak = 0.5): HTMLCanvasElement {
  const [el, c] = canvas(w, h);
  const px = w * peak;
  c.fillStyle = tone;
  c.beginPath();
  c.moveTo(0, h);
  c.lineTo(w * 0.12, h * 0.38);
  c.lineTo(px, 0);
  c.lineTo(w * 0.9, h * 0.34);
  c.lineTo(w, h);
  c.closePath();
  c.fill();
  c.fillStyle = "rgba(0,0,0,.35)";
  c.beginPath();
  c.moveTo(px, 0);
  c.lineTo(w * 0.9, h * 0.34);
  c.lineTo(w, h);
  c.lineTo(px + w * 0.06, h);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(255,200,150,.35)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(w * 0.12, h * 0.38);
  c.lineTo(px, 0);
  c.stroke();
  return el;
}

/** Small lamp post glow: warm additive halo, 48x48, centred. */
export function bakePathLampGlow(): HTMLCanvasElement {
  const [el, c] = canvas(48, 48);
  const g = c.createRadialGradient(24, 24, 1, 24, 24, 24);
  g.addColorStop(0, "rgba(255,226,150,.95)");
  g.addColorStop(0.3, "rgba(255,190,100,.45)");
  g.addColorStop(1, "rgba(255,170,80,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 48, 48);
  return el;
}
