# ADR 0003 — BODI flagship as static architecture diagram

Status: Superseded (2026-10-08)
Author: Ben Riederer

> **Superseded note (2026-10-08).** The dedicated BODI flagship
> section this ADR introduced was itself removed from the portfolio on
> 2026-10-08. BODI / agent-garden is now communicated solely through
> its Selected Work entry. This ADR remains in the repository as a
> record of the decisions that led to that state.

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

Two reasons justified that change:

1. The flagship reads more cleanly as a **system description** than as
   a runtime demo. The diagram and the Production Evidence panel
   together communicate the same boundary as the token animation, in a
   form that prints, indexes, and survives reduced-motion.
2. Removing the runtime island eliminates a sizeable surface (state
   machine, geometry, controller, SVG edges, cycle timing, IntersectionObserver,
   MutationObserver, reduced-motion handler). The flagship component is
   pure Astro: HTML, scoped CSS, and one inline SVG.

## Original decision

Replace the BODI runtime visualization with a static architecture
diagram rendered by `src/components/bodi/BodiFlagship.astro`. The
diagram mirrors the OpenDesign reference exactly: input, core (with
state line and four stages), output, models, recovery curve, case-grid,
Engineering Ownership, Reliability Engineering, Production Evidence,
provenance chain, and two reliability stories (Queue Replay + Durable
Dispatch).

### Module layout (at the time)

```
src/components/bodi/
└── BodiFlagship.astro   # static architecture + case-study surface
```

The old `src/features/bodi-runtime/` directory was removed in that
change. The previous `machine.ts`, `geometry.ts`, `labels.ts`,
`types.ts`, `controller.ts`, `runtime.css`, and the previous
`BodiRuntimeVisualization.astro` no longer existed.

### Mode switch

The HR / Engineering labels inside the four-stage core cell were split
via the standard `[data-view]` CSS mechanism used elsewhere in the
portfolio. No JavaScript was involved in the flagship.

### What was excluded

- No imports from the Agent Garden source tree.
- No runtime animation, no token, no recovery animation.
- No timers, no `IntersectionObserver`, no `MutationObserver`.
- No client-side script for the flagship.

## Consequences (at the time)

- The flagship could be rendered server-side and printed with full
  fidelity.
- The portfolio no longer shipped the runtime visualization, the
  deterministic state machine, or any BODI feature script.
- Anyone reading the portfolio saw the same static diagram whether
  they had JavaScript enabled, preferred reduced motion, or printed
  the page.
- Drift between the reference and the portfolio became a content-only
  check, not a visual-render-vs-reference check.

## Follow-up (2026-10-08)

The BODI flagship surface was further simplified and, ultimately,
**retired entirely**. The dedicated flagship section, the SVG
geometry, the case-grid, the production-evidence panel, the
provenance chain, the reliability stories, and the per-section CSS
were all removed.

BODI / agent-garden continues to be described by the portfolio — but
now as a single Selected Work entry that carries its
`active-development` status and the existing HR / Engineering lead
copy. No `#flagship` anchor, no case-study link, no
flagship-component handoff remains.

## References (historical)

- `src/components/bodi/BodiFlagship.astro` (deleted 2026-10-08)
- OpenDesign reference (`opendesign/application-site/index.html`,
  `styles.css`) — read-only source of truth.
