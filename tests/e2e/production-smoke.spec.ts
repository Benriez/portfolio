import { test, expect } from "@playwright/test";

/**
 * Production smoke (GitHub Pages)
 *
 * High-signal guard against the regression where GitHub Pages
 * accidentally serves the repository README or other non-Astro
 * content from https://benriez.github.io/portfolio/.
 *
 * Runs against the live production URL defined in
 * `PLAYWRIGHT_PRODUCTION_URL` (falling back to the canonical
 * production URL). This file is excluded from the standard local
 * e2e run by the `grep` filter below so it only executes when
 * the variable is set, e.g. by a dedicated post-deploy CI job.
 */

const PRODUCTION_URL =
  process.env.PLAYWRIGHT_PRODUCTION_URL ?? "https://benriez.github.io/portfolio/";
const ENABLED = Boolean(process.env.PLAYWRIGHT_PRODUCTION_URL);

test.describe("Production smoke — GitHub Pages", () => {
  test.skip(!ENABLED, "set PLAYWRIGHT_PRODUCTION_URL to run production smoke");

  test("live URL serves the Astro portfolio, not README content", async ({ page }) => {
    const response = await page.goto(PRODUCTION_URL, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `expected 200 from ${PRODUCTION_URL}`).toBe(200);

    await expect(page).toHaveTitle(/Benjamin Riezler/);
    await expect(page.locator("h1").first()).toContainText("Benjamin Riezler");
    await expect(page.getByRole("heading", { level: 1, name: "Benjamin Riezler" })).toBeVisible();

    // 5 Selected Work projects, no removed flagships, no Case Study link,
    // no CV / Print button.
    expect(await page.locator("#work .work-item").count()).toBe(5);
    expect(await page.locator("#flagship").count()).toBe(0);
    expect(await page.locator('a:has-text("Case Study ansehen")').count()).toBe(0);
    expect(await page.locator('button:has-text("CV / Print")').count()).toBe(0);

    // README-only sections must NOT appear as the served site.
    const bodyText = await page.locator("body").innerText();
    for (const readmeMarker of [
      "Architecture summary",
      "Local setup",
      "Source tree",
      "## Stack",
      "## Commands",
      "## Testing",
      "## Deployment",
    ]) {
      expect(
        bodyText,
        `production served README content (${readmeMarker}) at ${PRODUCTION_URL}`,
      ).not.toContain(readmeMarker);
    }

    // Astro assets must be reachable from the page.
    const cssHref = await page
      .locator('link[rel="stylesheet"][href*="/_astro/"]')
      .first()
      .getAttribute("href");
    expect(cssHref, "expected at least one Astro stylesheet link").toBeTruthy();
  });
});
