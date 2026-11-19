const TICK_MS = 250;

export interface TimerSnapshot {
  remainingMs: number;
  running: boolean;
}

export interface TimerOptions {
  now?: () => number;
  /** Starts a repeating tick and returns its canceller; injectable so tests need no real timers. */
  schedule?: (fn: () => void, ms: number) => () => void;
}

export interface TimerConfig {
  seconds?: number;
}

const realSchedule = (fn: () => void, ms: number) => {
  const id = setInterval(fn, ms);
  return () => clearInterval(id);
};

/** Countdown over active time only: elapsed comes from timestamp deltas, and pausing banks it. */
export class ActiveTimerCore {
  private total: number;
  private remaining: number;
  private anchor: number | null = null;
  private hidden = false;
  private cancel: (() => void) | null = null;
  private snap: TimerSnapshot;
  private listeners = new Set<() => void>();
  private now: () => number;
  private schedule: (fn: () => void, ms: number) => () => void;

  constructor(seconds: number, options: TimerOptions = {}) {
    this.now = options.now ?? Date.now;
    this.schedule = options.schedule ?? realSchedule;
    this.total = Math.max(0, seconds) * 1000;
    this.remaining = this.total;
    this.snap = { remainingMs: this.total, running: false };
  }

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = (): TimerSnapshot => this.snap;

  private publish(): void {
    const running = this.anchor !== null;
    if (this.snap.remainingMs === this.remaining && this.snap.running === running) return;
    this.snap = { remainingMs: this.remaining, running };
    this.listeners.forEach((fn) => fn());
  }

  private settle(): void {
    if (this.anchor === null) return;
    const t = this.now();
    this.remaining = Math.max(0, this.remaining - Math.max(0, t - this.anchor));
    this.anchor = t;
  }

  private halt(): void {
    this.settle();
    this.anchor = null;
    this.cancel?.();
    this.cancel = null;
  }

  /** Explicit action only: a hidden tab never starts or resumes the countdown. */
  start(): void {
    if (this.remaining <= 0 || this.hidden || this.anchor !== null) return;
    this.anchor = this.now();
    this.cancel = this.schedule(() => this.tick(), TICK_MS);
    this.publish();
  }

  resume = (): void => this.start();

  pause(): void {
    this.halt();
    this.publish();
  }

  tick(): void {
    this.settle();
    if (this.remaining <= 0) this.halt();
    this.publish();
  }

  reset(seconds?: number): void {
    this.halt();
    if (seconds !== undefined) this.total = Math.max(0, seconds) * 1000;
    this.remaining = this.total;
    this.publish();
  }

  /** Hiding the tab freezes the countdown; becoming visible again does not restart it. */
  setHidden(hidden: boolean): void {
    this.hidden = hidden;
    if (hidden) this.pause();
  }

  dispose(): void {
    this.halt();
    this.listeners.clear();
  }
}
