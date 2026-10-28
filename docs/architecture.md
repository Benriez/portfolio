# Architecture

The portfolio is a **static Astro** site. The shell is plain HTML/CSS.
There is no client runtime, no state machine, no controller, no
JavaScript island for the body content. The only client-side layer is a
presentation enhancement (the staged scroll experience) that the page
does not depend on.

## Principles

1. **Static where the domain is static.** Portfolio content stays static
   HTML; only the navigation mode-switch ships minimal inline JavaScript.
2. **The static HTML carries both views.** Both `hr` and `engineering`
   variants of every dual-content field ship in the rendered HTML. The mode
   is a CSS-only visibility switch.
3. **No framework.** No React, Vue, Angular, Tailwind, Three.js. No
   state-management library. Astro components + TypeScript modules only.
   GSAP + ScrollTrigger is the single motion library, loaded as a
   page-local chunk purely for presentation (see below).
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

The portfolio ships **no client JS that the content depends on**. The
JavaScript on the page is:

- the mode-switch / active-section handler in `SiteHeader.astro`,
- the URL-query `?mode=` applier and the motion gate in
  `BaseLayout.astro` (inline, in `<head>`),
- the staged scroll experience in `src/scripts/scroll-experience.ts`
  (GSAP 3 + ScrollTrigger), loaded as a separate chunk only when
  `prefers-reduced-motion` is not set and the connection is not a
  data-saver / 2G one.

There is no SPA navigation, no router, no client-side data fetching.

## Scroll experience

`scroll-experience.ts` owns every GSAP / ScrollTrigger instance and uses
three motion primitives: once-only reveals (opacity + translateY, triggered
at 90% of the viewport so content arrives with the scroll), staggered
progressive reveals for groups (section heads, project phases, career
roles, capability domains), and a few scrubbed, reversible scroll-linked
cues (hero recede, the accent rule on the current project, the
Working-Approach headline lines, the 2px progress line in the header).

Hard rules: native scrolling is untouched (no pinning, no snap, no scroll
proxy, no wheel handling); transform / opacity only; text is never dimmed
below WCAG contrast while on screen; keyboard focus reveals hidden
content immediately; `ScrollTrigger.refresh()` runs after a mode switch
and after web fonts load.

Progressive enhancement: the base CSS hides nothing. The head script sets
`html[data-motion="pending"]` (hero held back by CSS) only when motion is
wanted, the module flips it to `ready` after staging, and a 2.5 s
fallback (or any load error) flips it to `off` with everything visible.
Reduced motion → `off`, no chunk is downloaded.

## CSS strategy

- Design tokens in `src/styles/tokens.css` (single source of truth).
- Global rules and reset in `src/styles/global.css`.
- Print rules in `src/styles/print.css`.
- Component-level styles via Astro `<style>` blocks.

## Testing strategy

- **Unit** — typed content + manifest parity under `tests/unit/`.
- **E2E** — three real viewport projects (390 / 768 / 1440) and both modes
  (HR / Engineering) against the built site via `pnpm preview`.
- **Accessibility** — `@axe-core/playwright` full rule set in both modes,
  scanned in settled states (after the hero staged in, and at the page
  end with everything revealed).
- **Motion** — `tests/e2e/motion.spec.ts`: initialisation, fast / reverse
  scroll leave nothing hidden, anchors and deep links with motion on,
  mode switch + refresh, reduced-motion and failure paths, native
  scrolling intact, no overflow.

## GitHub Pages constraints

- `base: "/portfolio"` is required because the site lives under
  `https://benriez.github.io/portfolio/`.
- No CNAME until a real domain is acquired.
- The deployed artifact is the output of `astro build` (static).

## Complexity budget

The portfolio intentionally does not grow past:

- 1 layout (`BaseLayout.astro`)
- ~10 components in `src/components/`
- 5 typed content files (`projects`, `experience`, `capabilities`,
  `tech-stack`, `education`)
- 1 single CI workflow

See ADR 0003 for the historical move from a runtime BODI visualization
to the static diagram, and the subsequent decision to retire the
dedicated flagship section entirely.
