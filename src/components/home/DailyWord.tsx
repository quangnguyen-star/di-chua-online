import type { DailyWord as DailyWordData } from "@/content";
import styles from "./home.module.css";

export function DailyWord({ word }: { word: DailyWordData }) {
  return (
    <section className={styles.word} data-testid="daily-word" aria-labelledby="daily-word-heading">
      <h2 id="daily-word-heading" className={styles.wordLabel}>Lời nhắc hôm nay</h2>
      <p className={styles.wordText}>{word.word}</p>
      <p className={styles.reflection}>{word.reflection}</p>
      <p className={`muted ${styles.credit}`}>{word.credit}</p>
      <div className={styles.loreSlot} data-slot="lunar-note" />
    </section>
  );
}
