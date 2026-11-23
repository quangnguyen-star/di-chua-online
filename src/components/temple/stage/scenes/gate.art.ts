import { WORLD_W } from "../art.ts";

/** Gate scene art, authored on the 960x540 stage grid to match reference art/stops/gate.jpg (x1.5 of its 640x360). */

export const GATE_HORIZON = 312;
/** Where the tam quan sprite sits in the world, and the staircase top and bottom edges. */
export const TAM_QUAN_AT = { x: 270, y: 118 } as const;
export const STAIRS = { top: GATE_HORIZON, bottom: 540, topHalf: 62, bottomHalf: 200 } as const;
/** Centres of the lit stone lanterns along the steps, upper pair then lower pair. */
export const STAIR_LAMP_SPOTS: readonly (readonly [number, number])[] = [[365, 358], [595, 358], [312, 446], [648, 446]];
/** Hanging red lanterns under the centre roof and over the side passages. */
export const GATE_LAMP_XS = [452, 508, 372, 588] as const;
export const GATE_LAMP_Y = 196;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return [el, ctx];
}

const WOOD = "#2a1410";
const WOOD_LIGHT = "#4a2418";
const GOLD = "rgba(226,182,90,.85)";
const GLOW = "rgba(255,190,100,.9)";

/** One upturned two-eave roof, centred on cx with its ridge at y. */
function roof(c: CanvasRenderingContext2D, cx: number, y: number, half: number, rise: number): void {
  c.fillStyle = "#1c0d09";
  c.strokeStyle = GOLD;
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx - half - 14, y + 2);
  c.quadraticCurveTo(cx - half * 0.4, y + 12, cx, y - rise);
  c.quadraticCurveTo(cx + half * 0.4, y + 12, cx + half + 14, y + 2);
  c.lineTo(cx + half, y + 14);
  c.lineTo(cx - half, y + 14);
  c.closePath();
  c.fill();
  c.stroke();
}

function pillar(c: CanvasRenderingContext2D, x: number, y: number, h: number): void {
  c.fillStyle = WOOD_LIGHT;
  c.fillRect(x - 3, y, 6, h);
}

function arch(c: CanvasRenderingContext2D, cx: number, base: number, w: number, h: number, lit: boolean): void {
  c.fillStyle = lit ? GLOW : "#120807";
  c.beginPath();
  c.moveTo(cx - w / 2, base);
  c.lineTo(cx - w / 2, base - h + w / 2);
  c.arc(cx, base - h + w / 2, w / 2, Math.PI, 0);
  c.lineTo(cx + w / 2, base);
  c.closePath();
  c.fill();
  c.strokeStyle = GOLD;
  c.lineWidth = 1;
  c.stroke();
}

/** Three-passage tam quan: two-tier centre roof over a doored passage, a lower roofed passage each side. 420x190, base at the bottom. */
export function bakeTamQuan(): HTMLCanvasElement {
  const [el, c] = canvas(420, 190);
  const cx = 210;
  const base = 186;
  for (const side of [-1, 1]) {
    const sx = cx + side * 112;
    c.fillStyle = WOOD;
    c.fillRect(sx - 52, base - 84, 104, 84);
    roof(c, sx, base - 86, 52, 26);
    pillar(c, sx - 46, base - 84, 84);
    pillar(c, sx + 46, base - 84, 84);
    arch(c, sx, base, 30, 56, true);
  }
  c.fillStyle = WOOD;
  c.fillRect(cx - 54, base - 118, 108, 118);
  pillar(c, cx - 48, base - 118, 118);
  pillar(c, cx + 48, base - 118, 118);
  c.fillStyle = "#1a0b08";
  c.fillRect(cx - 28, base - 136, 56, 22);
  roof(c, cx, base - 122, 46, 22);
  roof(c, cx, base - 150, 66, 30);
  arch(c, cx, base, 46, 84, true);
  c.strokeStyle = "rgba(60,20,10,.9)";
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx, base - 76);
  c.lineTo(cx, base);
  c.stroke();
  return el;
}

