import Link from "next/link";
import { readyRoutes } from "@/content/routes";
import styles from "./places.module.css";

export const metadata = { title: "Các điểm đến" };

export default function PlacesPage() {
  return (
    <div className="scene" data-testid="places-page" style={{ textAlign: "center" }}>
      <h1>Các điểm đến</h1>
      <ol className={styles.gallery} data-testid="place-gallery">
        {readyRoutes.map((place, i) => (
          <li key={place.id} className={styles.item}>
            <Link href={place.href} className={styles.card} data-testid={`place-card-${place.id}`}>
              <img className={styles.still} src={`/art/stops/${place.id}.jpg`} alt="" width={640} height={360} loading="lazy" decoding="async" />
              <span className={styles.caption}>
                <span className={styles.step}>Chặng {i + 1}</span>
                <span className={styles.title}>{place.name}</span>
                <span className={styles.blurb}>{place.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
