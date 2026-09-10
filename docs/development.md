# Development

Local development for the Engineering Portfolio.

## Prerequisites

| Tool    | Version     | Notes                                                 |
| ------- | ----------- | ----------------------------------------------------- |
| Node.js | `>=22.12.0` | LTS. The Astro engine requires Node 22.12.0 or newer. |
| pnpm    | `12.3.4`    | Pinned via the `packageManager` field.                |
| Git     | `>=2.40`    | Trivial; nothing exotic.                              |

> The engines field in `package.json` declares the supported Node range.
> Use Node 22 LTS in production (CI pins `volta.node = "22.20.2"`).

## Local toolchain shim

If your system Node is older than 22 and you have Homebrew:

```sh
# Node 22 from Homebrew lives at /opt/homebrew/opt/node@22/bin
# scripts/pnpm22.sh wraps pnpm under that Node.
bash scripts/pnpm22.sh --version
# → 12.3.4
```

This wrapper is intentionally **not** required to run the project. CI uses
official `actions/setup-node@v4` to provision the canonical version.

## Commands

All commands match `package.json` exactly.

```sh
pnpm install               # Install dependencies
pnpm dev                   # Local dev server (Vite + Astro HMR)
pnpm preview               # Build + serve the production bundle on :4321
pnpm build                 # Production build (static output to dist/)
pnpm check                 # Quality gate: lint + format:check + typecheck + tests
pnpm lint                  # ESLint only
pnpm lint:fix              # ESLint with --fix
pnpm format                # Prettier with --write
pnpm format:check          # Prettier with --check
pnpm typecheck             # Astro check (TypeScript strict)
pnpm test                  # Vitest run
pnpm test:watch            # Vitest watch mode
pnpm test:e2e              # Playwright end-to-end tests (uses preview server)
pnpm test:e2e:install      # Installs Playwright browsers
pnpm verify:docs           # Validates documentation freshness
pnpm verify:public-release # Audits the public-release-safety invariants
```

## Source layout

```
src/
├── components/                 # Astro components (SiteHeader, Hero, etc.)
├── data/                       # Typed content modules (projects.ts, etc.)
├── features/
│   └── bodi-runtime/           # BODI visualization island
│       ├── BodiRuntimeVisualization.astro
│       ├── machine.ts          # Pure state machine
│       ├── controller.ts       # Constants & types for the controller
│       ├── geometry.ts         # Pure graph layout
│       ├── labels.ts           # All textual labels
│       ├── types.ts            # BODI-specific types
│       └── runtime.css         # BODI scoped styles
├── layouts/
│   └── BaseLayout.astro        # Single layout shell
├── pages/
│   └── index.astro             # The single-page portfolio
├── scripts/                    # (reserved) tiny page-init scripts
├── styles/
│   ├── tokens.css              # Design tokens
│   ├── global.css              # Reset + global rules + mode visibility
│   └── print.css               # Print stylesheet
└── types/
    └── content.ts              # Portfolio domain types

tests/
├── unit/                       # Vitest tests (pure modules only)
└── e2e/                        # Playwright tests (built site)

scripts/                         # Repo-root maintenance scripts
docs/                            # Engineering documentation
.github/workflows/               # CI workflow
public/                          # Static assets served as-is
```

## Styling conventions

- CSS custom properties live in `src/styles/tokens.css` and only there.
- Component-local CSS goes in the `<style>` block of each `.astro` file.
- Astro automatically scopes these styles per component.
- No CSS-in-JS, no Tailwind, no utility libraries.

## Typed content model

All structured content is centralized in `src/data/`. The shared types live
in `src/types/content.ts`. Each content file imports these types and exposes
a single named export — typed `DualCopy` fields are guaranteed to carry both
HR and Engineering variants.

## Mode rendering

The portfolio ships both modes in the static HTML. CSS in
`src/styles/global.css` enforces:

```css
[data-view="hr"] {
  display: none;
}
[data-view="engineering"] {
  display: none;
}
body[data-mode="hr"] [data-view="hr"] {
  display: revert;
}
body[data-mode="engineering"] [data-view="engineering"] {
  display: revert;
}
```

The default mode is set in `src/pages/index.astro`. The mode toggle is a
button with `data-set-mode="hr|engineering"`, handled by a small inline script in
`src/layouts/BaseLayout.astro`.

## Feature boundaries

The BODI feature is **isolated** from everything else:

- Only `src/features/bodi-runtime/*` knows about the BODI vocabulary.
- `controller.ts` is the only place where timers, observers, and DOM
  mutations live.
- `geometry.ts` and `machine.ts` are pure functions with no I/O.
- `labels.ts` is plain data; its values are safe to import in tests.
