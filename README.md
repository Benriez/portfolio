# Engineering Portfolio

> Calm, editorial, content-first personal site.

Personal portfolio of **Ben Riederer** — built with **Astro 7** and
**TypeScript** strict. Hosted as a static site on GitHub Pages under
[`/portfolio`](https://benriez.github.io/portfolio/).

The portfolio intentionally avoids any UI framework. Static HTML carries
both an HR view and an Engineering view (CSS-driven visibility). A small
TypeScript island powers a deterministic BODI runtime visualization.

## Stack

- **Astro 7** (static output)
- **TypeScript 7** (strict)
- **pnpm 12** workspace
- **ESLint 9** flat config + **Prettier 3**
- **Vitest 5** (unit) and **Playwright 1.63** (E2E + axe-core)
- **Node 22 LTS** runtime (declared in `engines` and CI)
- **GitHub Pages** (`/portfolio` base path)
- **GitHub Actions** single workflow

## Architecture summary

| Concern         | Where                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Layout shell    | `src/layouts/BaseLayout.astro`                                        |
| Page            | `src/pages/index.astro` (one page)                                    |
| Components      | `src/components/*.astro`                                              |
| Content         | `src/data/{projects,experience,capabilities,tech-stack,education}.ts` |
| Shared types    | `src/types/content.ts`                                                |
| Design tokens   | `src/styles/tokens.css`                                               |
| Reset & globals | `src/styles/global.css`                                               |
| Print           | `src/styles/print.css`                                                |
| BODI runtime    | `src/features/bodi-runtime/`                                          |

The BODI feature is **isolated**:

- `machine.ts` is pure (no DOM).
- `geometry.ts` is pure (computes bounds).
- `labels.ts` is plain data.
- The Astro wrapper owns DOM, timers, observers.

See `docs/architecture.md` and `docs/bodi-runtime.md` for the full
picture.

## Local setup

```sh
# Requires Node >= 22.12 (declared in package.json engines).
pnpm install
pnpm dev          # http://127.0.0.1:4321
```

If your system Node is older, `bash scripts/pnpm22.sh` wraps pnpm under
the Node 22 LTS provided by Homebrew.

## Commands

| Command                             | Purpose                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| `pnpm install`                      | Install dependencies                                        |
| `pnpm dev`                          | Dev server with HMR                                         |
| `pnpm build`                        | Static build to `dist/`                                     |
| `pnpm preview`                      | Serve the production bundle on `:4321`                      |
| `pnpm check`                        | Quality gate (lint + format:check + typecheck + unit tests) |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                      |
| `pnpm format` / `pnpm format:check` | Prettier                                                    |
| `pnpm typecheck`                    | Astro check (TypeScript strict)                             |
| `pnpm test`                         | Vitest unit tests                                           |
| `pnpm test:e2e`                     | Playwright E2E tests (needs `pnpm preview` running)         |
| `pnpm verify:docs`                  | Validates documentation freshness                           |
| `pnpm verify:public-release`        | Public-safety audit (secrets, paths, placeholders)          |

## Testing

- **Unit** — pure logic only (machine, geometry, labels, content audit)
  under `tests/unit/`.
- **E2E** — Playwright spins up three real viewports (390, 768, 1440) and
  runs both modes (HR / Engineering). The `pnpm preview` server is started
  automatically.
- **Accessibility** — `@axe-core/playwright` smoke against both modes.

## Accessibility

- Skip link, semantic landmarks, focus-visible rings.
- `prefers-reduced-motion` honored by the BODI runtime (static
  architecture still visible).
- Dual rendering of HR / Engineering views in static HTML.

## Deployment

`master` is the canonical branch. CI runs the full pipeline on every push:

```
install → lint → typecheck → unit → build → e2e → deploy (master only)
```

GitHub Pages serves the output under `/portfolio`. No CNAME is configured
until a real domain is acquired.

See `docs/deployment.md` for the complete pipeline.

## Source tree

```
.
├── astro.config.mjs
├── eslint.config.js
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vitest.config.ts
├── .editorconfig
├── .gitignore
├── .prettierrc.json
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── .github/workflows/quality-and-deploy.yml
├── docs/
│   ├── architecture.md
│   ├── bodi-runtime.md
│   ├── development.md
│   ├── deployment.md
│   └── adr/
│       ├── 0001-astro-static-architecture.md
│       └── 0002-bodi-runtime-isolation.md
├── scripts/
│   ├── verify-docs.sh
│   ├── check-public-release.sh
│   └── pnpm22.sh
├── src/
│   ├── components/
│   ├── data/
│   ├── features/bodi-runtime/
│   ├── layouts/BaseLayout.astro
│   ├── pages/index.astro
│   ├── styles/
│   └── types/
└── tests/
    ├── unit/
    └── e2e/
```

## License

The portfolio source code is MIT. The authored content (the German +
English dual-view copy in `src/data/*.ts` and the BODI runtime labels)
is dual-licensed under MIT + CC BY 4.0 so it can be reused with
attribution. See the footer link for the canonical CC declaration.

## Related projects

- [Agent Garden](https://github.com/Benriez/agent-garden) — the canonical
  BODI runtime this visualization depicts.
- [OpenDesign](https://github.com/Benriez/opendesign) — the design
  reference used for editorial layout decisions.
