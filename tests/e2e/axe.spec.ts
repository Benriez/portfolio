import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/?mode=hr", "/?mode=engineering"];

for (const path of PAGES) {
  test(`axe-core smoke: ${path}`, async ({ page }) => {
    await page.goto(path);
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(
      accessibilityScanResults.violations,
      `axe violations: ${JSON.stringify(accessibilityScanResults.violations, null, 2)}`,
    ).toEqual([]);
  });
}
