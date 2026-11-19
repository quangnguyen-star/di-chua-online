import styles from "./visit.module.css";

const WIDTH = 400;
const HEIGHT = 240;

/** Each scene is three layers: a background plane, one focal object and a foreground frame. No figures. */
function Gate() {
  return (
    <>
      <g data-layer="background">
        <rect x="0" y="0" width="400" height="150" fill="#d8ccaa" opacity="0.5" />
        <circle cx="70" cy="110" r="42" fill="#6b7255" />
        <circle cx="340" cy="115" r="36" fill="#4f5740" />
        <rect x="0" y="170" width="400" height="70" fill="#b9a982" />
      </g>
      <g data-layer="focal">
        <rect x="140" y="70" width="14" height="110" fill="#7a2e22" />
        <rect x="246" y="70" width="14" height="110" fill="#7a2e22" />
        <rect x="124" y="78" width="152" height="10" fill="#7a2e22" />
        <path d="M110 74 L200 38 L290 74 Z" fill="#5a4030" />
        <path d="M160 240 L180 180 L220 180 L240 240 Z" fill="#c9b98f" />
      </g>
      <g data-layer="foreground">
        <rect x="0" y="214" width="400" height="26" fill="#8b6a4a" />
        <rect x="14" y="150" width="8" height="70" fill="#5a4030" />
        <circle cx="18" cy="140" r="24" fill="#4f5740" />
      </g>
    </>
  );
}

function Courtyard() {
  return (
    <>
      <g data-layer="background">
        <rect x="0" y="0" width="400" height="110" fill="#d8ccaa" opacity="0.5" />
        <rect x="120" y="62" width="160" height="50" fill="#f1e4c4" />
        <path d="M108 64 L200 30 L292 64 Z" fill="#7a2e22" />
        <rect x="0" y="110" width="400" height="130" fill="#c9b98f" />
      </g>
      <g data-layer="focal">
        <rect x="192" y="96" width="16" height="70" fill="#5a4030" />
        <circle cx="200" cy="86" r="44" fill="#6b7255" />
        <path d="M150 170 L250 170 L270 190 L130 190 Z" fill="#b9a982" />
      </g>
      <g data-layer="foreground">
        <rect x="0" y="206" width="400" height="34" fill="#b9a982" />
        <circle cx="48" cy="214" r="9" fill="#8b6a4a" />
        <circle cx="352" cy="220" r="7" fill="#8b6a4a" />
        <path d="M0 0 L0 120 L26 70 L40 0 Z" fill="#4f5740" />
        <path d="M400 0 L400 110 L372 64 L356 0 Z" fill="#4f5740" />
      </g>
    </>
  );
}

function Hall() {
  return (
    <>
      <g data-layer="background">
        <rect x="0" y="0" width="400" height="240" fill="#5a4030" opacity="0.35" />
        <rect x="60" y="40" width="280" height="150" fill="#f1e4c4" />
        <path d="M40 44 L200 8 L360 44 Z" fill="#7a2e22" />
      </g>
      <g data-layer="focal">
        <rect x="150" y="104" width="100" height="14" fill="#5a4030" />
        <rect x="156" y="118" width="88" height="60" fill="#8b6a4a" />
        <circle cx="200" cy="82" r="14" fill="#b08a3e" />
        <path d="M200 52 L206 72 L194 72 Z" fill="#e6c36a" />
      </g>
      <g data-layer="foreground">
        <rect x="0" y="190" width="400" height="50" fill="#8b6a4a" />
        <rect x="20" y="30" width="18" height="190" fill="#7a2e22" />
        <rect x="362" y="30" width="18" height="190" fill="#7a2e22" />
        <rect x="170" y="196" width="60" height="20" rx="8" fill="#b08a3e" />
      </g>
    </>
  );
}

function Return() {
  return (
    <>
      <g data-layer="background">
        <rect x="0" y="0" width="400" height="140" fill="#d8ccaa" opacity="0.5" />
        <circle cx="318" cy="64" r="26" fill="#e6c36a" />
        <path d="M0 150 L90 100 L170 150 Z" fill="#6b7255" />
        <path d="M120 150 L230 84 L340 150 Z" fill="#4f5740" />
        <rect x="0" y="150" width="400" height="90" fill="#c9b98f" />
      </g>
      <g data-layer="focal">
        <path d="M150 240 L186 150 L214 150 L250 240 Z" fill="#d8ccaa" />
        <rect x="120" y="120" width="12" height="40" fill="#7a2e22" />
        <rect x="268" y="120" width="12" height="40" fill="#7a2e22" />
      </g>
      <g data-layer="foreground">
        <rect x="0" y="214" width="400" height="26" fill="#b9a982" />
        <path d="M0 0 L0 90 L30 50 L52 0 Z" fill="#5a4030" />
        <rect x="360" y="170" width="6" height="60" fill="#5a4030" />
        <circle cx="363" cy="160" r="20" fill="#4f5740" />
      </g>
    </>
  );
}

const scenes = [Gate, Courtyard, Hall, Return];

export default function VisitScene({ index, pulse }: { index: number; pulse: number }) {
  const Current = scenes[index] ?? Gate;
  return (
    <svg
      className={styles.scene}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Phong cảnh chùa"
      data-testid="visit-scene"
      data-scene={index}
    >
      <g key={index} className={styles.panel}>
        <Current />
      </g>
      {pulse > 0 && (
        <g key={pulse} aria-hidden="true" data-testid="visit-bell">
          <circle className={styles.ripple} cx="200" cy="120" r="30" />
          <circle className={`${styles.ripple} ${styles.ripple2}`} cx="200" cy="120" r="30" />
        </g>
      )}
    </svg>
  );
}
