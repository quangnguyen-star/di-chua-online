import Link from "next/link";
import { readyRoutes } from "@/content/routes";
import styles from "./home.module.css";

export function PlaceLinks() {
  if (readyRoutes.length === 0) return null;

  return (
    <nav className={styles.places} aria-labelledby="home-places-heading">
      <h2 id="home-places-heading" className={styles.placesTitle}>Những chốn bạn có thể ghé</h2>
      <ul className={styles.placeList}>
        {readyRoutes.map((p) => (
          <li key={p.id}>
            <Link href={p.href} className={styles.placeLink} data-testid={`home-place-${p.id}`}>
              <span className={styles.placeName}>{p.name}</span>
              <span className={styles.placeBlurb}>{p.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
