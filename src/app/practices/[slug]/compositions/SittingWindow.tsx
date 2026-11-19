import styles from "./compositions.module.css";

/** A still window vignette; the light patch fades slowly as the sitting goes on. */
export function SittingWindow({ progress }: { progress: number }) {
  return (
    <svg className={styles.window} viewBox="0 0 200 240" role="img" aria-label="Ô cửa sổ tĩnh lặng" data-testid="composition-sitting">
      <rect x="20" y="20" width="160" height="200" rx="6" fill="var(--wood)" />
      <rect x="32" y="32" width="136" height="176" rx="3" fill="var(--paper)" />
      <path d="M100 32 V208 M32 120 H168" stroke="var(--wood)" strokeWidth="6" />
      <g className={styles.light} opacity={0.5 - 0.3 * progress}>
        <path d="M44 208 L96 130 L150 130 L120 208 Z" fill="var(--gold)" />
      </g>
      <rect x="10" y="218" width="180" height="8" rx="3" fill="var(--wood)" />
    </svg>
  );
}
