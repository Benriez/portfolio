// scripts/visual-audit-bodi-flagship.mjs
//
// Captures focused screenshots of the redesigned BODI flagship at
// desktop / tablet / mobile in both HR and Engineering modes.

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PORTFOLIO = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4321/portfolio/";

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
];

const MODES = [
  { name: "hr", query: "?mode=hr" },
  { name: "engineering", query: "?mode=engineering" },
];

const OUT_DIR = path.resolve("./tmp-visual-audit/flagship-redesign");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      ...(vp.name === "mobile-390" ? devices["Pixel 7"] : {}),
      ...(vp.name === "tablet-768" ? devices["iPad Mini"] : {}),
      ...(vp.name === "desktop-1440" ? devices["Desktop Chrome"] : {}),
      viewport: { width: vp.width, height: vp.height },
    });
    for (const mode of MODES) {
      const page = await context.newPage();
      await page.goto(`${PORTFOLIO}${mode.query}#flagship`, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const el = page.locator("#flagship");
      const box = await el.boundingBox();
      const file = path.join(OUT_DIR, `${vp.name}-${mode.name}.png`);
      await el.screenshot({ path: file, style: "header { visibility: hidden !important; }" });
      await page.locator(".bodi-viz").screenshot({
        path: path.join(OUT_DIR, `${vp.name}-${mode.name}-diagram.png`),
        style: "header { visibility: hidden !important; }",
      });
      console.warn(`  ${vp.name}/${mode.name}: ${box?.width}x${box?.height} → ${file}`);
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
