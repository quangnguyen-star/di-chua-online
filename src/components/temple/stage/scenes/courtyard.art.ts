import { rng } from "../art.ts";

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return [el, ctx];
}

export const HALL_W = 520;
export const HALL_H = 190;
/** Hall door centres and the lamp positions, in hall-local pixels. */
export const HALL_DOORS = [150, 260, 370] as const;
export const HALL_LAMP_XS = [98, 203, 317, 419] as const;

/** Sweeping curved eave: a dark band with a gold ridge line and upturned tips, spanning [x0, x1] at height y. */
function eave(c: CanvasRenderingContext2D, x0: number, x1: number, y: number, rise: number, thick: number): void {
  c.beginPath();
  c.moveTo(x0, y - rise);
  c.quadraticCurveTo((x0 + x1) / 2, y + 6, x1, y - rise);
  c.lineTo(x1 - 8, y - rise + 5);
  c.quadraticCurveTo((x0 + x1) / 2, y + thick, x0 + 8, y - rise + 5);
  c.closePath();
  c.fillStyle = "#1a0d08";
  c.fill();
  c.strokeStyle = "rgba(226,160,92,.85)";
  c.lineWidth = 1.5;
  c.stroke();
}

/** Two-tier main hall on a low plinth with columns and three lit doors (520x190, base at bottom centre). */
export function bakeMainHall(): HTMLCanvasElement {
  const [el, c] = canvas(HALL_W, HALL_H);
  const cx = HALL_W / 2;
  c.fillStyle = "#2a130c";
  c.fillRect(cx - 120, 36, 240, 34);
  eave(c, cx - 150, cx + 150, 22, 14, 14);
  c.fillStyle = "#3a1a10";
  c.fillRect(cx - 118, 70, 236, 16);
  eave(c, 0, HALL_W, 84, 20, 16);
  c.fillStyle = "#2c140c";
  c.fillRect(24, 100, HALL_W - 48, 76);
  c.fillStyle = "#6a1c10";
  for (const x of [75, 200, 322, 440]) c.fillRect(x, 100, 8, 76);
  for (const x of HALL_DOORS) {
    const g = c.createLinearGradient(0, 118, 0, 176);
    g.addColorStop(0, "#ffd890");
    g.addColorStop(1, "#e0883a");
    c.fillStyle = g;
    c.fillRect(x - 24, 118, 48, 58);
    c.strokeStyle = "#7a2a12";
    c.lineWidth = 2;
    c.strokeRect(x - 24, 118, 48, 58);
    c.beginPath();
    c.moveTo(x, 118);
    c.lineTo(x, 176);
    c.stroke();
  }
  c.fillStyle = "#3b2418";
  c.fillRect(8, 176, HALL_W - 16, 14);
  return el;
}

/** Banyan silhouette: thick leaning trunk with aerial roots under a broad lobed canopy (300x300, base at bottom centre). */
export function bakeBanyan(seed: number): HTMLCanvasElement {
  const [el, c] = canvas(300, 300);
  const rand = rng(seed);
  c.fillStyle = "#0c0605";
  c.beginPath();
  c.moveTo(130, 300);
  c.quadraticCurveTo(138, 230, 128, 150);
  c.lineTo(168, 150);
  c.quadraticCurveTo(160, 230, 174, 300);
  c.closePath();
  c.fill();
  for (let i = 0; i < 5; i++) {
    const x = 70 + i * 40 + rand() * 14;
    c.fillRect(x, 120, 2.5, 60 + rand() * 40);
  }
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const x = 150 + Math.cos(a) * (60 + rand() * 30);
    const y = 100 + Math.sin(a) * (34 + rand() * 18);
    c.beginPath();
    c.ellipse(x, y, 52 + rand() * 24, 34 + rand() * 14, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.strokeStyle = "rgba(226,150,80,.35)";
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(150, 78, 118, 44, 0, Math.PI * 1.05, Math.PI * 1.95);
  c.stroke();
  return el;
}

/** Round brick planter seen in perspective with a heap of fallen leaves (190x56, centre at the middle). */
export function bakePlanter(seed: number): HTMLCanvasElement {
  const [el, c] = canvas(190, 56);
  const rand = rng(seed);
  c.fillStyle = "#6a2a16";
  c.beginPath();
  c.ellipse(95, 30, 90, 24, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#c8643a";
  c.lineWidth = 3;
  c.stroke();
  c.fillStyle = "#241810";
  c.beginPath();
  c.ellipse(95, 28, 78, 19, 0, 0, Math.PI * 2);
  c.fill();
  const tints = ["#d79a3c", "#b5532a", "#c9b037", "#8a5a1c"];
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    c.fillStyle = tints[i % tints.length];
    c.beginPath();
    c.ellipse(95 + Math.cos(a) * r * 62, 28 + Math.sin(a) * r * 14 - r * 4, 5, 2, a, 0, Math.PI * 2);
    c.fill();
  }
  return el;
}

/** A single fallen leaf (14x8), one of four shapes; tinted by the caller's palette index. */
export function bakeFallenLeaf(shape: number, color: string): HTMLCanvasElement {
  const [el, c] = canvas(14, 8);
  c.fillStyle = color;
  c.beginPath();
  if (shape % 4 === 0) c.ellipse(7, 4, 6, 2.6, 0, 0, Math.PI * 2);
  else if (shape % 4 === 1) { c.moveTo(0, 4); c.quadraticCurveTo(7, -2, 14, 4); c.quadraticCurveTo(7, 10, 0, 4); }
  else if (shape % 4 === 2) { c.moveTo(1, 7); c.quadraticCurveTo(2, 0, 13, 1); c.quadraticCurveTo(12, 8, 1, 7); }
  else { c.moveTo(0, 4); c.lineTo(7, 0); c.lineTo(14, 4); c.lineTo(7, 8); }
  c.closePath();
  c.fill();
  return el;
}

/** Standing broom with bristles at the bottom (14x60, base at bottom centre). */
export function bakeStandingBroom(): HTMLCanvasElement {
  const [el, c] = canvas(14, 60);
  c.strokeStyle = "#c9a45a";
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(7, 0);
  c.lineTo(7, 44);
  c.stroke();
  c.fillStyle = "#a68242";
  c.beginPath();
  c.moveTo(5, 40);
  c.lineTo(9, 40);
  c.lineTo(13, 59);
  c.lineTo(1, 59);
  c.closePath();
  c.fill();
  return el;
}
