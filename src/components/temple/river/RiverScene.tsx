import { NightRiver } from "@/components/temple/art";
import styles from "./river.module.css";

export type RiverPhase = "writing" | "releasing" | "released";

/** Fixed positions (percent of the scene) for the ambient floating lights. The count never grows. */
const LIGHTS = [
  { left: 12, top: 62, delay: 0 },
  { left: 30, top: 74, delay: -2 },
  { left: 48, top: 58, delay: -4 },
  { left: 66, top: 70, delay: -1 },
  { left: 84, top: 64, delay: -3 },
];

/** Night river with a fixed set of floating lights and the user's lantern. Purely visual: it takes no text. */
export function RiverScene({ phase }: { phase: RiverPhase }) {
  return (
    <div className={styles.scene} data-phase={phase} data-testid="lantern-scene" aria-hidden="true">
      <NightRiver variant="night" label={undefined} testId="river-art" />
      {LIGHTS.map((l) => (
        <span
          key={l.left}
          className={styles.light}
          style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }}
        />
      ))}
      <span className={styles.lantern} data-testid="river-lantern" />
    </div>
  );
}