/** Long stone staircase as a trapezoid with a tread line per step, plus the low terrace walls either side at the top. */
export function bakeStairs(): HTMLCanvasElement {
  const { top, bottom, topHalf, bottomHalf } = STAIRS;
  const h = bottom - top;
  const [el, c] = canvas(WORLD_W, h);
  const mid = WORLD_W / 2;
  c.fillStyle = "#2b1710";
  c.fillRect(mid - 250, 0, 500, 8);
  c.fillStyle = "#3a2016";
  c.fillRect(mid - 250, 0, 500, 3);
  const steps = 22;
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const p0 = Math.pow(t0, 1.35);
    const p1 = Math.pow(t1, 1.35);
    const y0 = 8 + p0 * (h - 8);
    const y1 = 8 + p1 * (h - 8);
    const half0 = topHalf + (bottomHalf - topHalf) * p0;
    const half1 = topHalf + (bottomHalf - topHalf) * p1;
    const shade = 0.55 + 0.25 * (1 - t0);
    c.fillStyle = `rgba(${Math.round(120 * shade)},${Math.round(64 * shade)},${Math.round(42 * shade)},1)`;
    c.beginPath();
    c.moveTo(mid - half0, y0);
    c.lineTo(mid + half0, y0);
    c.lineTo(mid + half1, y1);
    c.lineTo(mid - half1, y1);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(240,190,110,.35)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(mid - half0, y0);
    c.lineTo(mid + half0, y0);
    c.stroke();
  }
  c.strokeStyle = GOLD;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(mid - topHalf, 8);
  c.lineTo(mid - bottomHalf, h);
  c.moveTo(mid + topHalf, 8);
  c.lineTo(mid + bottomHalf, h);
  c.stroke();
  return el;
}

/** A lit stone lantern (three stacked blocks, a window, a cap) 44x80, base at bottom centre, plus an additive glow sprite. */
export function bakeStoneLamp(): { body: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [body, c] = canvas(44, 80);
  c.fillStyle = "#3b2a22";
  c.fillRect(14, 62, 16, 18);
  c.fillRect(8, 74, 28, 6);
  c.fillRect(16, 26, 12, 38);
  c.fillStyle = "#4a352b";
  c.fillRect(10, 30, 24, 24);
  c.fillStyle = GLOW;
  c.fillRect(16, 35, 12, 14);
  c.fillStyle = "#2c1d17";
  c.beginPath();
  c.moveTo(2, 30);
  c.lineTo(22, 10);
  c.lineTo(42, 30);
  c.closePath();
  c.fill();
  c.strokeStyle = GOLD;
  c.lineWidth = 1;
  c.stroke();
  c.fillStyle = "#4a352b";
  c.fillRect(19, 4, 6, 8);
  const [glow, g] = canvas(140, 140);
  const rg = g.createRadialGradient(70, 70, 2, 70, 70, 70);
  rg.addColorStop(0, "rgba(255,190,100,.55)");
  rg.addColorStop(1, "rgba(255,190,100,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 140, 140);
  return { body, glow };
}

/** Low dark foliage mass hugging the foreground sides, 360x200, standing on the bottom edge. */
export function bakeFoliage(flip: boolean): HTMLCanvasElement {
  const [el, c] = canvas(360, 200);
  c.fillStyle = "#0a0504";
  c.strokeStyle = "rgba(222,178,90,.35)";
  c.lineWidth = 1;
  const blobs: [number, number, number][] = [[60, 150, 70], [150, 120, 54], [40, 90, 44], [210, 170, 40]];
  for (const [x, y, r] of blobs) {
    const px = flip ? 360 - x : x;
    c.beginPath();
    c.ellipse(px, y, r, r * 0.7, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  c.fillRect(0, 150, 360, 50);
  return el;
}
