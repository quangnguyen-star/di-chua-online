"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { readyRoutes, type PlaceId } from "@/content/routes";
import { TamQuanStill } from "../art";
import styles from "./map.module.css";

/** Where each place's marker sits, as percentages of the art frame; all stay outside the gate's bounding shape. */
const spots: Record<PlaceId, { left: number; top: number }> = {
  gate: { left: 50, top: 94 },
  courtyard: { left: 7, top: 60 },
  hall: { left: 50, top: 11 },
  pond: { left: 93, top: 60 },
  veranda: { left: 93, top: 20 },
  outside: { left: 7, top: 20 },
};

export function TempleMap() {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      el.style.setProperty("--px", `${Math.max(-0.5, Math.min(0.5, x)) * -6}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className={styles.map} ref={frame} data-testid="temple-map">
      <div className={styles.art}>
        <TamQuanStill testId="map-art" />
      </div>
      <ul className={styles.spots}>
        {readyRoutes.map((p) => (
          <li key={p.id} className={styles.spot} style={{ left: `${spots[p.id].left}%`, top: `${spots[p.id].top}%` }}>
            <Link href={p.href} className={styles.spotLink} data-testid={`map-place-${p.id}`}>
              <span className={styles.spotLabel}>{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
