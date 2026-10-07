# BODI flagship architecture

The portfolio contains a **static system architecture diagram** for the
BODI / agent-garden flagship. The diagram is **not** a live runtime
animation and **does not** invoke the real Agent Garden runtime. It is a
content-first editorial surface that maps the canonical concepts of the
real system to a static, accessible HTML/CSS layout.

## What this is

A 5-cell CSS grid (`input → core → output` with `models` underneath) plus:

- a recovery SVG curve with a `↻ RECOVERY & FORTSETZUNG` label,
- a 3-column case-grid (`01 Problem / 02 System / 03 Reliability`),
- an Engineering Ownership panel,
- a Reliability Engineering panel with a `failure model` mono line,
- a Production Evidence definition list (`Access / Workers / Scheduling
/ Dispatch Safety / Recovery / Verification / Releases / Provenance`),
- a `Source → Build → Release → Runtime` provenance chain,
- two reliability stories (`Queue Replay / Production Fix` and
  `Durable Dispatch / Recovery`).

The diagram is fully static. No `requestAnimationFrame`, no timers, no
`MutationObserver`. The mode switch toggles between HR and Engineering
labels via the same `[data-view]` CSS visibility mechanism the rest of
the portfolio uses.

## Source of truth

The diagram is rendered from `src/components/bodi/BodiFlagship.astro`.
Its content is verbatim from the OpenDesign reference and matches the
labels, copy, ordering and panel composition the reference defines.
Agent Garden itself lives in a sibling repository; this page renders a
**stable, public-facing description** of its shape without importing
from or reaching into it.

## What this page does NOT include

- Live agent runs.
- A live runtime controller, token animation, or scheduler visualization.
- Real SQLite / Telegram / supervisor state.
- Imports from the Agent Garden source tree.

If you want those, see [Agent Garden](https://github.com/Benriez/agent-garden).

## Why static and not animated

The OpenDesign reference deliberately shows BODI as a static
architecture diagram rather than as a runtime animation. The reasoning:

1. The page is **print-friendly**. Every panel survives `@media print`
   and renders for reviewers reading the CV/print export.
2. The flagship is a **system description**, not a live demonstration.
   The proof of reliability lives in Production Evidence, the provenance
   chain, and the reliability stories — not in a moving token.
3. **Accessibility** is straightforward when there is nothing to animate.
   Screen readers, reduced-motion users, and search engines see the same
   content as everyone else.

The change is documented in ADR 0003.
