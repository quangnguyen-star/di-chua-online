"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { ArtCanvas, Ground, PaperTexture, Sky } from "@/components/temple/art";
import { useActivity } from "@/lib/activity/useActivity";
import {
  STICKS,
  breathPhase,
  burnProgress,
  formatRemaining,
  incenseActivity,
  markSpent,
  phaseLabels,
  readSpent,
  stickLabel,
  variantDefaults,
  type BreathCue,
  type Variant,
} from "./incense";
import type { Embed } from "@/lib/visit/embed";
import styles from "./hall.module.css";

const TITLES: Record<Variant, string> = {
  incense: "Thắp nhang",
  breathing: "Thở cùng nén hương",
  sitting: "Ngồi yên bên nén hương",
};

const STICK_TOP = 100;
const STICK_BASE = 190;

function Scene({ progress, phase, spent }: { progress: number; phase: string; spent: boolean }) {
  const lit = phase === "burning" || phase === "paused";
  const placed = phase === "placed";
  const height = placed || phase === "spent" ? 6 : (STICK_BASE - STICK_TOP) * (1 - progress);
  const top = STICK_BASE - height;
  const smokeScale = 0.4 + 0.6 * (1 - progress);
  return (
    <ArtCanvas label="Một nén hương trong lư" className={styles.scene} testId="hall-scene">
      <Sky />
      <Ground y={200} height={40} />
      {lit && (
        <g transform={`translate(200 ${top}) scale(1 ${smokeScale}) translate(-200 -120)`} data-testid="hall-smoke">
          <path
            className={`${styles.smoke} ${phase === "burning" ? styles.smokeMoving : ""}`}
            d="M200 120 C188 100 212 86 200 66 C190 50 208 38 200 22"
          />
        </g>
      )}
      {lit && (
        <>
          <circle className={styles.glow} cx="200" cy={top} r="9" />
          <circle className={styles.ember} cx="200" cy={top} r="3.5" data-testid="hall-ember" />
        </>
      )}
      <rect className={styles.stick} x="198.5" y={top} width="3" height={height} rx="1.5" data-testid="hall-stick" />
      <ellipse className={styles.bowl} cx="200" cy="206" rx="46" ry="12" />
      <ellipse className={styles.ash} cx="200" cy="198" rx="40" ry="7" />
      {spent && !placed && <rect className={styles.stick} x="228" y="196" width="3" height="4" rx="1.5" data-testid="hall-residue" />}
    </ArtCanvas>
  );
}

