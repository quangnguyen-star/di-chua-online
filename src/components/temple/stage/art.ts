import type { LightingPalette } from "./lighting.ts";

/** Stage world size; every baked layer is authored on this grid and scaled to fit by the stage. */
export const WORLD_W = 960;
export const WORLD_H = 540;
export const HORIZON_Y = 372;

const GOLD_LINE = "rgba(222,178,90,.9)";

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return [el, ctx];
}

/** Deterministic pseudo-random so a bake is repeatable (and a capture comparable). */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function bakeSky(p: LightingPalette, horizon = HORIZON_Y): HTMLCanvasElement {
  const [el, c] = canvas(WORLD_W, horizon + 4);
  const g = c.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, p.skyTop);
  g.addColorStop(1, p.skyBottom);
  c.fillStyle = g;
  c.fillRect(0, 0, el.width, el.height);
  return el;
}

/** Gold-leaf moon (or low sun by day): three-stop disc with faint horizontal leaf seams and a soft halo. */
export function bakeOrb(kind: "sun" | "moon", haloAlpha: number): HTMLCanvasElement {
  const size = 320;
  const [el, c] = canvas(size, size);
  const mid = size / 2;
  const halo = c.createRadialGradient(mid, mid, 30, mid, mid, mid);
  halo.addColorStop(0, `rgba(244,217,140,${haloAlpha})`);
  halo.addColorStop(1, "rgba(244,217,140,0)");
  c.fillStyle = halo;
  c.fillRect(0, 0, size, size);
  const r = kind === "moon" ? 46 : 38;
  const disc = c.createRadialGradient(mid - 12, mid - 12, 4, mid, mid, r);
  disc.addColorStop(0, "#f4d98c");
  disc.addColorStop(0.62, "#d4a548");
  disc.addColorStop(1, "#9c6f22");
  c.fillStyle = disc;
  c.beginPath();
  c.arc(mid, mid, r, 0, Math.PI * 2);
  c.fill();
  c.save();
  c.clip();
  c.strokeStyle = "rgba(60,36,10,.18)";
  c.lineWidth = 1;
  for (let y = mid - r + 9; y < mid + r; y += 11) {
    c.beginPath();
    c.moveTo(mid - r, y);
    c.lineTo(mid + r, y);
    c.stroke();
  }
  c.restore();
  return el;
}

/** Flat ground from a place's horizon to the bottom edge, shaded top to bottom. */
export function bakeGround(horizon: number, top: string, bottom: string): HTMLCanvasElement {
  const h = WORLD_H - horizon;
  const [el, c] = canvas(WORLD_W, h);
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, WORLD_W, h);
  return el;
}

function ridge(c: CanvasRenderingContext2D, base: number, amp: number, seed: number, fill: string, edge: string): void {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  for (let x = 0; x <= WORLD_W + 80; x += 80) pts.push([x, base - amp * (0.35 + rand() * 0.65)]);
  c.beginPath();
  c.moveTo(0, HORIZON_Y + 4);
  c.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    c.quadraticCurveTo(px + 40, Math.min(py, y) - amp * 0.18, x, y);
  }
  c.lineTo(WORLD_W, HORIZON_Y + 4);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    c.quadraticCurveTo(px + 40, Math.min(py, y) - amp * 0.18, x, y);
  }
  c.strokeStyle = edge;
  c.lineWidth = 1.2;
  c.stroke();
}

export function bakeFarMountains(p: LightingPalette): HTMLCanvasElement {
  const [el, c] = canvas(WORLD_W + 80, HORIZON_Y + 4);
  ridge(c, HORIZON_Y - 36, 130, 7, p.farMountain, "rgba(214,166,72,.55)");
  return el;
}

export function bakeMidMountains(p: LightingPalette): HTMLCanvasElement {
  const [el, c] = canvas(WORLD_W + 80, HORIZON_Y + 4);
  ridge(c, HORIZON_Y - 8, 90, 23, p.midMountain, "rgba(232,190,100,.7)");
  return el;
}

