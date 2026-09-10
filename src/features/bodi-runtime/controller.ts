import type { Aspect, RuntimeGeometry } from "./types";

/**
 * Controller options for the BODI visualization.
 *
 * The controller encapsulates all DOM, timer, and accessibility concerns.
 * The state machine remains pure.
 */
export interface ControllerOptions {
  readonly root: HTMLElement;
  readonly geometry: RuntimeGeometry;
  readonly aspect: Aspect;
  readonly reducedMotion: boolean;
}

export interface Controller {
  start(): void;
  stop(): void;
  setAspect(aspect: Aspect): void;
}

/** Public duration constant used by tests and downstream consumers. */
export const TICK_MS = 1100;
export const REDUCED_MOTION_TICK_MS = 2200;
