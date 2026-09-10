import type { NodeId, TickFrame, PhaseId } from "./types";

/**
 * Pure state machine for the BODI visualization.
 *
 * No DOM, no timers, no requestAnimationFrame, no I/O.
 * The controller owns all of those concerns; this module exposes
 * a small, exhaustively-testable advance() function that produces
 * the next tick frame deterministically.
 */

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
export const TOTAL_FRAMES = 13;

const SCRIPT: ReadonlyArray<{
  phase: PhaseId;
  active: ReadonlyArray<NodeId>;
  done: ReadonlyArray<NodeId>;
  attempt: number;
}> = [
  // Normal flow: task → gate → memory → graph → runtime → verify
  { phase: "normal", active: ["task"], done: [], attempt: 1 },
  { phase: "normal", active: ["gate"], done: ["task"], attempt: 1 },
  { phase: "normal", active: ["memory"], done: ["task", "gate"], attempt: 1 },
  { phase: "normal", active: ["graph"], done: ["task", "gate", "memory"], attempt: 1 },
  { phase: "normal", active: ["runtime"], done: ["task", "gate", "memory", "graph"], attempt: 1 },
  {
    phase: "normal",
    active: ["verify"],
    done: ["task", "gate", "memory", "graph", "runtime"],
    attempt: 1,
  },
  // Persist + continue are engineering-only nodes
  {
    phase: "normal",
    active: ["persist"],
    done: ["task", "gate", "memory", "graph", "runtime", "verify"],
    attempt: 1,
  },
  {
    phase: "normal",
    active: ["continue"],
    done: ["task", "gate", "memory", "graph", "runtime", "verify", "persist"],
    attempt: 1,
  },
  // Recovery flow: fail → recover → supervisor → bounded-attempt → verify
  {
    phase: "recovery",
    active: ["recover"],
    done: ["task", "gate", "memory", "graph", "runtime"],
    attempt: 1,
  },
  {
    phase: "recovery",
    active: ["supervisor"],
    done: ["task", "gate", "memory", "graph", "runtime", "recover"],
    attempt: 1,
  },
  {
    phase: "recovery",
    active: ["bounded-attempt", "verify"],
    done: ["task", "gate", "memory", "graph", "supervisor", "recover"],
    attempt: 2,
  },
  {
    phase: "recovery",
    active: ["persist"],
    done: ["task", "gate", "memory", "graph", "recover", "supervisor", "bounded-attempt"],
    attempt: 2,
  },
  // Terminal failure
  {
    phase: "exhausted",
    active: ["exhausted"],
    done: ["task", "gate", "memory", "graph", "recover", "supervisor", "bounded-attempt"],
    attempt: MAX_ATTEMPTS,
  },
];

/**
 * Advance the machine and produce the next frame.
 *
 * Once the script is consumed, the machine loops back to the start so the
 * visualization remains alive on the page without ever mutating global state.
 */
export function advance(state: { scriptIndex: number; attempt: number }): {
  state: { scriptIndex: number; attempt: number };
  frame: TickFrame;
} {
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
export const initialState = {
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
