import Link from "next/link";
import { wordForDate } from "@/content";
import type { DailyWord as DailyWordData } from "@/content";
import { ErrorState } from "@/components/shell/ErrorState";
import { DailyWord } from "./DailyWord";
import { GateMotif } from "./GateMotif";

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
    <div className="home">
      <GateMotif />
      <h1>Đi Chùa Online</h1>
      <p className="home-intro">Một khoảng dừng ngắn, chậm rãi và yên tĩnh, để bạn thở và lắng lại giữa ngày bận rộn.</p>
      <div className="home-actions">
        <Link href="/visit" className="button" data-testid="home-visit">
          Ghé thăm 5 phút
        </Link>
        <Link href="/practices" className="home-secondary" data-testid="home-practices">
          Khám phá các bài thực hành
        </Link>
      </div>
      {word ? (
        <DailyWord word={word} />
      ) : (
        <ErrorState
          title="Chưa tải được lời nhắc hôm nay"
          body="Bạn vẫn có thể ghé thăm hoặc xem các bài thực hành bất cứ lúc nào."
        />
      )}
    </div>
  );
}
