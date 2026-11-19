import styles from "./visit.module.css";

const PANEL_WIDTH = 400;

/** One persistent SVG: the four places sit side by side and `index` slides the view across them. */
export default function VisitScene({ index, pulse }: { index: number; pulse: number }) {
  return (
    <svg
      className={styles.scene}
      viewBox={`0 0 ${PANEL_WIDTH} 200`}
      role="img"
      aria-label="Phong cảnh chùa"
      data-testid="visit-scene"
      data-scene={index}
    >
      <g className={styles.strip} style={{ transform: `translateX(${-index * PANEL_WIDTH}px)` }}>
        <g data-scene-id="gate">
          <rect x="0" y="150" width="400" height="50" fill="#b9a982" />
          <rect x="130" y="60" width="14" height="95" fill="#7a2e22" />
          <rect x="256" y="60" width="14" height="95" fill="#7a2e22" />
          <path d="M110 62 L200 30 L290 62 Z" fill="#5a4030" />
          <rect x="120" y="62" width="160" height="10" fill="#7a2e22" />
        </g>
        <g data-scene-id="courtyard" transform={`translate(${PANEL_WIDTH} 0)`}>
          <rect x="0" y="130" width="400" height="70" fill="#c9b98f" />
          <rect x="170" y="100" width="60" height="30" rx="4" fill="#6b7255" />
          <circle cx="70" cy="90" r="30" fill="#6b7255" />
          <rect x="66" y="110" width="8" height="30" fill="#5a4030" />
          <circle cx="330" cy="95" r="26" fill="#4f5740" />
          <rect x="326" y="112" width="8" height="28" fill="#5a4030" />
        </g>
        <g data-scene-id="hall" transform={`translate(${PANEL_WIDTH * 2} 0)`}>
          <rect x="0" y="150" width="400" height="50" fill="#8b6a4a" />
          <rect x="90" y="70" width="220" height="82" fill="#f1e4c4" />
          <path d="M70 72 L200 25 L330 72 Z" fill="#7a2e22" />
          <rect x="176" y="100" width="48" height="52" fill="#5a4030" />
          <circle cx="200" cy="92" r="6" fill="#b08a3e" />
        </g>
        <g data-scene-id="return" transform={`translate(${PANEL_WIDTH * 3} 0)`}>
          <rect x="0" y="140" width="400" height="60" fill="#b9a982" />
          <path d="M120 200 L190 140 L210 140 L280 200 Z" fill="#d8ccaa" />
          <circle cx="320" cy="50" r="22" fill="#e6c36a" />
        </g>
      </g>
      {pulse > 0 && (
        <g key={pulse} aria-hidden="true" data-testid="visit-bell">
          <circle className={styles.ripple} cx="200" cy="100" r="30" />
          <circle className={`${styles.ripple} ${styles.ripple2}`} cx="200" cy="100" r="30" />
        </g>
      )}
    </svg>
  );
}
