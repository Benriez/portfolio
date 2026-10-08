// scripts/visual-audit-fahrschule360.mjs
//
// Captures focused screenshots of the Fahrschule360 project card
// after the self-hosted infrastructure copy update.

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PORTFOLIO = "http://127.0.0.1:4321/portfolio/";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];
const MODES = [
  { name: "hr", query: "?mode=hr" },
  { name: "engineering", query: "?mode=engineering" },
];

const OUT_DIR = path.resolve("./tmp-visual-audit/fahrschule360");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      ...(vp.name === "mobile-390" ? devices["Pixel 7"] : {}),
      ...(vp.name === "desktop-1440" ? devices["Desktop Chrome"] : {}),
    });
    for (const mode of MODES) {
      const page = await context.newPage();
      await page.goto(`${PORTFOLIO}${mode.query}#work`, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const article = page.locator("article", {
        has: page.getByRole("heading", { name: "Fahrschule360" }),
      });
      if (await article.count()) {
        const file = path.join(OUT_DIR, `${vp.name}-${mode.name}.png`);
        await article.screenshot({ path: file });
        const box = await article.boundingBox();
        console.warn(`  ${vp.name}/${mode.name}: ${box?.width}x${box?.height} → ${file}`);
      }
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  console.warn("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
