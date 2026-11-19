import styles from "./art.module.css";
import { ArtCanvas, Ground, Sky } from "./layers";
import type { ArtSceneProps } from "./types";

/** Stick, ember and smoke. Animation is CSS-only and switched off under prefers-reduced-motion. */
export function IncenseAnimation({
  variant = "auto",
  label = "Nén nhang đang cháy, khói mảnh bay lên",
  className,
  testId = "art-incense",
}: ArtSceneProps) {
  return (
    <ArtCanvas variant={variant} label={label} className={className} testId={testId}>
      <Sky />
      <Ground y={200} height={40} />
      <path className={styles.smoke} d="M200 120 C188 100 212 86 200 66 C190 50 208 38 200 22" />
      <path className={`${styles.smoke} ${styles.smokeB}`} d="M200 120 C214 104 190 90 202 72 C210 58 194 44 204 30" />
      <circle className={styles.ember} cx="200" cy="122" r="3.5" />
      <rect className={styles.stick} x="198.5" y="124" width="3" height="66" rx="1.5" />
      <ellipse className={styles.bowl} cx="200" cy="206" rx="46" ry="12" />
      <ellipse className={styles.ash} cx="200" cy="198" rx="40" ry="7" />
      <rect className={styles.stick} x="198.5" y="164" width="3" height="30" rx="1.5" />
    </ArtCanvas>
  );
}
