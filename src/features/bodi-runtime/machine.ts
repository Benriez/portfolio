import type { NodeId, PhaseId, TickFrame } from "./types";

/**
 * Pure state machine for the BODI runtime visualization.
 *
 * No DOM, no timers, no requestAnimationFrame, no I/O.
 * The controller owns all of those concerns; this module exposes
 * a small, exhaustively-testable advance() function that produces
 * the next tick frame deterministically.
 */

export interface MachineState {
  /** Index into the demo script (each tick produces one frame). */
  readonly scriptIndex: number;
  /** Current attempt count (1-based). Visible during the recovery phase. */
  readonly attempt: number;
}

/** Maximum retry attempts before exhaustion (matches Agent Garden semantics). */
export const MAX_ATTEMPTS = 3;

/**
 * Demonstrative script. Each entry is one rendered frame.
 *
 * Frames 0..NORMAL_LAST drive the normal flow.
 * Frames RECOVERY_START..RECOVERY_LAST drive the recovery flow.
 * Frame EXHAUSTED_INDEX renders the terminal-failure end state.
 */
export const NORMAL_LAST = 6;
export const RECOVERY_START = 7;
export const RECOVERY_PEAK = 9;
export const RECOVERY_LAST = 10;
export const EXHAUSTED_INDEX = 11;
export const TOTAL_FRAMES = 12;

const SCRIPT: ReadonlyArray<{
  phase: PhaseId;
  active: ReadonlyArray<NodeId>;
  done: ReadonlyArray<NodeId>;
  attempt: number;
}> = [
  // Normal flow
  { phase: "normal", active: ["graph-active"], done: [], attempt: 1 },
  { phase: "normal", active: ["tick"], done: ["graph-active"], attempt: 1 },
  { phase: "normal", active: ["verify"], done: ["graph-active", "tick"], attempt: 1 },
  { phase: "normal", active: ["pass"], done: ["graph-active", "tick", "verify"], attempt: 1 },
  {
    phase: "normal",
    active: ["persist"],
    done: ["graph-active", "tick", "verify", "pass"],
    attempt: 1,
  },
  {
    phase: "normal",
    active: ["continue"],
    done: ["graph-active", "tick", "verify", "pass", "persist"],
    attempt: 1,
  },
  {
    phase: "normal",
    active: ["graph-active"],
    done: ["tick", "verify", "pass", "persist", "continue"],
    attempt: 1,
  },
  // Recovery flow
  { phase: "recovery", active: ["recover"], done: ["graph-active", "tick", "verify"], attempt: 1 },
  {
    phase: "recovery",
    active: ["supervisor"],
    done: ["graph-active", "tick", "verify", "recover"],
    attempt: 1,
  },
  {
    phase: "recovery",
    active: ["bounded-attempt", "verify"],
    done: ["graph-active", "tick", "supervisor", "recover"],
    attempt: 2,
  },
  {
    phase: "recovery",
    active: ["persist"],
    done: ["graph-active", "tick", "verify", "recover", "supervisor", "bounded-attempt"],
    attempt: 2,
  },
  // Terminal failure
  {
    phase: "exhausted",
    active: ["exhausted"],
    done: ["graph-active", "tick", "verify", "recover", "supervisor", "bounded-attempt"],
    attempt: MAX_ATTEMPTS,
  },
];

/**
 * Advance the machine and produce the next frame.
 *
 * Once the script is consumed, the machine loops back to the start so the
 * visualization remains alive on the page without ever mutating global state.
 */
export function advance(state: MachineState): { state: MachineState; frame: TickFrame } {
  const nextIndex = (state.scriptIndex + 1) % TOTAL_FRAMES;
  const nextScript = SCRIPT[nextIndex];
  if (!nextScript) {
    throw new Error(`script out of bounds at index ${nextIndex}`);
  }
  return {
    state: { scriptIndex: nextIndex, attempt: nextScript.attempt },
    frame: {
      phase: nextScript.phase,
      active: nextScript.active,
      done: nextScript.done,
      attempt: nextScript.attempt,
    },
  };
}

/** Initial state of the machine. */
export const initialState: MachineState = {
  scriptIndex: -1,
  attempt: 1,
};

/** Get the initial frame (the first entry in the script). */
export function initialFrame(): TickFrame {
  const entry = SCRIPT[0];
  if (!entry) {
    throw new Error("script empty");
  }
  return {
    phase: entry.phase,
    active: entry.active,
    done: entry.done,
    attempt: entry.attempt,
  };
}
