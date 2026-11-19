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

export function TamQuanStill({
  variant = "auto",
  label = "Cổng tam quan ba lối đi với mái ngói cong nhiều tầng",
  className,
  testId = "art-tam-quan",
}: ArtSceneProps) {
  return (
    <ArtCanvas variant={variant} label={label} className={className} testId={testId}>
      <Sky />
      <circle className={styles.glow} cx="200" cy="130" r="70" />
      <Ground y={196} height={44} />
      <Mist y={150} height={60} opacity={0.45} />
      {/* side passages */}
      <rect className={styles.wall} x="78" y="132" width="64" height="64" />
      <rect className={styles.wall} x="258" y="132" width="64" height="64" />
      <rect className={styles.opening} x="96" y="150" width="28" height="46" />
      <rect className={styles.opening} x="276" y="150" width="28" height="46" />
      <rect className={styles.pillar} x="78" y="132" width="7" height="64" />
      <rect className={styles.pillar} x="135" y="132" width="7" height="64" />
      <rect className={styles.pillar} x="258" y="132" width="7" height="64" />
      <rect className={styles.pillar} x="315" y="132" width="7" height="64" />
      <Roof cx={110} y={132} half={44} rise={18} />
      <Roof cx={290} y={132} half={44} rise={18} />
      {/* central passage, two roof tiers */}
      <rect className={styles.wall} x="148" y="96" width="104" height="100" />
      <rect className={styles.opening} x="172" y="120" width="56" height="76" />
      <rect className={styles.pillar} x="148" y="96" width="10" height="100" />
      <rect className={styles.pillar} x="242" y="96" width="10" height="100" />
      <rect className={styles.pillar} x="162" y="112" width="6" height="84" />
      <rect className={styles.pillar} x="232" y="112" width="6" height="84" />
      <Roof cx={200} y={112} half={66} rise={20} />
      <Roof cx={200} y={78} half={48} rise={24} />
    </ArtCanvas>
  );
}
