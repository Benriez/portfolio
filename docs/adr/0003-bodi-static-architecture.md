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

Two reasons justified that change:

1. The flagship reads more cleanly as a **system description** than as
   a runtime demo. The diagram and the Production Evidence panel
   together communicate the same boundary as the token animation, in a
   form that prints, indexes, and survives reduced-motion.
2. Removing the runtime island eliminates a sizeable surface (state
   machine, geometry, controller, SVG edges, cycle timing, IntersectionObserver,
   MutationObserver, reduced-motion handler). The flagship component is
   pure Astro: HTML, scoped CSS, and one inline SVG.

## Decision (2026-10-08, revised)

The flagship is rendered by `src/components/bodi/BodiFlagship.astro`
and uses a **focused editorial system map**:

- a short intro paragraph (HR + Engineering variant) next to the
  title, plus a restrained mono "In aktiver Entwicklung" status,
- one wide composition: `Task → BODI → Verified Result`,
- inside the BODI block: the five-stage execution loop (`01 Plan →
02 Execute → 03 Verify → 04 Persist → 05 Continue`), a static
  recovery arc returning from `Verify` into `Execute`, and a compact
  `Local Inference · Ornith · Qwen · Decision` row,
- three short engineering points (`Durable Execution`,
  `Recovery & Verification`, `Local AI Infrastructure`),
- one compact `Role` line and one restrained evidence strip.

The earlier copy-rich case-study surface (the `Problem / System /
Reliability` case-grid, the `Engineering Ownership` block, the
`Reliability Engineering` block, the production-evidence definition
list with provenance chain, and the `Queue Replay` and
`Durable Dispatch` reliability stories) has been **removed** to
shorten the section and let BODI dominate the visual hierarchy. The
canonical concepts are now carried by the visualization itself and by
the three engineering points.

### Module layout

```
src/components/bodi/
└── BodiFlagship.astro   # static editorial system map
```

The old `src/features/bodi-runtime/` directory is removed. The previous
`machine.ts`, `geometry.ts`, `labels.ts`, `types.ts`, `controller.ts`,
`runtime.css`, and the previous `BodiRuntimeVisualization.astro` no
longer exist.

### Mode switch

The HR / Engineering intros split via the standard `[data-view]` CSS
mechanism used elsewhere in the portfolio. The visualization itself is
shared across modes — the five execution stages and the recovery
concept are universal. No JavaScript is involved in the flagship.

### What is excluded

- No imports from the Agent Garden source tree.
- No runtime animation, no token, no recovery animation.
- No timers, no `IntersectionObserver`, no `MutationObserver`.
- No client-side script for the flagship.
- No `Problem / System / Reliability` case-grid, no `Engineering
Ownership` block, no `Reliability Engineering` block, no
  production-evidence definition list, no provenance chain, no
  reliability stories (`Queue Replay`, `Durable Dispatch`).

## Consequences

- The flagship can be rendered server-side and printed with full
  fidelity.
- The section is materially shorter — the visualization plus the three
  engineering points fit in roughly half the vertical footprint of the
  previous long-form surface.
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
