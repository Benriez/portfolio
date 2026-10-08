// scripts/visual-audit-production-mobile.mjs
//
// Captures production mobile / tablet / desktop screenshots of the
// site header after the mobile navigation redesign.

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PRODUCTION = "https://benriez.github.io/portfolio/";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

const OUT_DIR = path.resolve("./tmp-visual-audit/mobile-header-production");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      ...(vp.name === "mobile-390" ? devices["Pixel 7"] : {}),
      ...(vp.name === "mobile-430" ? devices["Pixel 7"] : {}),
      ...(vp.name === "tablet-768" ? devices["iPad Mini"] : {}),
      ...(vp.name === "desktop-1440" ? devices["Desktop Chrome"] : {}),
    });
    const page = await context.newPage();
    await page.goto(`${PRODUCTION}?mode=hr`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const header = page.locator(".site-header");
    if (await header.count()) {
      const file = path.join(OUT_DIR, `${vp.name}-header.png`);
      await header.screenshot({ path: file });
      const box = await header.boundingBox();
      console.warn(`  ${vp.name} header: ${box?.width}x${box?.height} → ${file}`);
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
