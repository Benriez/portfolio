# ADR 0002 — BODI runtime isolation

Status: Accepted (2026-09-10)
Author: Ben Riederer

## Context

The portfolio shows a small visualization of an Agent Garden runtime.
That concept (memory gate, durable graph execution, supervisor recovery,
bounded attempts) is the most complex thing the portfolio carries — and
it happens to live entirely inside a different repository in the operator's
sibling source tree.

Two risks follow:

1. The visualization drifts from the real semantics as Agent Garden changes.
2. The portfolio leaks Agent Garden's private state, secrets, or
   internal types into the public site.

The canonical Agent Garden runtime lives in a sibling repository. The
portfolio references its concepts by name and by the public-facing source
file inside that repo, but does **not** import from it.

## Decision

Embed a **standalone visualization** that:

- Re-implements the visualization vocabulary, but not the runtime.
- Lives in a single feature directory `src/features/bodi-runtime/`.
- Has zero dependency on Agent Garden sources — the runtime is re-derived
  from the public-facing concepts in `docs/bodi-runtime.md`.
- Treats `attemptCount >= 3` as the canonical bounded-attempt budget; the
  same boundary code produces `terminal_failure` in Agent Garden's
  `verifier.ts`.
- Re-checks the mapping against the Agent Garden source **only** at
  documentation review or release-prep time. The visualization does NOT
  re-fetch the live Agent Garden state.

### Module layout

```
src/features/bodi-runtime/
├── BodiRuntimeVisualization.astro   # SVG markup + small inline script
├── machine.ts                       # pure state machine (no DOM)
├── geometry.ts                      # pure layout (no DOM)
├── labels.ts                        # static label data (hr / engineering / neutral)
├── types.ts                         # BODI domain types
├── runtime.css                      # scoped BODI styles
└── controller.ts                    # constants and types for the controller
```

The state machine and geometry are **pure functions**. The DOM adapter is
the only place that touches `requestAnimationFrame`, timers, and
`MutationObserver`.

### What is excluded

- No `import` from the Agent Garden source tree.
- No SQLite path references, no logs, no bridge state, no Telegram
  configuration.
- No animations beyond a single moving token.
- No recreation of the supervisor-recovery TypeScript logic; we show its
  effect (bounded retry under recovery) without re-implementing it.

## Consequences

- The visualization can ship in any static-hosting environment without
  needing a backend.
- A drift between Agent Garden and the visualization is caught by
  documentation review, not by automated tests against Agent Garden.
- Anyone reading the portfolio can verify the visualization vocabulary
  against `docs/bodi-runtime.md`, which references Agent Garden concepts
  by canonical name and source file location **without** including or
  requiring Agent Garden itself.

## References

- `src/features/bodi-runtime/machine.ts`
- `src/features/bodi-runtime/geometry.ts`
- `docs/bodi-runtime.md`
- `bridge/src/services/workflow-controller/verifier.ts` (canonical source)
