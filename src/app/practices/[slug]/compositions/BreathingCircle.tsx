import styles from "./compositions.module.css";

const R = 90;
const C = 2 * Math.PI * R;

/** A still focus anchor. The ring only shows time used; it never expands or contracts as a breathing cadence. */
export function BreathingCircle({ progress }: { progress: number }) {
  return (
    <svg className={styles.circle} viewBox="0 0 200 200" role="img" aria-label="Vòng tròn giữ sự chú ý" data-testid="composition-breathing">
      <circle cx="100" cy="100" r={R} fill="var(--paper)" stroke="var(--border)" strokeWidth="6" />
      <circle
        className={styles.ring}
        cx="100"
        cy="100"
        r={R}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - progress)}
        transform="rotate(-90 100 100)"
      />
      <circle cx="100" cy="100" r="46" fill="var(--moss)" opacity="0.35" />
      <circle cx="100" cy="100" r="6" fill="var(--wood)" />
    </svg>
  );
}
