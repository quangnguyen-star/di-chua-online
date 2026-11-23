/** Canvas bakers for the hall scene (DCO-82). World pixels: the 640x360 still scaled by 1.5. Each returns a canvas sized to its element. */

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return [el, ctx];
}

export const COLUMN_W = 46;
export const COLUMN_H = 540;
export const HALO_W = 260;
export const HALO_H = 330;
export const STATUE_W = 400;
export const STATUE_H = 330;

/** Red column with a dark plinth at its foot (46x540). */
export function bakeColumn(): HTMLCanvasElement {
  const [el, c] = canvas(COLUMN_W, COLUMN_H);
  const g = c.createLinearGradient(0, 0, COLUMN_W, 0);
  g.addColorStop(0, "#4a0f0a");
  g.addColorStop(0.35, "#a8261a");
  g.addColorStop(0.7, "#7a1a12");
  g.addColorStop(1, "#3a0b07");
  c.fillStyle = g;
  c.fillRect(0, 0, COLUMN_W, COLUMN_H);
  c.fillStyle = "#120908";
  c.fillRect(-4, COLUMN_H - 24, COLUMN_W + 8, 24);
  return el;
}

/** Thin gold halo ring with a soft warm fill behind the statue (260x330). */
export function bakeHalo(): HTMLCanvasElement {
  const [el, c] = canvas(HALO_W, HALO_H);
  const fill = c.createRadialGradient(HALO_W / 2, HALO_H / 2, 10, HALO_W / 2, HALO_H / 2, HALO_H / 2);
  fill.addColorStop(0, "rgba(255,200,100,.28)");
  fill.addColorStop(1, "rgba(255,200,100,0)");
  c.fillStyle = fill;
  c.fillRect(0, 0, HALO_W, HALO_H);
  c.strokeStyle = "rgba(232,182,90,.55)";
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(HALO_W / 2, HALO_H / 2, HALO_W / 2 - 3, HALO_H / 2 - 3, 0, 0, Math.PI * 2);
  c.stroke();
  return el;
}

