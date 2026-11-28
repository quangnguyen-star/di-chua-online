"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { routes } from "@/content/routes";
import {
  applyStep, clampDrift, isReleasing, lanternColors, nextStep, pullRatio, release as startRelease, resetScene,
  stepDuration, type LanternColor, type RiverStep,
} from "@/components/temple/river";
import { LotusLantern } from "@/components/temple/lantern";
import { SceneStage } from "@/components/temple/stage";
import type { PondApi, SceneHandle } from "@/components/temple/stage";
import { useAtmosphere } from "@/components/atmosphere";
import { useReducedMotion } from "@/lib/useBrowserFlags";
import { SceneLinks } from "@/components/temple/map/SceneLinks";
import StageZones, { useStageHandle } from "@/components/visit/StageZones";
import { useInstruction } from "@/components/visit/useInstruction";
import type { Embed } from "@/lib/visit/embed";
import styles from "./lantern.module.css";

const MAX_LENGTH = 500;
const DRIFT_DEFAULT_MS = 75_000;
const PULL_TICK_MS = 120;

/** What the visitor is told at each beat; none of it depends on what was written. */
const STEP_TEXT: Record<RiverStep, string> = {
  writing: "Viết điều bạn muốn buông xuống, hoặc bỏ qua.",
  folding: "Gấp tờ giấy lại.",
  placing: "Đặt vào ngọn đèn sen.",
  lighting: "Thắp ngọn nến.",
  lowering: "Thả đèn xuống mặt nước.",
  pulling: "Nhìn ngọn đèn rời xa.",
  drifting: "Ngọn đèn đang trôi đi.",
  blended: "Ngọn đèn đã trôi đi.",
};

/** The one next-place preview, read from the route table. */
const river = routes.find((r) => r.id === "pond");
const nextPlace = routes.find((r) => r.id === river?.next && r.ready);

