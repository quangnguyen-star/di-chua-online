import Link from "next/link";
import { readyRoutes, routes, type PlaceId } from "@/content/routes";
import styles from "./map.module.css";

/** The nearest following place that is ready, read only from the route table. */
export function nextReadyPlace(from: PlaceId) {
  const seen = new Set<PlaceId>();
  let cur = routes.find((r) => r.id === from)?.next;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const found = readyRoutes.find((r) => r.id === cur);
    if (found) return found;
    cur = routes.find((r) => r.id === cur)?.next;
  }
  return undefined;
}

/** Map link plus next-place preview, offered by every scene. */
export function SceneLinks({ from }: { from: PlaceId }) {
  const next = nextReadyPlace(from);
  return (
    <nav className={styles.sceneLinks} aria-label="Đi tiếp" data-testid="scene-links">
      <Link href="/" className={styles.mapLink} data-testid="scene-map-link">
        Bản đồ chùa
      </Link>
      {next ? (
        <Link href={next.href} className={styles.nextLink} data-testid="scene-next-link">
          <span className={styles.nextLabel}>Chốn kế tiếp</span>
          <span className={styles.nextName}>{next.name}</span>
          <span className={styles.nextBlurb}>{next.blurb}</span>
        </Link>
      ) : null}
    </nav>
  );
}
