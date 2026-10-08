# Deployment

The portfolio deploys from the `master` branch of
[Benriez/portfolio](https://github.com/Benriez/portfolio) to GitHub Pages at
[`https://benriez.github.io/portfolio/`](https://benriez.github.io/portfolio/).

## GitHub Pages source

GitHub Pages for this repository is configured to publish via **GitHub
Actions** (`build_type: "workflow"`). The production site is served from
the artifact uploaded by `actions/upload-pages-artifact` and deployed by
`actions/deploy-pages` in the `deploy` job. The Pages API's `source`
field is intentionally **not** authoritative — `branch: master / path: /`
must NOT be used to serve repository content directly.

The repository contains no Jekyll workarounds (`.nojekyll` is not
required for the Actions path). Do not commit a root `index.html` to
"redirect" Pages — that masks the regression and re-introduces the
legacy branch-source configuration.

## Canonical branch

`master`. The CI workflow triggers on `push` and `pull_request` against
`master`. **Do not** use `main`.

## CI pipeline

`/.github/workflows/quality-and-deploy.yml` runs a single workflow with
sequenced jobs:

```
quality
  ↓
build
  ↓
e2e
  ↓
pages
  ↓
deploy
  ↓
production-smoke
```

PR runs the first three jobs only. `master` runs all six. No deploy from a
fork that is not the canonical owner.

### Jobs

| Job                | Trigger                 | Purpose                                                                                                            |
| ------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `quality`          | `push`, `pull_request`  | `pnpm install`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`                                    |
| `build`            | after `quality`         | `pnpm build` → `dist/`                                                                                             |
| `e2e`              | after `build`           | Spins up `pnpm preview` and runs `pnpm test:e2e` against three viewports                                           |
| `pages`            | after `e2e` (master)    | Configures GitHub Pages (`actions/configure-pages@v4`)                                                             |
| `deploy`           | after `pages` (master)  | Uploads the static `dist/` artifact (`actions/upload-pages-artifact@v3`) and deploys via `actions/deploy-pages@v4` |
| `production-smoke` | after `deploy` (master) | Fetches the live URL, asserts the Astro portfolio is served (not README)                                           |

The deploy job is **only** executed if all earlier jobs pass. Deploying from
PRs is structurally impossible.

## GitHub Pages base path

Because the site is published under
`https://benriez.github.io/portfolio/`, `astro.config.mjs` declares:

```ts
base: "/portfolio",
```

If you fork this repository and want to publish from the apex
(`https://<user>.github.io/`) or under a project page of a different name,
update `base` accordingly. No CNAME is configured. Acquire a real domain
before adding `public/CNAME`.

## Local build sanity

Before tagging a release, run the full pipeline locally:

```sh
pnpm install
pnpm check         # lint + format:check + typecheck + tests
pnpm build         # static build to dist/
pnpm preview       # serve dist/ on http://127.0.0.1:4321
```

Then in a second terminal:

```sh
pnpm test:e2e      # verifies the served output across viewports + axe-core
```

`pnpm check` runs the unit tests but **does not** duplicate the e2e tests —
they live behind `pnpm test:e2e` and trigger separately in CI.

The post-deploy `production-smoke` job is **not** run in the local pipeline.
It only runs in CI after a successful `deploy` and fetches
`https://benriez.github.io/portfolio/` to verify that the live URL is
serving the Astro portfolio and not the repository README. To run it
manually:

```sh
PLAYWRIGHT_PRODUCTION_URL=https://benriez.github.io/portfolio/ \
  pnpm exec playwright test tests/e2e/production-smoke.spec.ts
```

## Roll-forward strategy

The site is fully static. A bad release can be corrected with a follow-up
commit on `master`. Pages will republish on the next successful CI run.

There is no need to roll back — `git revert` then `git push` is sufficient.

## Skipping a release

If a commit on `master` should not produce a new Pages deployment, append
`[skip pages]` to the commit subject. (`pages` and `deploy` are gated by the
e2e job; if you need a manual hold, push `--force` of an empty commit or
amend and reset CI — neither is a normal action.)

## What is hosted

- The artifact uploaded from `dist/` in the `deploy` job is served at
  `https://benriez.github.io/portfolio/`.
- `dist/favicon.svg` is resolved at `/portfolio/favicon.svg` (and rewritten
  by Astro for the configured base).
- No server logic, no API routes, no client-side telemetry.
