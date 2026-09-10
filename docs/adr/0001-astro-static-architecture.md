# ADR 0001 — Astro static architecture

Status: Accepted (2026-09-10)
Author: Ben Riederer

## Context

The portfolio is a personal site with stable, low-churn content. The
production feature surface is small: hero, three projects, an experience
list, a capability grid, the BODI runtime visualization, a contact block.

Two real constraints shaped the choice:

1. The site will be hosted on GitHub Pages. No server-side runtime is
   available at the edge.
2. The site must support a HR view and an Engineering view as **static**
   HTML so that either audience gets a fully-rendered page in the first
   byte. Search engines, browsers without JavaScript, and screen readers
   must all see the full content.

## Decision

Use **Astro 7** in static-output mode. The site renders all content to
HTML at build time. A small TypeScript island powers the BODI runtime
visualization. No SPA, no SSR, no adapter.

### Why Astro

- Ships **zero client JS by default** for components that do not
  explicitly opt in. The portfolio body is mostly static.
- Built-in typed content collections and integration with TypeScript
  strict.
- Native font support (`experimental.fonts`) keeps fonts self-hosted
  without runtime fetching.
- A single `astro check` runs the TypeScript strict pass over `.astro`
  files.

### Why not alternatives considered

| Option              | Rejected because                                                                    |
| ------------------- | ----------------------------------------------------------------------------------- |
| Next.js             | Adds an adapter path (or static export) and ships React. We have no React needs.    |
| Hugo / Jekyll       | Markdown-first ergonomics fight against the typed TS content module I want.         |
| Plain HTML          | Loses the typed content + BODI feature isolation with a script tag in `index.html`. |
| Astro + Vue / React | Bringing a UI framework for one BODI feature is unjustified.                        |

## Consequences

- The build artifact is HTML/CSS/JS in `dist/`. Pages serves it directly.
- Components are small, scoped, and rendered server-side at build time.
- The BODI runtime ships as one Astro component that embeds its own
  script tag pointing to a TS module. Astro bundles the script.

## References

- `astro.config.mjs`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro`
- `src/features/bodi-runtime/`
