import Link from "next/link";
import { readyRoutes, type PlaceId } from "@/content/routes";
import styles from "./map.module.css";

/** Where each place's marker sits, as percentages of the 960x540 map frame; the gate marker sits just below the drawn gate so its label stays off it. */
const spots: Record<PlaceId, { left: number; top: number }> = {
  gate: { left: 46.875, top: 85 },
  courtyard: { left: 46.875, top: 59.62962962962963 },
  hall: { left: 46.875, top: 39.62962962962963 },
  pond: { left: 31.25, top: 27.77777777777778 },
  veranda: { left: 63.75, top: 31.11111111111111 },
  outside: { left: 60, top: 86.29629629629629 },
};

const ROUTE_POINTS = "450,432 450,322 450,214 360,196 300,150 612,168 700,210 700,440 576,466";

function MapGround() {
  return (
    <svg className={styles.ground} viewBox="0 0 960 540" aria-hidden="true" focusable="false">
      <path className={styles.range} d="M0 74 L70 40 L130 58 L210 18 L290 52 L360 30 L450 62 L540 22 L620 48 L700 14 L790 46 L860 28 L960 58 L960 0 L0 0 Z" />
      <path className={styles.river} d="M0 100 C160 92 300 118 480 104 C660 90 800 116 960 102 L960 136 C800 150 640 124 480 140 C300 156 160 128 0 138 Z" />
      <rect className={styles.wall} x="236" y="150" width="440" height="282" rx="18" />
      <rect className={styles.body} x="380" y="190" width="140" height="48" />
      <rect className={styles.court} x="350" y="262" width="200" height="130" />
      <rect className={styles.body} x="425" y="410" width="50" height="22" />
      <circle className={styles.tree} cx="150" cy="300" r="24" />
      <circle className={styles.tree} cx="180" cy="350" r="18" />
      <circle className={styles.tree} cx="800" cy="330" r="22" />
      <circle className={styles.tree} cx="830" cy="280" r="16" />
      <polyline className={styles.route} points={ROUTE_POINTS} />
    </svg>
  );
}

export function TempleMap() {
  return (
    <div className={styles.map} data-testid="temple-map">
      <MapGround />
      <ol className={styles.spots} aria-label="Sáu chặng ghé thăm">
        {readyRoutes.map((p, i) => (
          <li key={p.id} className={styles.spot} style={{ left: `${spots[p.id].left}%`, top: `${spots[p.id].top}%` }}>
            <Link href={`/visit/?stop=${p.id}`} className={styles.spotLink} data-testid={`map-place-${p.id}`}>
              <span className={styles.badge} aria-hidden="true">{i + 1}</span>
              <span className={styles.name}>{p.name}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
