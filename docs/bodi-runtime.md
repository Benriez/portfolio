# BODI flagship architecture

The portfolio contains a **static system architecture diagram** for the
BODI / agent-garden flagship. The diagram is **not** a live runtime
animation and **does not** invoke the real Agent Garden runtime. It is a
content-first editorial surface that maps the canonical concepts of the
real system to a static, accessible HTML/CSS layout.

## What this is

A single editorial composition rendered by
`src/components/bodi/BodiFlagship.astro`:

- a short intro paragraph identifying BODI as a self-operated AI
  Operator Platform for durable, stateful AI workflows,
- one system visualization with three end nodes (`Task` → `BODI` →
  `Verified Result`) and the BODI block carrying the focal execution
  loop,
- inside the BODI block: the five-stage flow `01 Plan → 02 Execute →
03 Verify → 04 Persist → 05 Continue`, a static recovery arc
  returning from `Verify` into `Execute`, and a compact
  `Local Inference · Ornith · Qwen · Decision` row,
- three short engineering points below the visualization
  (`Durable Execution`, `Recovery & Verification`,
  `Local AI Infrastructure`),
- one compact `Role` line and one restrained evidence strip
  (`Persistent State · Bounded Recovery · Local Inference ·
Regression Tested · Provenance`).

The visualization height fits well under the target 420–520 px desktop
range. The active-development status sits next to the title as a
mono/editorial line — there is no coloured SaaS badge.

The diagram is fully static. No `requestAnimationFrame`, no timers, no
`MutationObserver`. The mode switch toggles between HR and Engineering
intros via the same `[data-view]` CSS visibility mechanism the rest of
the portfolio uses.

## Source of truth

The diagram is rendered from `src/components/bodi/BodiFlagship.astro`.
Agent Garden itself lives in a sibling repository; this page renders a
**stable, public-facing description** of its shape without importing
from or reaching into it.

## What this page does NOT include

- Live agent runs.
- A live runtime controller, token animation, or scheduler visualization.
- Real SQLite / Telegram / supervisor state.
- Imports from the Agent Garden source tree.
- The previous long-form `Problem / System / Reliability` case-grid,
  `Engineering Ownership` block, `Reliability Engineering` block,
  production-evidence definition list, provenance chain, or
  `Queue Replay` / `Durable Dispatch` stories. Those panels were
  removed in the flagship simplification; the canonical concepts are
  now carried by the visualization and the three engineering points.

If you want those, see [Agent Garden](https://github.com/Benriez/agent-garden).

## Why static and not animated

The flagship is a **system description**, not a live demonstration. The
proof of reliability lives in the visualization itself, in the three
engineering points, and in the compact evidence strip — not in a moving
token.

1. The page is **print-friendly**. Every panel survives `@media print`
   and renders for reviewers reading the CV/print export.
2. **Accessibility** is straightforward when there is nothing to animate.
   Screen readers, reduced-motion users, and search engines see the same
   content as everyone else.
3. The static visualization already communicates the system clearly,
   so animation would add complexity without adding signal.

The change is documented in ADR 0003.