export default function LanternFlow({ embed }: { embed?: Embed } = {}) {
  const router = useRouter();
  const { scene, cue } = useAtmosphere();
  const shell = useStageHandle();
  const [localHandle, setLocalHandle] = useState<SceneHandle | null>(null);
  const [step, setStep] = useState<RiverStep>("writing");
  const [thought, setThought] = useState("");
  const [color, setColor] = useState<LanternColor>("gold");
  const reduced = useReducedMotion();
  const thoughtRef = useRef<HTMLTextAreaElement>(null);
  const stepRef = useRef<RiverStep>("writing");
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // The shell reports its scene through the provider; the standalone page owns its own stage. Only the pond API is read.
  const sceneHandle = (embed ? (shell.handle as SceneHandle | null) : localHandle) ?? null;
  const pond: PondApi | null = sceneHandle?.pond ?? null;
  const pondRef = useRef<PondApi | null>(null);
  useEffect(() => {
    pondRef.current = pond;
  }, [pond]);

  useEffect(() => {
    scene("pond");
  }, [scene]);

  // Entering the stop always starts from nothing (the initial state), and leaving it (unmount) drops whatever was typed.
  useEffect(() => () => setThought(""), []);

  // No reset on unmount: the stage is destroyed with this activity, and React runs the stage's cleanup first, so
  // touching the pond then throws on destroyed sprites and the tour's error boundary takes over.

  // Refresh and tab close drop the thought too; nothing is persisted, this just empties state on the way out.
  useEffect(() => {
    const clear = () => setThought("");
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, []);

  // The drift runs only while the tour clock does; a pause restarts the current beat when it resumes.
  const frozen = embed?.paused ?? false;
  const driftMs = embed ? clampDrift(embed.seconds * 600) : DRIFT_DEFAULT_MS;
  useEffect(() => {
    const ms = stepDuration(step, driftMs, reduced);
    if (ms === null || frozen) return;
    const t = setTimeout(() => setStep(nextStep(step, reduced)), ms);
    return () => clearTimeout(t);
  }, [step, frozen, driftMs, reduced]);

  // Each beat draws itself once on the scene.
  useEffect(() => {
    if (step !== "writing") applyStep(pond, step, color, reduced);
  }, [step, pond, reduced, color]);

  // The camera eases back through the pulling beat; the timer lives here, the scene only draws.
  useEffect(() => {
    if (step !== "pulling" || reduced || frozen || !pond) return;
    const start = performance.now();
    const id = setInterval(() => pond.pullBack(pullRatio(performance.now() - start)), PULL_TICK_MS);
    return () => clearInterval(id);
  }, [step, reduced, frozen, pond]);

  const letGo = () => {
    // The repeat guard reads the ref so two presses in one tick cannot start two releases.
    if (stepRef.current !== "writing" || frozen) return;
    stepRef.current = startRelease(stepRef.current);
    if (thoughtRef.current) thoughtRef.current.value = "";
    setThought("");
    setStep(startRelease("writing"));
    cue("water");
  };

  const leave = () => {
    setThought("");
    resetScene(pondRef.current);
    router.push("/");
  };

  const instruction = useInstruction([STEP_TEXT[step]]);
  const { replay } = instruction;
  useEffect(() => {
    replay();
  }, [step, replay]);

  const hint = "Điều bạn muốn buông xuống (không bắt buộc). Chỉ ở trên màn hình này, không được lưu hay gửi đi.";

  const paper = (
    <div className={styles.paper} data-testid="lantern-paper" data-step={step}>
      {step === "writing" ? (
        <>
          <fieldset className={styles.colors} data-testid="lantern-colors">
            <legend>Chọn đèn sen</legend>
            {lanternColors.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.colorButton}
                aria-pressed={color === c.id}
                data-testid={`lantern-color-${c.id}`}
                onClick={() => setColor(c.id)}
              >
                {c.label}
              </button>
            ))}
          </fieldset>
          <label className={styles.field}>
            {!embed && <span>{hint}</span>}
            <textarea
              ref={thoughtRef}
              value={thought}
              maxLength={MAX_LENGTH}
              rows={3}
              autoComplete="off"
              spellCheck={false}
              aria-label={embed ? hint : undefined}
              data-testid="lantern-thought"
              readOnly={frozen}
              onChange={(e) => setThought(e.target.value)}
            />
          </label>
        </>
      ) : (
        <div className={styles.sheet} data-testid="lantern-sheet">
          {isReleasing(step) && <LotusLantern color={color} prominent className={styles.heldLantern} label="Đèn sen của bạn" />}
          {!embed && step === "blended" && (
            <>
              <h2 className={styles.label} data-testid="lantern-released">
                Ngọn đèn đã trôi đi
              </h2>
              <p className={styles.prompt}>Điều bạn viết đã được buông xuống và không còn ở đâu cả.</p>
            </>
          )}
        </div>
      )}
    </div>
  );

  const writingActions = step === "writing" && (
    <>
      <button type="button" className="button" data-testid="lantern-release" onClick={letGo}>
        Gấp thành đèn và thả
      </button>
      <button type="button" className="button button--quiet" data-testid="lantern-skip" onClick={letGo}>
        Bỏ qua, chỉ thả đèn
      </button>
    </>
  );

  const endActions = (
    <>
      {!embed && step === "blended" && nextPlace && (
        <Link className="button button--quiet" href={nextPlace.href} data-testid="lantern-next">
          {nextPlace.name}
        </Link>
      )}
      {!embed && step === "blended" && (
        <Link className="button" href="/" data-testid="lantern-map">
          Bản đồ chùa
        </Link>
      )}
      {!embed && (
        <button type="button" className="button button--quiet" data-testid="lantern-exit" onClick={leave}>
          {step === "blended" ? "Về trang chủ" : "Thoát"}
        </button>
      )}
    </>
  );

  if (embed) {
    return (
      <div className={styles.embedded}>
        <StageZones instruction={instruction} actions={<>{writingActions}{endActions}</>}>
          {paper}
        </StageZones>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        <SceneStage place="pond" lighting="moon" paused={!isReleasing(step) || frozen} onHandle={setLocalHandle} />
      </div>
      <h1>Bến sông</h1>
      <p className={styles.prompt}>{STEP_TEXT[step]}</p>
      {paper}
      <div className={styles.controls}>
        {writingActions}
        {endActions}
      </div>
      {!embed && <SceneLinks from="pond" />}
    </div>
  );
}
