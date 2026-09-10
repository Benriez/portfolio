# Architecture

The portfolio is a **static Astro** site. The runtime is a single-page
TypeScript BODI visualization that runs in the browser. Astro provides the
HTML shell, the typed content, and the build pipeline.

## Principles

1. **Complexity is isolated where the domain is complex.** Static portfolio
   content stays static. The BODI runtime lives behind a single feature
   directory.
2. **The static HTML carries both views.** Both `hr` and `engineering`
   variants of every dual-content field ship in the rendered HTML. The mode
   is a CSS-only visibility switch.
3. **No framework.** No React, Vue, Angular, Tailwind, GSAP, Three.js. No
   state-management library. Astro components + TypeScript modules only.
4. **Typed content over hard-coded strings.** All structured content lives
   under `src/data/*.ts` with shared types in `src/types/content.ts`.

## Stack

| Layer           | Choice                                                |
| --------------- | ----------------------------------------------------- |
| Static site     | Astro 7 (static output)                               |
| Language        | TypeScript 7 (strict)                                 |
| Linting         | ESLint 9 (flat config)                                |
| Formatting      | Prettier 3                                            |
| Unit tests      | Vitest 5                                              |
| E2E tests       | Playwright 1.63                                       |
| Accessibility   | `@axe-core/playwright`                                |
| Package manager | pnpm 12.3.4                                           |
| Toolchain       | Node 22.x LTS                                         |
| Hosting         | GitHub Pages (`https://benriez.github.io/portfolio/`) |
| CI              | GitHub Actions                                        |

## Client-side JS boundary

Static HTML is shipped for everything except the BODI runtime. The runtime
ships a small TypeScript island (`src/features/bodi-runtime/`) that:

- hydrates an SVG layer with the deterministic graph layout,
- mutates `data-state` attributes to animate,
- reads `body[data-mode]` to switch vocabulary,
- respects `prefers-reduced-motion`.

There is no SPA navigation, no router, no client-side data fetching.

## CSS strategy

- Design tokens in `src/styles/tokens.css` (single source of truth).
- Global rules and reset in `src/styles/global.css`.
- Print rules in `src/styles/print.css`.
- BODI runtime styles isolated in `src/features/bodi-runtime/runtime.css`.
- Component-level styles via Astro `<style>` blocks.

## Testing strategy

- **Unit** — pure logic only: the BODI state machine, geometry, labels, and
  content placeholder audit.
- **E2E** — three real viewport projects (390 / 768 / 1440) and both modes
  (HR / Engineering) against the built site via `pnpm preview`.
- **Accessibility** — `@axe-core/playwright` smoke test in both modes.

## GitHub Pages constraints

- `base: "/portfolio"` is required because the site lives under
  `https://benriez.github.io/portfolio/`.
- No CNAME until a real domain is acquired.
- The deployed artifact is the output of `astro build` (static).

## Complexity budget

The portfolio intentionally does not grow past:

- 1 layout (`BaseLayout.astro`)
- ~10 components in `src/components/`
- 5 typed content files (`projects`, `experience`, `education`,
  `capabilities`, `tech-stack`)
- 1 BODI feature directory
- 1 single CI workflow