/** Roof with upturned eaves (đầu đao): a flat ridge whose two ends sweep up and out. */
function roof(c: CanvasRenderingContext2D, cx: number, y: number, halfW: number, h: number): void {
  c.beginPath();
  c.moveTo(cx - halfW - 16, y - 12);
  c.quadraticCurveTo(cx - halfW + 10, y + 4, cx - halfW * 0.6, y);
  c.lineTo(cx - halfW * 0.25, y - h);
  c.lineTo(cx + halfW * 0.25, y - h);
  c.lineTo(cx + halfW * 0.6, y);
  c.quadraticCurveTo(cx + halfW - 10, y + 4, cx + halfW + 16, y - 12);
  c.quadraticCurveTo(cx + halfW, y + 12, cx + halfW * 0.7, y + 10);
  c.lineTo(cx - halfW * 0.7, y + 10);
  c.quadraticCurveTo(cx - halfW, y + 12, cx - halfW - 16, y - 12);
  c.closePath();
  c.fillStyle = "#0d0806";
  c.fill();
  c.strokeStyle = GOLD_LINE;
  c.lineWidth = 1.5;
  c.stroke();
}

/** Bank plus the tam quan: three arched doors under a two-tier central roof, outlined in gold. */
export function bakeBankAndGate(): HTMLCanvasElement {
  const [el, c] = canvas(WORLD_W, WORLD_H - HORIZON_Y + 40);
  const top = HORIZON_Y - 40;
  c.translate(0, -top);
  c.beginPath();
  c.moveTo(0, HORIZON_Y + 6);
  c.quadraticCurveTo(220, HORIZON_Y - 10, 480, HORIZON_Y - 2);
  c.quadraticCurveTo(760, HORIZON_Y - 12, WORLD_W, HORIZON_Y);
  c.lineTo(WORLD_W, HORIZON_Y + 40);
  c.lineTo(0, HORIZON_Y + 40);
  c.closePath();
  c.fillStyle = "#100a07";
  c.fill();

  const gx = 300;
  const gw = 360;
  const baseY = HORIZON_Y + 2;
  c.fillStyle = "#170d09";
  c.strokeStyle = GOLD_LINE;
  c.lineWidth = 1.5;
  c.fillRect(gx, baseY - 96, gw, 96);
  c.strokeRect(gx, baseY - 96, gw, 96);
  const doors: [number, number, number][] = [[gx + 24, 60, 70], [gx + gw / 2 - 40, 80, 84], [gx + gw - 84, 60, 70]];
  for (const [dx, dw, dh] of doors) {
    c.beginPath();
    c.moveTo(dx, baseY);
    c.lineTo(dx, baseY - dh + dw / 2);
    c.arc(dx + dw / 2, baseY - dh + dw / 2, dw / 2, Math.PI, 0);
    c.lineTo(dx + dw, baseY);
    c.closePath();
    c.fillStyle = "#2a120b";
    c.fill();
    c.stroke();
  }
  roof(c, gx + gw / 2, baseY - 96, gw / 2 + 8, 22);
  c.fillStyle = "#170d09";
  c.fillRect(gx + gw / 2 - 70, baseY - 150, 140, 36);
  c.strokeRect(gx + gw / 2 - 70, baseY - 150, 140, 36);
  roof(c, gx + gw / 2, baseY - 150, 96, 20);
  return el;
}

