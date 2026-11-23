import { WORLD_W } from "../art.ts";

/** Veranda layout in stage-world pixels, measured from art/stops/veranda.jpg (640x360) at 1.5x. */
export const VERANDA = {
  horizon: 350,
  windowTop: 60,
  tableX: 337,
  tableTop: 442,
  tableW: 300,
  potX: 405,
  cupX: 522,
  setBase: 442,
  railTop: 480,
} as const;

const GOLD = "rgba(222,178,90,.85)";
const RED = "#9c2f22";

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return [el, ctx];
}

/** Dark wooden frame around the window opening: eave band on top with a red-gold line, thin posts at the sides. */
export function bakeWindowFrame(): HTMLCanvasElement {
  const h = VERANDA.horizon + 4;
  const [el, c] = canvas(WORLD_W, h);
  c.fillStyle = "#150c08";
  c.fillRect(0, 0, WORLD_W, VERANDA.windowTop - 4);
  c.fillStyle = "#6e2a1c";
  c.fillRect(0, VERANDA.windowTop - 6, WORLD_W, 3);
  c.fillStyle = GOLD;
  c.fillRect(0, VERANDA.windowTop - 3, WORLD_W, 1.5);
  c.fillStyle = "#150c08";
  c.fillRect(0, VERANDA.windowTop, 8, h - VERANDA.windowTop);
  c.fillRect(WORLD_W - 8, VERANDA.windowTop, 8, h - VERANDA.windowTop);
  c.fillStyle = "#2a1710";
  c.fillRect(0, VERANDA.horizon - 2, WORLD_W, 6);
  return el;
}

/** Deck planks and the railing: dark balusters between a top rail, with red posts at an even stride. */
export function bakeRailing(): HTMLCanvasElement {
  const h = 540 - VERANDA.railTop;
  const [el, c] = canvas(WORLD_W, h);
  c.fillStyle = "#1a0f0a";
  c.fillRect(0, 0, WORLD_W, h);
  c.fillStyle = "#3a2216";
  c.fillRect(0, 0, WORLD_W, 8);
  c.fillStyle = GOLD;
  c.fillRect(0, 8, WORLD_W, 1.5);
  c.fillStyle = "#24150e";
  for (let x = 14; x < WORLD_W; x += 24) c.fillRect(x, 10, 5, h - 10);
  c.fillStyle = RED;
  for (let x = 28; x < WORLD_W; x += 122) c.fillRect(x, 6, 10, h - 6);
  return el;
}

/** Low wooden table, 300 wide: a lacquered top with a gold edge and splayed legs. */
export function bakeTable(): HTMLCanvasElement {
  const legH = 54;
  const [el, c] = canvas(VERANDA.tableW, 14 + legH);
  c.fillStyle = "#5a2c1c";
  c.fillRect(0, 0, VERANDA.tableW, 12);
  c.fillStyle = "#8a4a2c";
  c.fillRect(0, 0, VERANDA.tableW, 3);
  c.fillStyle = GOLD;
  c.fillRect(0, 12, VERANDA.tableW, 1.5);
  c.strokeStyle = GOLD;
  c.fillStyle = "#3a1d12";
  c.lineWidth = 1.5;
  for (const x of [26, VERANDA.tableW - 26]) {
    c.beginPath();
    c.moveTo(x - 6, 14);
    c.lineTo(x + 6, 14);
    c.lineTo(x + (x < 100 ? -8 : 8), 14 + legH);
    c.lineTo(x + (x < 100 ? -16 : 0), 14 + legH);
    c.closePath();
    c.fill();
    c.stroke();
  }
  return el;
}

/** Clay teapot, 90x52, base at the bottom, spout to the right and handle to the left. */
export function bakeTeapot(): HTMLCanvasElement {
  const [el, c] = canvas(90, 52);
  c.fillStyle = "#1c110c";
  c.strokeStyle = GOLD;
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(40, 32, 26, 18, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(60, 28);
  c.quadraticCurveTo(76, 22, 84, 8);
  c.stroke();
  c.beginPath();
  c.moveTo(16, 24);
  c.quadraticCurveTo(0, 22, 4, 36);
  c.quadraticCurveTo(8, 44, 18, 40);
  c.stroke();
  c.fillStyle = "#2a1a12";
  c.fillRect(30, 10, 20, 6);
  c.strokeRect(30, 10, 20, 6);
  return el;
}

/** Wide tea cup with a handle, 100x50, base at the bottom; the tea surface glows faintly. */
export function bakeCup(): HTMLCanvasElement {
  const [el, c] = canvas(100, 50);
  c.strokeStyle = GOLD;
  c.lineWidth = 2;
  c.fillStyle = "rgba(24,14,9,.9)";
  c.beginPath();
  c.moveTo(8, 8);
  c.lineTo(78, 8);
  c.quadraticCurveTo(78, 46, 43, 46);
  c.quadraticCurveTo(8, 46, 8, 8);
  c.closePath();
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(78, 16);
  c.quadraticCurveTo(98, 16, 94, 30);
  c.quadraticCurveTo(90, 40, 74, 37);
  c.stroke();
  c.fillStyle = "rgba(255,214,140,.55)";
  c.beginPath();
  c.ellipse(43, 9, 34, 3.5, 0, 0, Math.PI * 2);
  c.fill();
  return el;
}
