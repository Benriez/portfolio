// scripts/visual-audit-portfolio.mjs
//
// Captures full-page screenshots of the running preview at 390, 768,
// 1440 viewports in both HR and Engineering modes. Used as the visual
// regression baseline for the portfolio.

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

const MODES = [
  { name: "hr", query: "?mode=hr" },
  { name: "engineering", query: "?mode=engineering" },
];

const OUT_DIR = path.resolve("./tmp-visual-audit");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      ...(vp.name === "mobile-390" ? devices["Pixel 7"] : {}),
      ...(vp.name === "tablet-768" ? devices["iPad Mini"] : {}),
      ...(vp.name === "desktop-1440" ? devices["Desktop Chrome"] : {}),
    });
    for (const mode of MODES) {
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:4321/portfolio/${mode.query}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(800);
      const file = path.join(OUT_DIR, `${vp.name}-${mode.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  saved ${file}`);
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
