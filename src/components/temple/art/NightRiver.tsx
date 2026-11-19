import styles from "./art.module.css";
import { ArtCanvas, Mist, Sky } from "./layers";
import type { ArtSceneProps } from "./types";

/** Night-river frame: moon, far bank, water and reflections. Defaults to the night variant. */
export function NightRiver({
  variant = "night",
  label = "Dòng sông về đêm dưới trăng, mặt nước lăn tăn ánh sáng",
  className,
  testId = "art-night-river",
}: ArtSceneProps) {
  return (
    <ArtCanvas variant={variant} label={label} className={className} testId={testId}>
      <Sky />
      <circle className={styles.moonHalo} cx="290" cy="64" r="40" />
      <circle className={styles.moon} cx="290" cy="64" r="22" />
      <path className={styles.bank} d="M0 130 Q60 112 130 126 T260 122 T400 128 V140 H0 Z" />
      <rect className={styles.water} x="0" y="138" width="400" height="102" />
      <Mist y={120} height={40} opacity={0.4} />
      <g className={styles.ripple}>
        <path className={styles.waterLine} d="M270 156 H310" />
        <path className={styles.waterLine} d="M262 172 H318" />
        <path className={styles.waterLine} d="M276 190 H304" />
      </g>
      <path className={styles.waterLine} d="M40 170 H120 M70 200 H150 M200 210 H280" />
    </ArtCanvas>
  );
}
