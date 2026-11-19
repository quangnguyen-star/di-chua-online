export type Scene = "gate" | "courtyard" | "hall" | "pond" | "veranda" | "outside";
export type Cue = "bell" | "sweep" | "water" | "cup";
export type Appearance = "system" | "day" | "evening";

export interface AudioState {
  soundOn: boolean;
  failed: boolean;
  ambience: number;
  music: number;
  appearance: Appearance;
}

export type AudioAction =
  | { type: "enable" }
  | { type: "disable" }
  | { type: "fail" }
  | { type: "ambience"; value: number }
  | { type: "music"; value: number }
  | { type: "appearance"; value: Appearance };

export const initialAudioState: AudioState = {
  soundOn: false,
  failed: false,
  ambience: 0.5,
  music: 0.35,
  appearance: "system",
};

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case "enable":
      return { ...state, soundOn: true, failed: false };
    case "disable":
      return { ...state, soundOn: false };
    case "fail":
      return { ...state, soundOn: false, failed: true };
    case "ambience":
      return { ...state, ambience: clamp01(action.value) };
    case "music":
      return { ...state, music: clamp01(action.value) };
    case "appearance":
      return { ...state, appearance: action.value };
  }
}

/** Whether scene() and cue() may produce sound at all. */
export function canPlay(state: Pick<AudioState, "soundOn" | "failed">): boolean {
  return state.soundOn && !state.failed;
}

export interface SceneMix {
  /** Wind bed level, 0..1 of the ambience channel. */
  wind: number;
  /** Leaf rustle bed level, 0..1 of the ambience channel. */
  leaves: number;
  /** Low-pass cutoff of the wind bed in Hz. */
  windCutoff: number;
  /** Music level, 0..1 of the music channel. */
  music: number;
}

export const sceneMixes: Record<Scene, SceneMix> = {
  gate: { wind: 0.5, leaves: 0.3, windCutoff: 500, music: 0.7 },
  courtyard: { wind: 0.4, leaves: 0.6, windCutoff: 700, music: 0.6 },
  hall: { wind: 0.15, leaves: 0.1, windCutoff: 300, music: 0.9 },
  pond: { wind: 0.25, leaves: 0.35, windCutoff: 450, music: 0.7 },
  veranda: { wind: 0.45, leaves: 0.5, windCutoff: 600, music: 0.6 },
  outside: { wind: 0.6, leaves: 0.2, windCutoff: 800, music: 0.3 },
};

/** Master ceiling so the summed channels never approach clipping. */
export const MASTER_GAIN = 0.4;
export const AMBIENCE_CEILING = 0.25;
export const MUSIC_CEILING = 0.18;
export const CUE_CEILING = 0.22;
export const CROSSFADE_SECONDS = 3;

export function ambienceGain(level: number): number {
  const v = clamp01(level);
  return v * v * AMBIENCE_CEILING;
}

export function musicGain(level: number): number {
  const v = clamp01(level);
  return v * v * MUSIC_CEILING;
}

export function cueGain(ambienceLevel: number): number {
  return CUE_CEILING * (0.5 + 0.5 * clamp01(ambienceLevel));
}

/** Pentatonic (major) intervals in semitones from the root. */
export const PENTATONIC = [0, 2, 4, 7, 9] as const;

export function noteFrequency(root: number, degree: number): number {
  const len = PENTATONIC.length;
  const octave = Math.floor(degree / len);
  const step = ((degree % len) + len) % len;
  return root * 2 ** ((PENTATONIC[step] + 12 * octave) / 12);
}

/** Sparse, wordless melody: next scale degree by a small step, with long rests. `rand` is in [0,1). */
export function nextNote(prev: number, rand: () => number): { degree: number; waitSeconds: number } {
  const move = Math.floor(rand() * 5) - 2;
  const degree = Math.min(7, Math.max(-2, prev + move));
  return { degree, waitSeconds: 5 + rand() * 7 };
}

export const CUE_PITCHES: Record<Cue, { freq: number; decay: number; noise: boolean }> = {
  bell: { freq: 523.25, decay: 3.2, noise: false },
  sweep: { freq: 330, decay: 1.6, noise: true },
  water: { freq: 880, decay: 0.5, noise: false },
  cup: { freq: 698.46, decay: 1.2, noise: false },
};

/** Audio may only (re)start after an explicit user action; a hidden tab always suspends. */
export function shouldSuspend(hidden: boolean): boolean {
  return hidden;
}

export function nextAppearance(current: Appearance): Appearance {
  return current === "system" ? "day" : current === "day" ? "evening" : "system";
}
