import type { Aspect, RuntimeLabelSet } from "./types";

/**
 * BODI runtime visualization labels.
 *
 * Mirrors the OpenDesign reference `index.html` and `app.js` LABELS EXACTLY.
 * Node keys match the reference's `data-key` attributes:
 *   task, gate, memory, graph, runtime, verify, persist, continue, recover, fail.
 *
 * HR labels are the reference's short German labels.
 * Engineering labels are the reference's short English labels.
 * Neutral labels are a single technical identifier used in fallback paths.
 */
export const runtimeLabels: RuntimeLabelSet = {
  nodes: {
    task: {
      id: "task",
      label: { hr: "Task", engineering: "User / Task", neutral: "Task" },
    },
    gate: {
      id: "gate",
      label: { hr: "Context", engineering: "Message Gate", neutral: "Gate" },
    },
    memory: {
      id: "memory",
      label: { hr: "Workflow", engineering: "Memory / Context", neutral: "Memory" },
    },
    graph: {
      id: "graph",
      label: { hr: "AI Execution", engineering: "Durable Execution Graph", neutral: "Graph" },
    },
    runtime: {
      id: "runtime",
      label: { hr: "Check Result", engineering: "Managed Agent Runtime", neutral: "Runtime" },
    },
    verify: {
      id: "verify",
      label: { hr: "Verification", engineering: "Result / Verification", neutral: "Verify" },
    },
    persist: {
      id: "persist",
      label: { hr: "Persist State", engineering: "Persist State", neutral: "Persist" },
    },
    continue: {
      id: "continue",
      label: { hr: "Closure / Continue", engineering: "Closure / Continue", neutral: "Continue" },
    },
    recover: {
      id: "recover",
      label: { hr: "Wiederaufnahme", engineering: "Recovery", neutral: "Recover" },
    },
    fail: {
      id: "fail",
      label: { hr: "Fehlgeschlagen", engineering: "Fail", neutral: "Fail" },
    },
    "bounded-attempt": {
      id: "bounded-attempt",
      label: { hr: "Begrenzte Versuche", engineering: "Bounded attempts", neutral: "Bounded" },
    },
    supervisor: {
      id: "supervisor",
      label: { hr: "Supervisor", engineering: "Supervisor", neutral: "Supervisor" },
    },
    exhausted: {
      id: "exhausted",
      label: { hr: "Endgültiger Fehler", engineering: "Exhausted failure", neutral: "Exhausted" },
    },
  },
  phases: {
    normal: {
      title: { hr: "Normaler Ablauf", engineering: "Normal flow", neutral: "Normal" },
      caption: {
        hr: "Graph-Knoten → Tick → Verifikation → Bestehen → Persistieren → Fortsetzen.",
        engineering:
          "Graph node → Agent tick → Verification → Pass → Persist → Continue to next graph node.",
        neutral: "Normal flow: tick → verify → pass → persist → continue.",
      },
    },
    recovery: {
      title: { hr: "Wiederaufnahme", engineering: "Recovery", neutral: "Recovery" },
      caption: {
        hr: "Bei Fehlschlag greifen Recovery und Supervisor ein. Es wird begrenzt oft erneut verifiziert und gelingt innerhalb des Budgets.",
        engineering:
          "On failure, recovery and supervisor engage. Verification is retried up to the bounded attempt budget; on success, the result is persisted and the graph continues.",
        neutral: "On failure, bounded retry under supervisor; on success, persist and continue.",
      },
    },
    exhausted: {
      title: { hr: "Endgültiger Fehler", engineering: "Terminal failure", neutral: "Terminal" },
      caption: {
        hr: "Wenn das Versuchsbudget aufgebraucht ist, geht der Lauf in einen endgültigen Fehlerzustand über. Es wird nicht persistiert.",
        engineering:
          "When the bounded attempt budget is exhausted, the run enters a terminal-failure state. No persist; no continue.",
        neutral: "When the attempt budget is exhausted, the run enters a terminal-failure state.",
      },
    },
  },
};

/** Returns a label for the given node matching the active aspect. */
export function nodeLabel(
  set: RuntimeLabelSet,
  id: keyof RuntimeLabelSet["nodes"],
  aspect: Aspect,
): string {
  return set.nodes[id].label[aspect];
}
