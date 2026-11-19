"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { mixer } from "../../lib/audio/mixer.ts";
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
  const latest = useRef(state);
  const lastScene = useRef<Scene>("gate");

  useEffect(() => {
    latest.current = state;
    mixer.setBus("ambience", state.ambience);
    mixer.setBus("music", state.music);
    mixer.setBus("cues", 0.5 + 0.5 * state.ambience);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.appearance === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", state.appearance);
  }, [state.appearance]);

  const disable = useCallback(() => {
    dispatch({ type: "disable" });
    void mixer.disable();
  }, []);

  const enable = useCallback(() => {
    mixer.setScene(lastScene.current);
    mixer
      .enable()
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
      void mixer.dispose();
    };
  }, [disable]);

  const scene = useCallback((s: Scene) => {
    lastScene.current = s;
    if (canPlay(latest.current)) mixer.setScene(s);
  }, []);

  const cue = useCallback((c: Cue) => {
    if (canPlay(latest.current)) mixer.cue(c);
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
