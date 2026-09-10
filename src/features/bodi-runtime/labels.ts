import type { Aspect, RuntimeLabelSet } from "./types";

/**
 * BODI runtime visualization labels.
 *
 * Mirrors the OpenDesign reference `app.js` LABELS tables exactly:
 *   HR: short German labels (e.g. "Task", "Context", "Workflow", "AI Ausführung")
 *   Engineering: short English labels (e.g. "User / Task", "Message Gate")
 *   Neutral: short technical identifier (used on the runtime graphic)
 */
export const runtimeLabels: RuntimeLabelSet = {
  nodes: {
    "graph-active": {
      id: "graph-active",
      label: {
        hr: "Task",
        engineering: "User / Task",
        neutral: "Task",
      },
    },
    tick: {
      id: "tick",
      label: {
        hr: "Context",
        engineering: "Message Gate",
        neutral: "Context",
      },
    },
    verify: {
      id: "verify",
      label: {
        hr: "Workflow",
        engineering: "Memory / Context",
        neutral: "Workflow",
      },
    },
    pass: {
      id: "pass",
      label: {
        hr: "AI Ausführung",
        engineering: "Durable Execution Graph",
        neutral: "AI Execution",
      },
    },
    fail: {
      id: "fail",
      label: {
        hr: "Ergebnis prüfen",
        engineering: "Managed Agent Runtime",
        neutral: "Check Result",
      },
    },
    recover: {
      id: "recover",
      label: {
        hr: "Verifikation",
        engineering: "Result / Verification",
        neutral: "Verification",
      },
    },
    supervisor: {
      id: "supervisor",
      label: {
        hr: "Zustand sichern",
        engineering: "Persist State",
        neutral: "Persist",
      },
    },
    "bounded-attempt": {
      id: "bounded-attempt",
      label: {
        hr: "Fortsetzen",
        engineering: "Closure / Continue",
        neutral: "Continue",
      },
    },
    persist: {
      id: "persist",
      label: {
        hr: "Zustand sichern",
        engineering: "Persist State",
        neutral: "Persist",
      },
    },
    continue: {
      id: "continue",
      label: {
        hr: "Fortsetzen",
        engineering: "Closure / Continue",
        neutral: "Continue",
      },
    },
    exhausted: {
      id: "exhausted",
      label: {
        hr: "Endgültiger Fehler",
        engineering: "Exhausted failure",
        neutral: "Exhausted",
      },
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
