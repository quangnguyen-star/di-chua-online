import styles from "./home.module.css";

export function GateMotif() {
  return (
    <svg
      className={styles.gate}
      viewBox="0 0 400 220"
      role="img"
      aria-label="Cổng tam quan với mái cong, hàng cột và sân chùa phía sau, ánh sáng dịu bên trong"
      focusable="false"
      data-testid="home-gate"
    >
      <rect className={styles.sky} x="0" y="0" width="400" height="220" rx="12" />
      <circle className={styles.glow} cx="200" cy="120" r="70" />
      <path className={styles.far} d="M0 150 Q70 110 140 140 T270 135 T400 145 V190 H0 Z" />
      <g className={styles.beyondHall}>
        <path d="M150 128 Q200 108 250 128 Z" />
        <rect x="160" y="128" width="80" height="30" />
      </g>
      <rect className={styles.ground} x="0" y="186" width="400" height="34" />
      <path className={styles.light} d="M170 190 L230 190 L248 220 L152 220 Z" />

      <rect className={styles.opening} x="132" y="104" width="136" height="82" />
      <rect className={styles.light} x="168" y="104" width="64" height="82" />

      <rect className={styles.column} x="124" y="100" width="12" height="90" />
      <rect className={styles.column} x="164" y="100" width="8" height="90" />
      <rect className={styles.column} x="228" y="100" width="8" height="90" />
      <rect className={styles.column} x="264" y="100" width="12" height="90" />
      <rect className={styles.beam} x="118" y="92" width="164" height="12" />

      <path className={styles.roof} d="M60 94 Q150 92 200 36 Q250 92 340 94 Q330 78 296 78 Q240 70 200 24 Q160 70 104 78 Q70 78 60 94 Z" />
      <path className={styles.roofEdge} d="M54 96 Q150 94 200 30 Q250 94 346 96" />
      <path className={styles.roofEdge} d="M54 96 Q48 90 44 80 M346 96 Q352 90 356 80" />
      <path className={styles.roof} d="M92 104 Q130 104 160 80 L240 80 Q270 104 308 104 Q270 98 240 94 H160 Q130 98 92 104 Z" />
    </svg>
  );
}
