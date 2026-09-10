import type { Aspect, RuntimeLabelSet } from "./types";

/**
 * BODI runtime visualization labels.
 *
 * Mirrors the OpenDesign reference (`app.js` LABELS tables):
 *   HR uses German short labels; Engineering uses English long labels.
 *   Neutral is a short technical identifier (used on the runtime graphic).
 */
export const runtimeLabels: RuntimeLabelSet = {
  nodes: {
    "graph-active": {
      id: "graph-active",
      label: {
        hr: "Graph-Knoten aktiv",
        engineering: "Graph node active",
        neutral: "Graph node",
      },
    },
    tick: {
      id: "tick",
      label: {
        hr: "Agent Tick",
        engineering: "Agent tick",
        neutral: "Agent tick",
      },
    },
    verify: {
      id: "verify",
      label: {
        hr: "Verifikation",
        engineering: "Verification",
        neutral: "Verify",
      },
    },
    pass: {
      id: "pass",
      label: {
        hr: "Bestanden",
        engineering: "Pass",
        neutral: "Pass",
      },
    },
    fail: {
      id: "fail",
      label: {
        hr: "Fehlgeschlagen",
        engineering: "Fail",
        neutral: "Fail",
      },
    },
    recover: {
      id: "recover",
      label: {
        hr: "Wiederaufnahme",
        engineering: "Recovery",
        neutral: "Recover",
      },
    },
    supervisor: {
      id: "supervisor",
      label: {
        hr: "Supervisor",
        engineering: "Supervisor",
        neutral: "Supervisor",
      },
    },
    "bounded-attempt": {
      id: "bounded-attempt",
      label: {
        hr: "Begrenzte Versuche",
        engineering: "Bounded attempts",
        neutral: "Bounded",
      },
    },
    persist: {
      id: "persist",
      label: {
        hr: "Persistieren",
        engineering: "Persist",
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
        hr:
          "Bei Fehlschlag greifen Recovery und Supervisor ein. Es wird begrenzt oft erneut verifiziert " +
          "und gelingt innerhalb des Budgets.",
        engineering:
          "On failure, recovery and supervisor engage. Verification is retried up to the bounded attempt " +
          "budget; on success, the result is persisted and the graph continues.",
        neutral: "On failure, bounded retry under supervisor; on success, persist and continue.",
      },
    },
    exhausted: {
      title: { hr: "Endgültiger Fehler", engineering: "Terminal failure", neutral: "Terminal" },
      caption: {
        hr:
          "Wenn das Versuchsbudget aufgebraucht ist, geht der Lauf in einen endgültigen Fehlerzustand über. " +
          "Es wird nicht persistiert.",
        engineering:
          "When the bounded attempt budget is exhausted, the run enters a terminal-failure state. " +
          "No persist; no continue.",
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
