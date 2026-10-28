import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["./?mode=hr", "./?mode=engineering"];

for (const path of PAGES) {
  test(`axe-core smoke: ${path}`, async ({ page }) => {
    await page.goto(path);
    // The staged scroll experience fades content in; scan settled states
    // (hero staged in, then everything revealed at the page end), not a
    // mid-tween frame.
    await expect(page.locator("html")).toHaveAttribute("data-motion", /ready|off/, {
      timeout: 6_000,
    });
    await page.waitForTimeout(1_300);
    // Full default rule set — including colour contrast and WCAG 2.2
    // target-size — so the gate catches real regressions.
    const atTop = await new AxeBuilder({ page }).analyze();
    expect(
      atTop.violations,
      `axe violations: ${JSON.stringify(atTop.violations, null, 2)}`,
    ).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1_300);
    const atEnd = await new AxeBuilder({ page }).analyze();
    expect(
      atEnd.violations,
      `axe violations: ${JSON.stringify(atEnd.violations, null, 2)}`,
    ).toEqual([]);
  });
}
