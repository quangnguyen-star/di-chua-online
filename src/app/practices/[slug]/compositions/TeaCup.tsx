import styles from "./compositions.module.css";

/** Cup, saucer, steam and a soft shadow. Steam drifts only while the practice is running. */
export function TeaCup({ running }: { running: boolean }) {
  const steam = (extra: string) => `${styles.steam} ${running ? styles.steamLive : ""} ${extra}`;
  return (
    <svg className={styles.tea} viewBox="0 0 240 180" role="img" aria-label="Tách trà đặt trên đĩa, hơi nước bốc lên" data-testid="composition-tea">
      <ellipse cx="120" cy="156" rx="86" ry="10" fill="var(--text)" opacity="0.18" />
      <ellipse cx="120" cy="146" rx="80" ry="12" fill="var(--border)" stroke="var(--wood)" strokeWidth="3" />
      <path d="M62 78 H178 Q178 140 120 140 Q62 140 62 78 Z" fill="var(--surface)" stroke="var(--wood)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M178 90 Q208 90 204 112 Q200 128 170 126" fill="none" stroke="var(--wood)" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="120" cy="80" rx="58" ry="7" fill="var(--moss)" opacity="0.6" />
      <path className={steam("")} d="M96 62 Q86 48 96 34 Q106 20 96 8" />
      <path className={steam(styles.steam2)} d="M122 62 Q112 48 122 34 Q132 20 122 8" />
      <path className={steam(styles.steam3)} d="M148 62 Q138 48 148 34 Q158 20 148 8" />
    </svg>
  );
}
