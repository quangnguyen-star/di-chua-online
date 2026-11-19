import type { DailyWord as DailyWordData } from "@/content";

export function DailyWord({ word }: { word: DailyWordData }) {
  return (
    <section className="home-word card" data-testid="daily-word" aria-labelledby="daily-word-heading">
      <h2 id="daily-word-heading" className="home-word__label">Lời nhắc hôm nay</h2>
      <p className="home-word__word">{word.word}</p>
      <p>{word.reflection}</p>
      <p className="muted home-word__credit">{word.credit}</p>
    </section>
  );
}
