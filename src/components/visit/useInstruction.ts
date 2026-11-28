"use client";

import { useCallback, useEffect, useState } from "react";

export const INSTRUCTION_VISIBLE_MS = 4000;

export type InstructionState = {
  /** The sentence on show; it stays in the DOM (visually faded) so assistive tech keeps the text. */
  text: string;
  visible: boolean;
  /** The hint button: show the current sentence again. */
  replay: () => void;
  /** Move to the next sentence (stays on the last one) and show it. */
  advance: () => void;
};

/** One sentence at a time: shown, auto-hidden after ~4s, replayable. */
export function useInstruction(lines: readonly string[]): InstructionState {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [plays, setPlays] = useState(0);

  const replay = useCallback(() => {
    setVisible(true);
    setPlays((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setVisible(false), INSTRUCTION_VISIBLE_MS);
    return () => clearTimeout(id);
  }, [visible, plays, index]);

  const last = Math.max(0, lines.length - 1);
  const advance = useCallback(() => {
    setIndex((i) => Math.min(i + 1, last));
    setVisible(true);
  }, [last]);

  return { text: lines[Math.min(index, last)] ?? "", visible, replay, advance };
}
