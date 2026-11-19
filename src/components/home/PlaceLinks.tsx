import Link from "next/link";
import { activities, places } from "@/content/places";
import styles from "./home.module.css";

export function PlaceLinks() {
  const ready = activities.filter((a) => a.ready);
  if (ready.length === 0) return null;

  return (
    <nav className={styles.places} aria-labelledby="home-places-heading">
      <h2 id="home-places-heading" className={styles.placesTitle}>Những chốn bạn có thể ghé</h2>
      <ul className={styles.placeList}>
        {ready.map((a) => {
          const place = places.find((p) => p.id === a.place);
          return (
            <li key={a.id}>
              <Link href={a.href} className={styles.placeLink} data-testid={`home-place-${a.id}`}>
                <span className={styles.placeName}>{a.label}</span>
                {place ? <span className={styles.placeBlurb}>{place.name} · {place.blurb}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
