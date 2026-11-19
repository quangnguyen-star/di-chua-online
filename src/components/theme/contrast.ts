/** WCAG 2.x relative luminance and contrast ratio for #rrggbb colours. */
function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Dark-theme foreground/background pairs actually used; mirrors src/styles/evening.css. */
export const eveningPairs: ReadonlyArray<readonly [name: string, fg: string, bg: string]> = [
  ["text on bg", "#efe6d6", "#1c1712"],
  ["text on surface", "#efe6d6", "#262019"],
  ["muted on bg", "#c4b6a2", "#1c1712"],
  ["muted on surface", "#c4b6a2", "#262019"],
  ["link on bg", "#eeaa9a", "#1c1712"],
  ["link on surface", "#eeaa9a", "#262019"],
  ["link on nav hover", "#eeaa9a", "#4a3f33"],
  ["brand on bg", "#d9c0a3", "#1c1712"],
  ["gold-text on bg", "#e0be72", "#1c1712"],
  ["gold-text on surface", "#e0be72", "#262019"],
  ["button text on gold", "#2b1f12", "#d4a853"],
  ["button text on gold hover", "#2b1f12", "#e0b862"],
  ["quiet button on bg", "#d9c0a3", "#1c1712"],
  ["quiet button on hover", "#d9c0a3", "#4a3f33"],
  ["focus ring on bg", "#eeaa9a", "#1c1712"],
];

/** Art-layer text and control pairs; mirrors src/styles/tokens.css (day = :root, night = evening/dark). */
export const artDayPairs: ReadonlyArray<readonly [name: string, fg: string, bg: string]> = [
  ["art text on sky top", "#34281f", "#dfe6e0"],
  ["art text on sky bottom", "#34281f", "#f4eee2"],
  ["art muted on sky top", "#5f4d3e", "#dfe6e0"],
  ["art muted on sky bottom", "#5f4d3e", "#f4eee2"],
  ["art text on ground", "#34281f", "#b9a982"],
  ["art text on mist", "#34281f", "#fbf7ee"],
  ["art control text on control", "#fbf7ee", "#7a2e22"],
];

export const artNightPairs: ReadonlyArray<readonly [name: string, fg: string, bg: string]> = [
  ["art text on sky top", "#efe6d6", "#141018"],
  ["art text on sky bottom", "#efe6d6", "#2a2233"],
  ["art muted on sky top", "#c4b6a2", "#141018"],
  ["art muted on sky bottom", "#c4b6a2", "#2a2233"],
  ["art text on ground", "#efe6d6", "#2b261c"],
  ["art text on water", "#efe6d6", "#1f2a3a"],
  ["art text on mist", "#efe6d6", "#5b5266"],
  ["art control text on control", "#2b1f12", "#eeaa9a"],
];

/** Lacquer stage text and control pairs; mirrors the --lq-* tokens in src/styles/tokens.css. */
export const lacquerPairs: ReadonlyArray<readonly [name: string, fg: string, bg: string]> = [
  ["lacquer text on đen then", "#f4e6c4", "#0b0706"],
  ["lacquer text on đen then deep", "#f4e6c4", "#22140c"],
  ["lacquer text on nâu cánh gián", "#f4e6c4", "#3b1610"],
  ["lacquer muted on đen then", "#cdb98f", "#0b0706"],
  ["lacquer muted on đen then deep", "#cdb98f", "#22140c"],
  ["lacquer gold on đen then", "#e2b65a", "#0b0706"],
  ["lacquer gold on đen then deep", "#e2b65a", "#22140c"],
  ["lacquer silver on đen then", "#d8d5cf", "#0b0706"],
  ["lacquer moss on đen then", "#a3bf8e", "#0b0706"],
  ["lacquer moss on đen then deep", "#a3bf8e", "#22140c"],
  ["lacquer text on water", "#f4e6c4", "#120b08"],
  ["lacquer control text on control", "#1a0f08", "#d4a548"],
];
