"use client";

import { useEffect, useRef, useState } from "react";
import { isRam, resolveLighting } from "./lighting.ts";
import type { SceneHandle } from "./scene.ts";
import { StaticScene } from "./StaticScene.tsx";
import styles from "./stage.module.css";
import type { SceneStageProps, StageLighting } from "./types.ts";

const MAX_DPR = 2;

function hasWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** One lazy Pixi application per stage: layered parallax, capped particles, adaptive DPR, a finished still fallback. */
export function SceneStage({ place, lighting, paused = false, quality = "auto", reduced }: SceneStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const [resolved, setResolved] = useState<{ lighting: StageLighting; ram: boolean } | null>(null);
  const [live, setLive] = useState(false);
  const [motionReduced, setMotionReduced] = useState(reduced ?? false);
  const running = !paused && !motionReduced;
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    const now = new Date();
    setResolved({ lighting: resolveLighting(place, lighting, now), ram: isRam(now) });
  }, [place, lighting]);

  useEffect(() => {
    setMotionReduced(reduced ?? prefersReducedMotion());
  }, [reduced]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !resolved || quality === "static" || !hasWebGL()) return;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const pixi = await import("pixi.js");
      // The CSP forbids unsafe-eval; this swaps pixi's generated-code shader sync for a CSP-safe one.
      await import("pixi.js/unsafe-eval");
      const { buildScene } = await import("./scene.ts");
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.className = styles.canvas;
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.testid = "stage-canvas";
      const app = new pixi.Application();
      try {
        await app.init({
          canvas,
          resizeTo: host,
          backgroundAlpha: 0,
          antialias: false,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, MAX_DPR),
          preference: "webgl",
          autoStart: false,
        });
      } catch {
        app.destroy(false);
        return;
      }
      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }
      host.insertBefore(canvas, host.firstChild);
      const scene = buildScene(pixi, app, canvas, {
        lighting: resolved.lighting,
        ram: resolved.ram,
        quality: quality === "low" ? "low" : "auto",
        maxDpr: MAX_DPR,
      });
      const onTap = (e: PointerEvent) => scene.addLantern(e.clientX, e.clientY);
      canvas.addEventListener("pointerdown", onTap);
      sceneRef.current = scene;
      scene.setRunning(runningRef.current);
      setLive(true);
      cleanup = () => {
        canvas.removeEventListener("pointerdown", onTap);
        sceneRef.current = null;
        scene.destroy();
        app.destroy(true, { children: true });
        canvas.remove();
      };
    })();

    return () => {
      cancelled = true;
      setLive(false);
      cleanup();
    };
  }, [quality, resolved?.lighting, resolved?.ram]);

  useEffect(() => {
    sceneRef.current?.setRunning(running);
  }, [running]);

  const shown = resolved ?? { lighting: lighting ?? "moon", ram: false };

  return (
    <div ref={hostRef} className={styles.stage} data-testid="scene-stage" data-place={place} data-lighting={shown.lighting} data-ram={shown.ram} data-mode={live ? "webgl" : "static"}>
      {live ? null : <StaticScene lighting={shown.lighting} ram={shown.ram} />}
      <div className="lq-crackle" />
      <div className="lq-paper" />
    </div>
  );
}