/** Stylized gilded seated figure on a ring of red lotus petals and a dark plinth (400x330, plinth along the bottom, centred). */
export function bakeStatue(): HTMLCanvasElement {
  const [el, c] = canvas(STATUE_W, STATUE_H);
  const cx = STATUE_W / 2;
  const gold = c.createLinearGradient(0, 40, 0, 270);
  gold.addColorStop(0, "#ffe08a");
  gold.addColorStop(0.5, "#e8a73a");
  gold.addColorStop(1, "#a86a18");

  c.fillStyle = "#160c08";
  c.strokeStyle = "rgba(232,182,90,.7)";
  c.lineWidth = 1.5;
  c.fillRect(cx - 163, 306, 326, 22);
  c.strokeRect(cx - 163, 306, 326, 22);

  c.fillStyle = gold;
  c.beginPath();
  c.ellipse(cx, 262, 135, 40, 0, Math.PI, 0);
  c.lineTo(cx + 135, 290);
  c.lineTo(cx - 135, 290);
  c.closePath();
  c.fill();

  const petal = (x: number, y: number, h: number) => {
    const pg = c.createLinearGradient(0, y - h, 0, y);
    pg.addColorStop(0, "#ff7a50");
    pg.addColorStop(1, "#b02a1c");
    c.fillStyle = pg;
    c.beginPath();
    c.moveTo(x - 14, y);
    c.quadraticCurveTo(x - 12, y - h * 0.7, x, y - h);
    c.quadraticCurveTo(x + 12, y - h * 0.7, x + 14, y);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,210,150,.5)";
    c.lineWidth = 1;
    c.stroke();
  };
  for (let x = cx - 150; x <= cx + 150; x += 22) petal(x, 304, 34 - Math.abs(x - cx) / 14);
  for (let x = cx - 139; x <= cx + 139; x += 22) petal(x, 306, 26 - Math.abs(x - cx) / 16);

  c.fillStyle = gold;
  c.beginPath();
  c.moveTo(cx - 85, 262);
  c.quadraticCurveTo(cx - 100, 150, cx - 42, 112);
  c.lineTo(cx + 42, 112);
  c.quadraticCurveTo(cx + 100, 150, cx + 85, 262);
  c.closePath();
  c.fill();
  c.fillStyle = "rgba(255,240,180,.35)";
  c.beginPath();
  c.moveTo(cx - 38, 118);
  c.quadraticCurveTo(cx + 30, 140, cx + 92, 196);
  c.lineTo(cx + 90, 160);
  c.quadraticCurveTo(cx + 50, 125, cx + 38, 112);
  c.closePath();
  c.fill();

  c.fillStyle = gold;
  c.beginPath();
  c.ellipse(cx, 252, 30, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(120,70,15,.6)";
  c.stroke();

  c.fillStyle = gold;
  c.beginPath();
  c.ellipse(cx, 84, 24, 30, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(cx, 48, 10, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(cx - 26, 90, 5, 14, 0, 0, Math.PI * 2);
  c.ellipse(cx + 26, 90, 5, 14, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(255,240,190,.25)";
  c.fillRect(cx - 8, 108, 16, 10);
  return el;
}

export const ALTAR_W = 576;
export const ALTAR_H = 128;

/** Altar table: a lit top edge over a dark red front that fades toward the floor (576x128). */
export function bakeAltar(): HTMLCanvasElement {
  const [el, c] = canvas(ALTAR_W, ALTAR_H);
  const g = c.createLinearGradient(0, 0, 0, ALTAR_H);
  g.addColorStop(0, "#7a3a24");
  g.addColorStop(0.4, "#4a1d12");
  g.addColorStop(1, "#1a0b07");
  c.fillStyle = g;
  c.fillRect(0, 0, ALTAR_W, ALTAR_H);
  c.fillStyle = "rgba(255,200,120,.75)";
  c.fillRect(0, 0, ALTAR_W, 2);
  return el;
}

/** Small dark oil lamp with a lit flame and glow (60x70, base at bottom centre). */
export function bakeOilLamp(): HTMLCanvasElement {
  const [el, c] = canvas(60, 70);
  const glow = c.createRadialGradient(30, 24, 1, 30, 24, 28);
  glow.addColorStop(0, "rgba(255,200,100,.7)");
  glow.addColorStop(1, "rgba(255,200,100,0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, 60, 60);
  c.fillStyle = "#0e0807";
  c.strokeStyle = "rgba(200,150,80,.6)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(6, 44);
  c.lineTo(54, 44);
  c.quadraticCurveTo(52, 68, 30, 68);
  c.quadraticCurveTo(8, 68, 6, 44);
  c.closePath();
  c.fill();
  c.stroke();
  const flame = c.createLinearGradient(0, 18, 0, 44);
  flame.addColorStop(0, "#fff3b0");
  flame.addColorStop(1, "#ff9a2e");
  c.fillStyle = flame;
  c.beginPath();
  c.moveTo(30, 16);
  c.quadraticCurveTo(38, 32, 30, 44);
  c.quadraticCurveTo(22, 32, 30, 16);
  c.fill();
  return el;
}

export const BOWL_W = 150;
export const BOWL_H = 60;

/** Shallow red-brown incense bowl with a gold rim and a few unlit sticks standing in it (150x60, rim at the top). */
export function bakeIncenseBowl(): HTMLCanvasElement {
  const [el, c] = canvas(BOWL_W, BOWL_H);
  c.strokeStyle = "rgba(190,120,70,.8)";
  c.lineWidth = 1;
  for (const x of [38, 52, 66, 80, 94, 108]) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, 22);
    c.stroke();
  }
  const g = c.createLinearGradient(0, 22, 0, BOWL_H);
  g.addColorStop(0, "#8c3a24");
  g.addColorStop(1, "#3a130c");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, 22);
  c.lineTo(BOWL_W, 22);
  c.quadraticCurveTo(BOWL_W - 14, BOWL_H, BOWL_W / 2, BOWL_H);
  c.quadraticCurveTo(14, BOWL_H, 0, 22);
  c.closePath();
  c.fill();
  c.fillStyle = "rgba(240,190,110,.8)";
  c.fillRect(0, 21, BOWL_W, 2);
  return el;
}

/** The one lit stick standing in the bowl: pale shaft with a glowing tip (14x72, base at bottom centre). */
export function bakeLitStick(): HTMLCanvasElement {
  const [el, c] = canvas(14, 72);
  const glow = c.createRadialGradient(7, 8, 1, 7, 8, 8);
  glow.addColorStop(0, "rgba(255,150,60,.9)");
  glow.addColorStop(1, "rgba(255,150,60,0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, 14, 18);
  c.fillStyle = "#e8b36a";
  c.fillRect(5, 8, 4, 64);
  c.fillStyle = "#ff6a1e";
  c.fillRect(5, 6, 4, 4);
  return el;
}
