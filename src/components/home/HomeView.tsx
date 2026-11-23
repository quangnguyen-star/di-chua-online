import Link from "next/link";
import { DailyWord } from "./DailyWord";
import { TamQuanStill } from "@/components/temple/art";
import { TempleMap } from "@/components/temple/map";
import { LunarNote } from "./LunarNote";
import { PlaceLinks } from "./PlaceLinks";
import styles from "./home.module.css";

export function HomeView() {
  return (
    <div className={`scene ${styles.home}`}>
      <div className={styles.hero}>
        <div className={styles.gate}>
          <TamQuanStill testId="home-gate-art" />
        </div>
        <h1 className={styles.title}>Đi Chùa Online</h1>
        <p className={styles.intro}>Một khoảng dừng ngắn, chậm rãi và yên tĩnh, để bạn thở và lắng lại giữa ngày bận rộn.</p>
        <div className={styles.actions}>
          <Link href="/visit" className="button" data-testid="home-visit">
            Ghé thăm 5 phút
          </Link>
        </div>
      </div>
      <section className={styles.mapSection} aria-labelledby="home-map-heading">
        <h2 id="home-map-heading" className={styles.mapHeading}>Sáu chặng trong chùa</h2>
        <TempleMap />
      </section>
      <DailyWord />
      <LunarNote />
      <PlaceLinks />
    </div>
  );
}
