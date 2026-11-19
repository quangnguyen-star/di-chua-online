import styles from "./stage.module.css";
import type { PlaceId } from "../../../content/routes.ts";
import { HORIZON_Y, WORLD_H, WORLD_W } from "./art.ts";
import { palettes, type LightingPalette } from "./lighting.ts";
import { SCENES } from "./scenes/registry.ts";
import type { StageLighting } from "./types.ts";

const MOUNTAINS_FAR = `M0 ${HORIZON_Y} L0 300 Q120 230 240 290 T480 270 T720 292 T960 262 V${HORIZON_Y} Z`;
const MOUNTAINS_MID = `M0 ${HORIZON_Y} L0 330 Q160 290 300 332 T580 318 T960 330 V${HORIZON_Y} Z`;
const LANTERN_SLOTS = [
  [250, 430], [330, 470], [430, 445], [560, 480], [660, 440], [770, 475], [150, 465], [850, 435],
  [500, 505], [380, 500], [700, 505], [90, 500],
];

function Roof({ cx, y, w }: { cx: number; y: number; w: number }) {
  const l = cx - w;
  const r = cx + w;
  return (
    <path
      d={`M${l - 16} ${y - 12} Q${l + 10} ${y + 4} ${cx - w * 0.6} ${y} L${cx - w * 0.25} ${y - 20} H${cx + w * 0.25} L${cx + w * 0.6} ${y} Q${r - 10} ${y + 4} ${r + 16} ${y - 12} Q${r} ${y + 12} ${cx + w * 0.7} ${y + 10} H${cx - w * 0.7} Q${l} ${y + 12} ${l - 16} ${y - 12} Z`}
      fill="#0d0806"
      stroke="rgba(222,178,90,.9)"
      strokeWidth="1.5"
    />
  );
}

/** Finished still frame in the same lacquer look; used without WebGL, for reduced motion and as the server render. */
export function StaticScene({ place, lighting, ram, p = palettes[lighting] }: { place: PlaceId; lighting: StageLighting; ram: boolean; p?: LightingPalette }) {
  const backdrop = SCENES[place].backdrop;
  if (backdrop) return <BackdropStill lighting={lighting} ram={ram} p={p} horizon={backdrop.horizon} groundTop={backdrop.groundTop} groundBottom={backdrop.groundBottom} edge={backdrop.edge} />;
  return <PondStill lighting={lighting} ram={ram} p={p} />;
}

interface StillProps { lighting: StageLighting; ram: boolean; p: LightingPalette }