function Session({
  variant,
  seconds,
  onChoose,
  embed,
}: {
  variant: Variant;
  seconds: number;
  onChoose(seconds: number): void;
  embed?: Embed;
}) {
  const { scene, cue, soundOn } = useAtmosphere();
  const { state, send, pause, resume } = useActivity(incenseActivity, { seconds });
  const [breath, setBreath] = useState<BreathCue>(() => variantDefaults(variant).cue);
  const [spentBefore, setSpentBefore] = useState(false);
  const { phase, remainingMs } = state;
  const frozenByTour = useRef(false);
  const Title = embed ? "h3" : "h1";

  useEffect(() => {
    scene("hall");
  }, [scene]);

  useEffect(() => {
    setSpentBefore(readSpent());
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) send({ type: "pause" });
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [send]);

  useEffect(() => {
    if (phase !== "spent") return;
    if (soundOn && !embed) cue("bell");
  }, [phase, soundOn, cue, embed]);

  // Embedded, the tour clock decides: freeze the burn with it and resume only what the tour froze.
  const tourPaused = embed?.paused ?? false;
  useEffect(() => {
    if (!embed) return;
    if (tourPaused && phase === "burning") {
      frozenByTour.current = true;
      send({ type: "pause" });
      pause();
    } else if (!tourPaused && frozenByTour.current && phase === "paused") {
      frozenByTour.current = false;
      send({ type: "resume" });
      resume();
    }
  }, [embed, tourPaused, phase, send, pause, resume]);

  const light = () => {
    if (phase !== "ready") return;
    send({ type: "light" });
    resume();
  };
  const doPause = () => {
    send({ type: "pause" });
    pause();
  };
  const doResume = () => {
    if (phase !== "paused") return;
    send({ type: "resume" });
    resume();
  };
  const extinguish = () => {
    send({ type: "extinguish" });
    pause();
  };
  const place = () => {
    if (phase !== "extinguished" && phase !== "spent") return;
    markSpent();
    setSpentBefore(true);
    send({ type: "place" });
  };

  const progress = burnProgress(remainingMs, seconds);
  const burning = phase === "burning" || phase === "paused";
  const cueText = breath === "paced" && phase === "burning" ? (breathPhase(seconds * 1000 - remainingMs) === "in" ? "Hít vào…" : "Thở ra…") : "";

  return (
    <PaperTexture>
      <section className={styles.root} aria-labelledby="hall-title" data-testid="incense-page" data-phase={phase} data-variant={variant}>
        <Title id="hall-title">{TITLES[variant]}</Title>
        <Scene progress={progress} phase={phase} spent={spentBefore} />
        {phase === "ready" && !embed && (
          <>
            <fieldset className={styles.group} data-testid="incense-sticks">
              <legend>Chọn nén hương</legend>
              {STICKS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`button button--quiet ${styles.choice}`}
                  aria-pressed={s === seconds}
                  onClick={() => onChoose(s)}
                  data-testid={`incense-stick-${s}`}
                >
                  {stickLabel(s)}
                </button>
              ))}
            </fieldset>
            <fieldset className={styles.group} data-testid="incense-breath">
              <legend>Nhịp thở</legend>
              <button type="button" className={`button button--quiet ${styles.choice}`} aria-pressed={breath === "natural"} onClick={() => setBreath("natural")} data-testid="breath-natural">
                Thở tự nhiên
              </button>
              <button type="button" className={`button button--quiet ${styles.choice}`} aria-pressed={breath === "paced"} onClick={() => setBreath("paced")} data-testid="breath-paced">
                Nhắc nhịp 4 giây vào, 6 giây ra
              </button>
            </fieldset>
          </>
        )}
        <p className={styles.timer} role="timer" aria-live="off" data-testid="incense-remaining">
          {formatRemaining(remainingMs)}
        </p>
        <p className={styles.cue} aria-hidden="true" data-testid="incense-breath-cue">
          {cueText}
        </p>
        <p className="muted" role="status" data-testid="incense-state">
          {phaseLabels[phase]}
        </p>
        {spentBefore && phase === "ready" && (
          <p className="muted" data-testid="incense-spent-note">
            Một nén hương đã được đặt ở đây trước đó.
          </p>
        )}
        <div className="actions">
          {phase === "ready" && (
            <button type="button" className="button" onClick={light} data-testid="incense-light">
              Thắp nhang
            </button>
          )}
          {phase === "burning" && !embed && (
            <button type="button" className="button" onClick={doPause} data-testid="incense-pause">
              Tạm dừng
            </button>
          )}
          {phase === "paused" && !embed && (
            <button type="button" className="button" onClick={doResume} data-testid="incense-resume">
              Tiếp tục
            </button>
          )}
          {burning && (
            <button type="button" className="button button--quiet" onClick={extinguish} data-testid="incense-extinguish">
              Tắt lửa
            </button>
          )}
          {(phase === "extinguished" || phase === "spent") && (
            <button type="button" className="button" onClick={place} data-testid="incense-place">
              Đặt nhang vào lư
            </button>
          )}
          {phase !== "placed" && !embed && (
            <Link href="/" className="button button--quiet" data-testid="incense-leave">
              Rời đi
            </Link>
          )}
        </div>
        {phase === "placed" && !embed && (
          <div data-testid="incense-finished">
            <p>Bạn có thể ngồi yên một lát, hoặc quay lại khi muốn.</p>
            <p className="actions">
              <Link href="/places/pond/lantern" className="button button--quiet" data-testid="incense-next">
                Tùy chọn: ra bến sông
              </Link>
              <Link href="/" data-testid="incense-back">
                Quay lại
              </Link>
            </p>
          </div>
        )}
      </section>
    </PaperTexture>
  );
}

export default function IncenseHall({ variant = "incense", embed }: { variant?: Variant; embed?: Embed }) {
  const [seconds, setSeconds] = useState(() => variantDefaults(variant).seconds);
  const total = embed?.seconds ?? seconds;
  return <Session key={total} variant={variant} seconds={total} onChoose={setSeconds} embed={embed} />;
}
