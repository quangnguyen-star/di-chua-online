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
