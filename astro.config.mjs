// @ts-check
import { defineConfig } from "astro/config";

/**
 * The Engineering Portfolio builds static HTML/CSS/JS.
 *
 * - No integrations required: all content is hand-typed in `src/data`.
 * - Fonts are loaded via the CSS `font-family` stack in
 *   `src/styles/tokens.css`. No Astro font management is used so the
 *   project stays decoupled from font-provider packaging.
 * - GitHub Pages hosts the artifact under `/portfolio`.
 */
export default defineConfig({
  output: "static",
  site: "https://benriez.github.io",
  base: "/portfolio",
  trailingSlash: "never",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
    assets: "_astro",
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  vite: {
    build: {
      cssMinify: "lightningcss",
    },
  },
});