function BackdropStill({ lighting, ram, p, horizon, groundTop, groundBottom, edge }: StillProps & { horizon: number; groundTop: string; groundBottom: string; edge: string }) {
  const [moonX, moonY] = p.orb === "moon" ? [700, horizon - 250] : [840, horizon - 280];
  return (
    <svg className={styles.fallback} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" data-testid="stage-static">
      <defs>
        <linearGradient id={`sky-${lighting}-${horizon}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <linearGradient id={`ground-${horizon}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={groundTop} />
          <stop offset="1" stopColor={groundBottom} />
        </linearGradient>
        <radialGradient id={`halo-${horizon}`}>
          <stop offset="0" stopColor="#f4d98c" stopOpacity={p.haloAlpha} />
          <stop offset="1" stopColor="#f4d98c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={WORLD_W} height={horizon} fill={`url(#sky-${lighting}-${horizon})`} />
      {p.orb === "moon" || ram ? (
        <g>
          <circle cx={moonX} cy={moonY} r="150" fill={`url(#halo-${horizon})`} />
          <circle cx={moonX} cy={moonY} r="46" fill="#d4a548" />
        </g>
      ) : null}
      {p.orb === "sun" ? (
        <g>
          <circle cx="700" cy={horizon - 200} r="130" fill={`url(#halo-${horizon})`} />
          <circle cx="700" cy={horizon - 200} r="38" fill="#d4a548" />
        </g>
      ) : null}
      <rect y={horizon - 120} width={WORLD_W} height="120" fill="#fbf0d8" opacity={p.mist * 0.3} />
      <rect y={horizon} width={WORLD_W} height={WORLD_H - horizon} fill={`url(#ground-${horizon})`} />
      <rect y={horizon} width={WORLD_W} height="3" fill={edge} opacity=".8" />
    </svg>
  );
}

function PondStill({ lighting, ram, p }: StillProps) {
  const lanterns = LANTERN_SLOTS.slice(0, p.lanterns + (ram ? 6 : 0));
  const [moonX, moonY] = p.orb === "moon" ? [700, 120] : [840, 90];
  const showMoon = p.orb === "moon" || ram;
  return (
    <svg className={styles.fallback} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" data-testid="stage-static">
      <defs>
        <linearGradient id={`sky-${lighting}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <linearGradient id="lq-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120b08" />
          <stop offset="1" stopColor="#060403" />
        </linearGradient>
        <radialGradient id="lq-orb">
          <stop offset="0" stopColor="#f4d98c" />
          <stop offset="0.62" stopColor="#d4a548" />
          <stop offset="1" stopColor="#9c6f22" />
        </radialGradient>
        <radialGradient id="lq-halo">
          <stop offset="0" stopColor="#f4d98c" stopOpacity={p.haloAlpha} />
          <stop offset="1" stopColor="#f4d98c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lq-glow">
          <stop offset="0" stopColor="#f0b450" stopOpacity=".55" />
          <stop offset="1" stopColor="#f0b450" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={WORLD_W} height={HORIZON_Y} fill={`url(#sky-${lighting})`} />
      {showMoon ? (
        <g>
          <circle cx={moonX} cy={moonY} r="150" fill="url(#lq-halo)" />
          <circle cx={moonX} cy={moonY} r="46" fill="url(#lq-orb)" />
        </g>
      ) : null}
      {p.orb === "sun" ? (
        <g>
          <circle cx="700" cy="170" r="130" fill="url(#lq-halo)" />
          <circle cx="700" cy="170" r="38" fill="url(#lq-orb)" />
        </g>
      ) : null}
      <path d={MOUNTAINS_FAR} fill={p.farMountain} stroke="rgba(214,166,72,.55)" />
      <path d={MOUNTAINS_MID} fill={p.midMountain} stroke="rgba(232,190,100,.7)" />
      <rect y={HORIZON_Y - 150} width={WORLD_W} height="150" fill="#fbf0d8" opacity={p.mist * 0.35} />
      <path d={`M0 ${HORIZON_Y + 6} Q220 ${HORIZON_Y - 10} 480 ${HORIZON_Y - 2} T960 ${HORIZON_Y} V${HORIZON_Y + 40} H0 Z`} fill="#100a07" />
      <g fill="#170d09" stroke="rgba(222,178,90,.9)" strokeWidth="1.5">
        <rect x="300" y={HORIZON_Y - 94} width="360" height="96" />
        <path d={`M324 ${HORIZON_Y + 2} V${HORIZON_Y - 38} A30 30 0 0 1 384 ${HORIZON_Y - 38} V${HORIZON_Y + 2} Z`} fill="#2a120b" />
        <path d={`M440 ${HORIZON_Y + 2} V${HORIZON_Y - 42} A40 40 0 0 1 520 ${HORIZON_Y - 42} V${HORIZON_Y + 2} Z`} fill="#2a120b" />
        <path d={`M576 ${HORIZON_Y + 2} V${HORIZON_Y - 38} A30 30 0 0 1 636 ${HORIZON_Y - 38} V${HORIZON_Y + 2} Z`} fill="#2a120b" />
        <rect x="410" y={HORIZON_Y - 148} width="140" height="36" />
      </g>
      <Roof cx={480} y={HORIZON_Y - 94} w={188} />
      <Roof cx={480} y={HORIZON_Y - 148} w={96} />
      <rect y={HORIZON_Y} width={WORLD_W} height={WORLD_H - HORIZON_Y} fill="url(#lq-water)" />
      <g className={styles.glint} stroke="rgba(244,217,140,.55)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M520 400 h22 M590 418 h30 M540 438 h16 M610 455 h24 M500 480 h28 M640 492 h18" />
      </g>
      {lanterns.map(([x, y]) => (
        <g key={`${x}-${y}`} className={styles.lanternGlow}>
          <circle cx={x} cy={y} r="26" fill="url(#lq-glow)" />
          <rect x={x - 1.5} y={y + 8} width="3" height="26" fill="#f0b450" opacity=".3" />
          <path d={`M${x - 10} ${y + 6} Q${x - 12} ${y - 6} ${x} ${y - 14} Q${x + 12} ${y - 6} ${x + 10} ${y + 6} Z`} fill="#b8261a" stroke="#e2b65a" />
          <circle cx={x} cy={y - 3} r="3" fill="rgba(255,220,140,.95)" />
        </g>
      ))}
    </svg>
  );
}
