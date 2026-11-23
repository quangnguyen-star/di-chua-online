/* Pond-only bakers: the lit tam quan on the left bank, the boatman and the reeds. Shared motifs live in ../art.ts. */

const GOLD_LINE = "rgba(222,178,90,.9)";

export const GATE_W = 330;
export const GATE_H = 230;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return [el, ctx];
}

function roof(c: CanvasRenderingContext2D, cx: number, y: number, halfW: number, rise: number): void {
  c.beginPath();
  c.moveTo(cx - halfW, y);
  c.quadraticCurveTo(cx - halfW * 0.45, y - 2, cx, y - rise);
  c.quadraticCurveTo(cx + halfW * 0.45, y - 2, cx + halfW, y);
  c.quadraticCurveTo(cx, y + 5, cx - halfW, y);
  c.closePath();
  c.fillStyle = "#1c0f0a";
  c.fill();
  c.strokeStyle = GOLD_LINE;
  c.lineWidth = 1.4;
  c.stroke();
}

/** Lit tam quan: a tall central arch under two roofs, a lower wing each side, warm light in every doorway. Ground at the bottom edge. */
export function bakeLitTamQuan(): HTMLCanvasElement {
  const [el, c] = canvas(GATE_W, GATE_H);
  const base = GATE_H - 2;
  const wing = (x: number, w: number, h: number) => {
    c.fillStyle = "#2a1109";
    c.strokeStyle = GOLD_LINE;
    c.lineWidth = 1.3;
    c.fillRect(x, base - h, w, h);
    c.strokeRect(x, base - h, w, h);
    roof(c, x + w / 2, base - h, w / 2 + 10, 14);
    const dw = w * 0.42;
    const dx = x + (w - dw) / 2;
    const door = c.createLinearGradient(0, base - h * 0.8, 0, base);
    door.addColorStop(0, "#ffb347");
    door.addColorStop(1, "#ffe9a8");
    c.beginPath();
    c.moveTo(dx, base);
    c.lineTo(dx, base - h * 0.7 + dw / 2);
    c.arc(dx + dw / 2, base - h * 0.7 + dw / 2, dw / 2, Math.PI, 0);
    c.lineTo(dx + dw, base);
    c.closePath();
    c.fillStyle = door;
    c.fill();
    c.stroke();
  };
  wing(0, 70, 74);
  wing(GATE_W - 74, 74, 74);
  const mx = 90;
  const mw = 150;
  c.fillStyle = "#2a1109";
  c.strokeStyle = GOLD_LINE;
  c.lineWidth = 1.5;
  c.fillRect(mx, base - 100, mw, 100);
  c.strokeRect(mx, base - 100, mw, 100);
  const dw = 54;
  const dx = mx + (mw - dw) / 2;
  const door = c.createLinearGradient(0, base - 86, 0, base);
  door.addColorStop(0, "#ffa63a");
  door.addColorStop(1, "#ffeab0");
  c.beginPath();
  c.moveTo(dx, base);
  c.lineTo(dx, base - 70 + dw / 2);
  c.arc(dx + dw / 2, base - 70 + dw / 2, dw / 2, Math.PI, 0);
  c.lineTo(dx + dw, base);
  c.closePath();
  c.fillStyle = door;
  c.fill();
  c.stroke();
  roof(c, GATE_W / 2, base - 100, mw / 2 + 18, 24);
  c.fillStyle = "#2a1109";
  c.fillRect(mx + 30, base - 148, mw - 60, 30);
  c.strokeRect(mx + 30, base - 148, mw - 60, 30);
  roof(c, GATE_W / 2, base - 148, mw / 2 - 6, 20);
  for (const lx of [mx + 12, mx + mw - 12, 22, GATE_W - 22]) {
    c.fillStyle = "#e8402a";
    c.beginPath();
    c.ellipse(lx, base - (lx < 40 || lx > GATE_W - 40 ? 50 : 76), 4, 6, 0, 0, Math.PI * 2);
    c.fill();
  }
  return el;
}

/** Strip of dark bank, `width` x 44, standing under the gate and running to both edges of the world. */
export function bakeBankStrip(width: number): HTMLCanvasElement {
  const [el, c] = canvas(width, 44);
  c.fillStyle = "#100a07";
  c.beginPath();
  c.moveTo(0, 8);
  c.quadraticCurveTo(width * 0.25, 2, width * 0.5, 6);
  c.quadraticCurveTo(width * 0.78, 0, width, 6);
  c.lineTo(width, 44);
  c.lineTo(0, 44);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(232,190,100,.5)";
  c.lineWidth = 1;
  c.stroke();
  return el;
}

/** Seated boatman in a conical hat, 28x36, feet at the bottom centre. */
export function bakeBoatman(): HTMLCanvasElement {
  const [el, c] = canvas(28, 36);
  c.fillStyle = "#0d0806";
  c.beginPath();
  c.moveTo(14, 2);
  c.lineTo(25, 13);
  c.lineTo(3, 13);
  c.closePath();
  c.fill();
  c.beginPath();
  c.arc(14, 16, 4, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(7, 35);
  c.quadraticCurveTo(6, 22, 14, 20);
  c.quadraticCurveTo(22, 22, 21, 35);
  c.closePath();
  c.fill();
  c.strokeStyle = "#0d0806";
  c.lineWidth = 1.6;
  c.beginPath();
  c.moveTo(20, 24);
  c.lineTo(27, 34);
  c.stroke();
  return el;
}

/** A clump of reeds with two seed heads, `width` x `height`, rooted at the bottom. */
export function bakeReeds(width: number, height: number, seed = 5): HTMLCanvasElement {
  const [el, c] = canvas(width, height);
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  c.lineCap = "round";
  const stems = 9;
  for (let i = 0; i < stems; i++) {
    const x = width * (0.15 + 0.7 * (i / (stems - 1)));
    const h = height * (0.55 + rand() * 0.45);
    const lean = (rand() - 0.5) * width * 0.35;
    c.strokeStyle = i % 3 === 0 ? "#1b2a1a" : "#0f1a0f";
    c.lineWidth = 1.6 + rand() * 1.2;
    c.beginPath();
    c.moveTo(x, height);
    c.quadraticCurveTo(x + lean * 0.3, height - h * 0.6, x + lean, height - h);
    c.stroke();
    if (i % 4 === 1) {
      c.fillStyle = "#3a2414";
      c.beginPath();
      c.ellipse(x + lean, height - h - 6, 2.6, 8, lean * 0.01, 0, Math.PI * 2);
      c.fill();
    }
  }
  return el;
}
