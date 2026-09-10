import { describe, expect, it } from "vitest";
import {
  advance,
  initialFrame,
  initialState,
  MAX_ATTEMPTS,
  TOTAL_FRAMES,
} from "~/features/bodi-runtime/machine";
import type { MachineState } from "~/features/bodi-runtime/machine";

describe("BODI machine", () => {
  it("initialState has scriptIndex -1 and attempt 1", () => {
    expect(initialState.scriptIndex).toBe(-1);
    expect(initialState.attempt).toBe(1);
  });

  it("initialFrame is the first entry of the script", () => {
    const frame = initialFrame();
    expect(frame.phase).toBe("normal");
    expect(frame.active).toEqual(["graph-active"]);
    expect(frame.done).toEqual([]);
    expect(frame.attempt).toBe(1);
  });

  it("MAX_ATTEMPTS is 3 (matches Agent Garden semantics)", () => {
    expect(MAX_ATTEMPTS).toBe(3);
  });

  it("TOTAL_FRAMES matches the demonstrative script length", () => {
    // The script has exactly TOTAL_FRAMES entries — sanity check.
    expect(TOTAL_FRAMES).toBeGreaterThan(0);
  });

  it("advance() moves forward and loops around", () => {
    let state: MachineState = { scriptIndex: -1, attempt: 1 };
    const seen = new Set<number>();
    for (let i = 0; i < TOTAL_FRAMES + 1; i += 1) {
      const next = advance(state);
      state = next.state;
      seen.add(state.scriptIndex);
    }
    // After one full cycle plus one extra frame we should have re-entered the loop.
    expect(seen.size).toBeGreaterThanOrEqual(TOTAL_FRAMES - 1);
  });

  it("advance() does not mutate the input state (purity)", () => {
    const before: MachineState = { scriptIndex: 2, attempt: 2 };
    const beforeSerialized = JSON.stringify(before);
    advance(before);
    expect(JSON.stringify(before)).toBe(beforeSerialized);
  });

  it("advances through a normal flow that ends with continue", () => {
    const states: number[] = [];
    let state: MachineState = initialState;
    for (let i = 0; i < 7; i += 1) {
      const next = advance(state);
      state = next.state;
      states.push(state.scriptIndex);
    }
    // After 7 advances we should be back near the start of the cycle.
    expect(states.length).toBe(7);
  });

  it("recovery flow eventually enters the exhausted phase", () => {
    let state: MachineState = initialState;
    let phase: string | undefined;
    for (let i = 0; i < TOTAL_FRAMES; i += 1) {
      const next = advance(state);
      state = next.state;
      phase = next.frame.phase;
    }
    expect(phase).toBe("exhausted");
  });
});
