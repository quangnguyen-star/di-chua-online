import { ActiveTimerCore, type TimerOptions } from "./timerCore.ts";

export interface ActivityConfig {
  /** Overrides the activity's duration; the tour passes this rather than a separate component. */
  seconds?: number;
}

export interface ActivityEvent {
  type: string;
}

export interface ActivityDefinition<TState, TEvent extends ActivityEvent = ActivityEvent> {
  initial(config: ActivityConfig): TState;
  reduce(state: TState, event: TEvent): TState;
  /** Called on each timer change with the remaining time; return the next state. */
  tick?(state: TState, remainingMs: number): TState;
  /** Duration used when the config does not override it; no timer runs without one. */
  seconds?: number;
}

export interface Activity<TState, TEvent extends ActivityEvent = ActivityEvent> {
  getState(): TState;
  readonly disposed: boolean;
  subscribe(fn: () => void): () => void;
  send(event: TEvent): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}

/** State and timers live here, outside any renderer; renderers only receive the state as props. */
export function createActivity<TState, TEvent extends ActivityEvent = ActivityEvent>(
  def: ActivityDefinition<TState, TEvent>,
  config: ActivityConfig = {},
  timerOptions: TimerOptions = {},
): Activity<TState, TEvent> {
  let state = def.initial(config);
  let disposed = false;
  const listeners = new Set<() => void>();
  const seconds = config.seconds ?? def.seconds;
  const timer = seconds === undefined ? null : new ActiveTimerCore(seconds, timerOptions);

  const set = (next: TState) => {
    if (Object.is(next, state)) return;
    state = next;
    listeners.forEach((fn) => fn());
  };

  const unsubscribeTimer = timer?.subscribe(() => {
    if (def.tick) set(def.tick(state, timer.getSnapshot().remainingMs));
  });

  return {
    getState: () => state,
    get disposed() {
      return disposed;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    send(event) {
      if (disposed) return;
      set(def.reduce(state, event));
    },
    pause: () => timer?.pause(),
    resume() {
      if (!disposed) timer?.resume();
    },
    dispose() {
      disposed = true;
      unsubscribeTimer?.();
      timer?.dispose();
      listeners.clear();
    },
  };
}
