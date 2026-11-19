import Link from "next/link";
import { visitStages } from "@/content";
import StopActivity, { embeddedStops } from "./StopActivity";
import styles from "./visit.module.css";

/** One stop opened directly from the map or a legacy link: the stop's own guidance and activity, no tour clock. */
export default function StopView({ stopId }: { stopId: string }) {
  const stage = visitStages.find((s) => s.id === stopId);
  if (!stage) return null;
  const embedded = (embeddedStops as readonly string[]).includes(stage.id);

  return (
    <div className={styles.root} data-testid="stop-view" data-stop={stage.id}>
      <h1 data-testid="stop-title">{stage.label}</h1>
      <p className={styles.prompt} data-testid="stop-prompt">
        {stage.prompt}
      </p>
      {embedded && (
        <div className={styles.activity} data-testid="visit-activity" data-stop={stage.id}>
          <StopActivity stopId={stage.id} seconds={stage.config.seconds} paused={false} />
        </div>
      )}
      <div className={styles.controls}>
        <Link href="/" className="button" data-testid="stop-map">
          Về bản đồ
        </Link>
        <Link href="/visit" className="button button--quiet" data-testid="stop-tour">
          Ghé thăm 5 phút
        </Link>
      </div>
    </div>
  );
}
