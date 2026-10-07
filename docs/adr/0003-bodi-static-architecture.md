# ADR 0003 — BODI flagship as static architecture diagram

Status: Accepted (2026-10-08)
Author: Ben Riederer

## Context

ADR 0002 introduced a BODI runtime visualization as a small TypeScript
island with a deterministic state machine (`machine.ts`), geometry
(`geometry.ts`), and labels (`labels.ts`). The intent was a moving
token through a 13-node pipeline with normal-flow and recovery
sub-flows.

The OpenDesign reference updated the flagship surface to a **static
system architecture diagram**: a 5-cell grid (`input → core → output` +
`models` underneath) with a recovery SVG curve and a copy-rich
case-study section beneath it. No animation, no controller, no state
machine.

Two reasons justify the change:

1. The flagship reads more cleanly as a **system description** than as
   a runtime demo. The diagram and the Production Evidence panel
   together communicate the same boundary as the token animation, in a
   form that prints, indexes, and survives reduced-motion.
2. Removing the runtime island eliminates a sizeable surface (state
   machine, geometry, controller, SVG edges, cycle timing, IntersectionObserver,
   MutationObserver, reduced-motion handler). The flagship component is
   pure Astro: HTML, scoped CSS, and one inline SVG.

## Decision

Replace the BODI runtime visualization with a static architecture
diagram rendered by `src/components/bodi/BodiFlagship.astro`. The
diagram mirrors the OpenDesign reference exactly: input, core (with
state line and four stages), output, models, recovery curve, case-grid,
Engineering Ownership, Reliability Engineering, Production Evidence,
provenance chain, and two reliability stories (Queue Replay + Durable
Dispatch).

### Module layout

```
src/components/bodi/
└── BodiFlagship.astro   # static architecture + case-study surface
```

The old `src/features/bodi-runtime/` directory is removed in this
change. The previous `machine.ts`, `geometry.ts`, `labels.ts`,
`types.ts`, `controller.ts`, `runtime.css`, and the previous
`BodiRuntimeVisualization.astro` no longer exist.

### Mode switch

The HR / Engineering labels inside the four-stage core cell are split
via the standard `[data-view]` CSS mechanism used elsewhere in the
portfolio. No JavaScript is involved in the flagship.

### What is excluded

- No imports from the Agent Garden source tree.
- No runtime animation, no token, no recovery animation.
- No timers, no `IntersectionObserver`, no `MutationObserver`.
- No client-side script for the flagship.

## Consequences

- The flagship can be rendered server-side and printed with full
  fidelity.
- The portfolio no longer ships the runtime visualization, the
  deterministic state machine, or any BODI feature script.
- Anyone reading the portfolio sees the same static diagram whether
  they have JavaScript enabled, prefer reduced motion, or print the
  page.
- Drift between the reference and the portfolio is now a content-only
  check, not a visual-render-vs-reference check.

## References

- `src/components/bodi/BodiFlagship.astro`
- `docs/bodi-runtime.md`
- OpenDesign reference (`opendesign/application-site/index.html`,
  `styles.css`) — read-only source of truth.
