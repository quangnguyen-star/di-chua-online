"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { InstructionState } from "./useInstruction";
import styles from "./visit.module.css";

/** Minimal local shape of the scene handle until B1's type is merged: activities drive their scene through it. */
export type StageHandle = { setRunning?: (running: boolean) => void };

type StageHandleValue = { handle: StageHandle | null; onHandle: (h: StageHandle | null) => void };

const StageHandleContext = createContext<StageHandleValue>({ handle: null, onHandle: () => {} });

export const StageHandleProvider = StageHandleContext.Provider;

/** The shell's scene handle and the `onHandle(h)` callback a SceneStage reports it through. */
export function useStageHandle(): StageHandleValue {
  return useContext(StageHandleContext);
}

type Props = {
  instruction?: InstructionState;
  /** The only buttons on the stage. */
  actions?: ReactNode;
  /** The scene only: no text here. */
  children?: ReactNode;
};

/** The one layout every activity uses: instruction, interaction, actions bands (HUD and subtitle belong to the shell). */
export default function StageZones({ instruction, actions, children }: Props) {
  return (
    <div className={styles.zones} data-testid="stage-zones">
      <div className={styles.zoneInstruction} data-testid="zone-instruction">
        {instruction && (
          <p aria-live="polite" data-visible={instruction.visible} data-testid="instruction-text">
            {instruction.text}
          </p>
        )}
      </div>
      <div className={styles.zoneInteraction} data-testid="zone-interaction">
        {children}
      </div>
      <div className={styles.zoneActions} data-testid="zone-actions">
        {instruction && !instruction.visible && (
          <button type="button" onClick={instruction.replay} data-testid="instruction-hint">
            Gợi ý
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}
