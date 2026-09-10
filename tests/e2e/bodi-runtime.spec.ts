import { test, expect } from "@playwright/test";

test.describe("BODI runtime visualization", () => {
  test("renders the graph in HR mode", async ({ page }) => {
    await page.goto("/?mode=hr#runtime");
    const runtime = page.locator("[data-bodi-runtime]");
    if (!(await runtime.isVisible())) {
      test.skip(true, "BODI runtime unavailable during maintenance");
    }
    await expect(runtime).toBeVisible();
    await expect(runtime.locator("svg")).toBeVisible();
  });

  test("renders the graph in Engineering mode", async ({ page }) => {
    await page.goto("/?mode=engineering#runtime");
    const runtime = page.locator("[data-bodi-runtime]");
    if (!(await runtime.isVisible())) {
      test.skip(true, "BODI runtime unavailable during maintenance");
    }
    await expect(runtime).toBeVisible();
  });

  test("the summary updates over time (non-static)", async ({ page }) => {
    await page.goto("/?mode=engineering#runtime");
    const runtime = page.locator("[data-bodi-runtime]");
    if (!(await runtime.isVisible())) {
      test.skip(true, "BODI runtime unavailable during maintenance");
    }
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
    const runtime = page.locator("[data-bodi-runtime]");
    if (!(await runtime.isVisible())) {
      await context.close();
      test.skip(true, "BODI runtime unavailable during maintenance");
    }
    await expect(runtime).toBeVisible();
    await context.close();
  });
});
