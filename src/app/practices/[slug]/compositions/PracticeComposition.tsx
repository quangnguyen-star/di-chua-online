import type { PracticeKind } from "../../labels";
import { kindCaptions } from "../../labels";
import { BreathingCircle } from "./BreathingCircle";
import { SittingWindow } from "./SittingWindow";
import { TeaCup } from "./TeaCup";
import styles from "./compositions.module.css";

export function PracticeComposition({ kind, progress, running }: { kind: PracticeKind; progress: number; running: boolean }) {
  return (
    <figure className={styles.frame}>
      {kind === "breathing" && <BreathingCircle progress={progress} />}
      {kind === "sitting" && <SittingWindow progress={progress} />}
      {kind === "tea" && <TeaCup running={running} />}
      <figcaption className={`${styles.caption} muted`}>{kindCaptions[kind]}</figcaption>
    </figure>
  );
}
