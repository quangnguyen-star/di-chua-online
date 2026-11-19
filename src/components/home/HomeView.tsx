import Link from "next/link";
import { wordForDate } from "@/content";
import type { DailyWord as DailyWordData } from "@/content";
import { ErrorState } from "@/components/shell/ErrorState";
import { DailyWord } from "./DailyWord";
import { TempleMap } from "@/components/temple/map";
import { LunarNote } from "./LunarNote";
import { PlaceLinks } from "./PlaceLinks";
import styles from "./home.module.css";

function todaysWord(): DailyWordData | null {
  try {
    return wordForDate(new Date()) ?? null;
  } catch {
    return null;
  }
}

export function HomeView() {
  const word = todaysWord();

  return (
    <div className={`scene ${styles.home}`}>
      <div className={styles.hero}>
        <TempleMap />
        <h1 className={styles.title}>Đi Chùa Online</h1>
        <p className={styles.intro}>Một khoảng dừng ngắn, chậm rãi và yên tĩnh, để bạn thở và lắng lại giữa ngày bận rộn.</p>
        <div className={styles.actions}>
          <Link href="/visit" className="button" data-testid="home-visit">
            Ghé thăm 5 phút
          </Link>
          <Link href="/practices" className={styles.secondary} data-testid="home-practices">
            Khám phá các bài thực hành
          </Link>
        </div>
      </div>
      {word ? (
        <DailyWord word={word} />
      ) : (
        <ErrorState
          title="Chưa tải được lời nhắc hôm nay"
          body="Bạn vẫn có thể ghé thăm hoặc xem các bài thực hành bất cứ lúc nào."
        />
      )}
      <LunarNote />
      <PlaceLinks />
    </div>
  );
}
