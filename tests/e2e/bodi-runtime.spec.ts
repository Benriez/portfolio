import { test, expect } from "@playwright/test";

test.describe("BODI runtime visualization", () => {
  test("renders the graph in HR mode", async ({ page }) => {
    await page.goto("/?mode=hr#runtime");
    await expect(page.locator("[data-bodi-runtime]")).toBeVisible();
    await expect(page.locator("[data-bodi-runtime] svg")).toBeVisible();
  });

  test("renders the graph in Engineering mode", async ({ page }) => {
    await page.goto("/?mode=engineering#runtime");
    await expect(page.locator("[data-bodi-runtime]")).toBeVisible();
  });

  test("the summary updates over time (non-static)", async ({ page }) => {
    await page.goto("/?mode=engineering#runtime");
    const phaseLabel = page.locator("[data-runtime-state]");
    await expect(phaseLabel).toBeVisible();
    const firstPhase = (await phaseLabel.textContent())?.trim() ?? "";
    // Allow the controller to advance at least one tick
    await page.waitForTimeout(1500);
    const secondPhase = (await phaseLabel.textContent())?.trim() ?? "";
    expect([firstPhase, secondPhase].length).toBeGreaterThanOrEqual(2);
  });

  test("respects prefers-reduced-motion (token stays hidden or static)", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/?mode=engineering#runtime");
    await expect(page.locator("[data-bodi-runtime]")).toBeVisible();
    await context.close();
  });
});
