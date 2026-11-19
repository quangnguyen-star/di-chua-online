"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StageHandle } from "./stageHandles";
import type { InstructionState } from "./useInstruction";
import styles from "./visit.module.css";

export type { StageHandle } from "./stageHandles";

type StageHandleValue = {
  /** The handle of the stop now showing, or null until its scene is live. */
  handle: StageHandle | null;
  /** The handle of a given layer's scene: the outgoing stop's during a crossfade, the current one otherwise. */
  handleFor: (stopId: string) => StageHandle | null;
};

const StageHandleContext = createContext<StageHandleValue>({ handle: null, handleFor: () => null });

export const StageHandleProvider = StageHandleContext.Provider;

/** The scene handle(s) the shell collected through each SceneStage's `onHandle`. */
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
