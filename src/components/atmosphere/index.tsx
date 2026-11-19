"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { AudioEngine } from "../../lib/audio/engine.ts";
import {
  audioReducer,
  canPlay,
  initialAudioState,
  type Appearance,
  type Cue,
  type Scene,
} from "../../lib/audio/mix.ts";
import { SoundControl } from "./SoundControl";

export type { Appearance, Cue, Scene };

export interface Atmosphere {
  soundOn: boolean;
  enable(): void;
  disable(): void;
  ambience: number;
  music: number;
  setAmbience(n: number): void;
  setMusic(n: number): void;
  scene(s: Scene): void;
  cue(c: Cue): void;
  failed: boolean;
  appearance: Appearance;
  setAppearance(a: Appearance): void;
}

const silent: Atmosphere = {
  soundOn: false,
  enable() {},
  disable() {},
  ambience: initialAudioState.ambience,
  music: initialAudioState.music,
  setAmbience() {},
  setMusic() {},
  scene() {},
  cue() {},
  failed: false,
  appearance: "system",
  setAppearance() {},
};

const AtmosphereContext = createContext<Atmosphere>(silent);

export function useAtmosphere(): Atmosphere {
  return useContext(AtmosphereContext);
}

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialAudioState);
  const engine = useRef<AudioEngine | null>(null);
  const latest = useRef(state);
  const lastScene = useRef<Scene>("gate");

  useEffect(() => {
    latest.current = state;
    engine.current?.setVolumes(state.ambience, state.music);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.appearance === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", state.appearance);
  }, [state.appearance]);

  const disable = useCallback(() => {
    dispatch({ type: "disable" });
    void engine.current?.suspend();
  }, []);

  const enable = useCallback(() => {
    const eng = (engine.current ??= new AudioEngine());
    eng.scene(lastScene.current);
    eng
      .start(latest.current.ambience, latest.current.music)
      .then(() => dispatch({ type: "enable" }))
      .catch(() => dispatch({ type: "fail" }));
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && canPlay(latest.current)) disable();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      void engine.current?.close();
      engine.current = null;
    };
  }, [disable]);

  const scene = useCallback((s: Scene) => {
    lastScene.current = s;
    if (canPlay(latest.current)) engine.current?.scene(s);
  }, []);

  const cue = useCallback((c: Cue) => {
    if (canPlay(latest.current)) engine.current?.cue(c);
  }, []);

  const value = useMemo<Atmosphere>(
    () => ({
      soundOn: state.soundOn,
      enable,
      disable,
      ambience: state.ambience,
      music: state.music,
      setAmbience: (n) => dispatch({ type: "ambience", value: n }),
      setMusic: (n) => dispatch({ type: "music", value: n }),
      scene,
      cue,
      failed: state.failed,
      appearance: state.appearance,
      setAppearance: (a) => dispatch({ type: "appearance", value: a }),
    }),
    [state, enable, disable, scene, cue],
  );

  return <AtmosphereContext.Provider value={value}>{children}</AtmosphereContext.Provider>;
}

export { SoundControl };