/** Water body with a reflected-mountain ghost; the river filter ripples this layer. */
export function bakeWater(p: LightingPalette, ram: boolean): HTMLCanvasElement {
  const h = WORLD_H - HORIZON_Y;
  const [el, c] = canvas(WORLD_W, h);
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#120b08");
  g.addColorStop(1, "#060403");
  c.fillStyle = g;
  c.fillRect(0, 0, WORLD_W, h);
  c.save();
  c.globalAlpha = 0.22;
  c.scale(1, -0.5);
  c.drawImage(bakeMidMountains(p), 0, -HORIZON_Y - 4);
  c.restore();
  const rand = rng(41);
  c.strokeStyle = "rgba(244,217,140,.55)";
  c.lineCap = "round";
  const glints = ram ? 34 : 22;
  for (let i = 0; i < glints; i++) {
    const y = 10 + rand() * (h - 20);
    const w = 8 + rand() * 26;
    c.lineWidth = 1 + rand() * 1.2;
    c.globalAlpha = 0.25 + rand() * 0.5;
    c.beginPath();
    c.moveTo(560 + (rand() - 0.5) * 220 - w / 2, y);
    c.lineTo(560 + (rand() - 0.5) * 220 + w / 2, y);
    c.stroke();
  }
  return el;
}

/** Egg-shell crackle hairlines (about 6% alpha) with scattered gold flecks, drawn once over the whole scene. */
export function bakeCrackle(): HTMLCanvasElement {
  const [el, c] = canvas(WORLD_W, WORLD_H);
  const rand = rng(97);
  c.lineWidth = 0.7;
  c.strokeStyle = "rgba(214,166,72,.06)";
  for (let i = 0; i < 90; i++) {
    let x = rand() * WORLD_W;
    let y = rand() * WORLD_H;
    c.beginPath();
    c.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (rand() - 0.5) * 70;
      y += (rand() - 0.5) * 70;
      c.lineTo(x, y);
    }
    c.stroke();
  }
  for (let i = 0; i < 70; i++) {
    c.fillStyle = `rgba(232,190,100,${0.15 + rand() * 0.35})`;
    c.fillRect(rand() * WORLD_W, rand() * WORLD_H, 1.2, 1.2);
  }
  return el;
}

/** Lotus lantern: red petals edged vàng quỳ, flame core, and a separate additive glow sprite. */
export function bakeLantern(): { body: HTMLCanvasElement; glow: HTMLCanvasElement; reflection: HTMLCanvasElement } {
  const [body, c] = canvas(48, 40);
  c.translate(24, 30);
  const petal = (angle: number, len: number, color: string) => {
    c.save();
    c.rotate(angle);
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(-8, -len * 0.5, 0, -len);
    c.quadraticCurveTo(8, -len * 0.5, 0, 0);
    c.fillStyle = color;
    c.fill();
    c.strokeStyle = "#e2b65a";
    c.lineWidth = 1;
    c.stroke();
    c.restore();
  };
  petal(-0.9, 16, "#7e1a12");
  petal(0.9, 16, "#7e1a12");
  petal(-0.45, 22, "#b8261a");
  petal(0.45, 22, "#b8261a");
  petal(0, 24, "#b8261a");
  c.beginPath();
  c.arc(0, -8, 3.2, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,220,140,.95)";
  c.fill();

  const [glow, g] = canvas(128, 128);
  const rg = g.createRadialGradient(64, 64, 2, 64, 64, 64);
  rg.addColorStop(0, "rgba(240,180,80,.55)");
  rg.addColorStop(1, "rgba(240,180,80,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);

  const [reflection, r] = canvas(12, 64);
  const rr = r.createLinearGradient(0, 0, 0, 64);
  rr.addColorStop(0, "rgba(240,180,80,.5)");
  rr.addColorStop(1, "rgba(240,180,80,0)");
  r.fillStyle = rr;
  r.fillRect(4, 0, 4, 64);
  return { body, glow, reflection };
}

/** Soft round dot used for fireflies, gold motes and the warm wash. */
export function bakeDot(): HTMLCanvasElement {
  const [el, c] = canvas(32, 32);
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,226,150,.95)");
  g.addColorStop(1, "rgba(255,226,150,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 32, 32);
  return el;
}
