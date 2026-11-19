import styles from "./art.module.css";
import { ArtCanvas, Ground, Mist, Sky } from "./layers";
import type { ArtSceneProps } from "./types";

/** One curved tile roof: a ridge with upturned eaves, centred on cx. */
function Roof({ cx, y, half, rise }: { cx: number; y: number; half: number; rise: number }) {
  const l = cx - half;
  const r = cx + half;
  const body = `M${l - 8} ${y - 6} Q${l + half * 0.35} ${y + 4} ${cx} ${y - rise} Q${r - half * 0.35} ${y + 4} ${r + 8} ${y - 6} L${r} ${y + 8} L${l} ${y + 8} Z`;
  const edge = `M${l - 8} ${y - 6} Q${l + half * 0.35} ${y + 4} ${cx} ${y - rise} Q${r - half * 0.35} ${y + 4} ${r + 8} ${y - 6}`;
  return (
    <g>
      <path className={styles.roof} d={body} />
      <path className={styles.roofEdge} d={edge} />
      {[0.3, 0.55, 0.8].map((t) => (
        <path key={t} className={styles.tileLine} d={`M${l + 6} ${y + 8 - t * 12} Q${cx} ${y - rise * t + 4} ${r - 6} ${y + 8 - t * 12}`} />
      ))}
    </g>
  );
}

/** The gate's bounding shape in the 400x240 viewBox, roof eaves to bottom step. */
export const TAM_QUAN_BOUNDS = { x: 58, y: 54, width: 284, height: 154 } as const;

/** A couplet board: red lacquer with decorative gold marks. Not legible verse. */
function Couplet({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <rect className={styles.couplet} x={x} y={y} width="14" height="54" rx="1" />
      {[0, 1, 2, 3].map((n) => (
        <rect key={n} className={styles.mark} x={x + 4} y={y + 6 + n * 12} width="6" height={n % 2 ? 5 : 7} rx="1" />
      ))}
    </g>
  );
}

export function TamQuanStill({
  variant = "auto",
  label = "Cổng tam quan ba lối đi với mái ngói cong nhiều tầng",
  className,
  testId = "art-tam-quan",
}: ArtSceneProps) {
  return (
    <ArtCanvas variant={variant} label={label} className={className} testId={testId}>
      <Sky />
      <Ground y={196} height={44} />
      <Mist y={150} height={60} opacity={0.45} />
      {/* steps */}
      <rect className={styles.step} x="160" y="196" width="80" height="6" />
      <rect className={styles.step} x="152" y="202" width="96" height="6" />
      {/* side passages: walls and pillars end under the roof eaves */}
      <rect className={styles.wall} x="78" y="148" width="64" height="48" />
      <rect className={styles.wall} x="258" y="148" width="64" height="48" />
      <rect className={styles.opening} x="96" y="160" width="28" height="36" />
      <rect className={styles.opening} x="276" y="160" width="28" height="36" />
      <rect className={styles.pillar} x="78" y="148" width="7" height="48" />
      <rect className={styles.pillar} x="135" y="148" width="7" height="48" />
      <rect className={styles.pillar} x="258" y="148" width="7" height="48" />
      <rect className={styles.pillar} x="315" y="148" width="7" height="48" />
      <Roof cx={110} y={140} half={44} rise={18} />
      <Roof cx={290} y={140} half={44} rise={18} />
      {/* central passage */}
      <rect className={styles.wall} x="148" y="86" width="104" height="110" />
      <rect className={styles.wall} x="160" y="86" width="80" height="34" />
      <rect className={styles.opening} x="178" y="140" width="44" height="56" />
      <rect className={styles.pillar} x="148" y="120" width="10" height="76" />
      <rect className={styles.pillar} x="242" y="120" width="10" height="76" />
      <rect className={styles.plaque} x="178" y="122" width="44" height="14" rx="1" />
      <text className={styles.plaqueText} x="200" y="132" textAnchor="middle">Tam Quan</text>
      <Couplet x={160} y={134} />
      <Couplet x={226} y={134} />
      <Roof cx={200} y={112} half={66} rise={20} />
      <Roof cx={200} y={78} half={48} rise={24} />
    </ArtCanvas>
  );
}
