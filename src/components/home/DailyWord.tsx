import Link from "next/link";
import styles from "./home.module.css";

export function DailyWord() {
  return (
    <section className={styles.word} data-testid="daily-word" data-opened="false" aria-labelledby="daily-word-heading">
      <h2 id="daily-word-heading" className={styles.wordLabel}>Lời nhắc hôm nay</h2>
      <Link href="/visit/?stop=outside" className={styles.sealed} data-testid="daily-word-sealed">
        <span className={styles.note} aria-hidden="true"><span className={styles.seal} /></span>
        <span>Chưa mở · chờ bạn ở chặng 6</span>
      </Link>
      <div className={styles.loreSlot} data-slot="lunar-note" />
    </section>
  );
}
