# Architecture

The portfolio is a **static Astro** site. The shell is plain HTML/CSS.
The BODI flagship is a single static Astro component; there is no client
runtime, no state machine, no controller, no JavaScript island for the
flagship.

## Principles

1. **Complexity is isolated where the domain is complex.** Static portfolio
   content stays static. The BODI flagship is one Astro file.
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

The portfolio ships **no client JS** for the body content. The only
JavaScript on the page is:

- the mode-switch handler in `SiteHeader.astro`,
- the print-button handler in `Hero.astro`,
- the URL-query `?mode=` applier in `BaseLayout.astro`.

There is no SPA navigation, no router, no client-side data fetching.

## CSS strategy

- Design tokens in `src/styles/tokens.css` (single source of truth).
- Global rules and reset in `src/styles/global.css`.
- Print rules in `src/styles/print.css`.
- Component-level styles via Astro `<style>` blocks.

## Testing strategy

- **Unit** — typed content + manifest parity under `tests/unit/`.
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
- ~10 components in `src/components/` plus `BodiFlagship.astro`
- 5 typed content files (`projects`, `experience`, `capabilities`,
  `tech-stack`, `education`)
- 1 static BODI flagship component
- 1 single CI workflow

See ADR 0003 for the move from a runtime visualization to the static
architecture diagram.
