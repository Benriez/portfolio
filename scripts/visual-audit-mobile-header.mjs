// scripts/visual-audit-mobile-header.mjs
//
// Captures focused mobile header screenshots at the target viewports
// to evaluate the compactness and rhythm of the navigation.

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PORTFOLIO = "http://127.0.0.1:4321/portfolio/";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

const OUT_DIR = path.resolve("./tmp-visual-audit/mobile-header");
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
    await page.goto(`${PORTFOLIO}?mode=hr`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    // Capture the header element specifically
    const header = page.locator(".site-header");
    if (await header.count()) {
      const headerBox = await header.boundingBox();
      const file = path.join(OUT_DIR, `${vp.name}-header.png`);
      await header.screenshot({ path: file });
      console.warn(`  ${vp.name} header: ${headerBox?.width}x${headerBox?.height} → ${file}`);
    }

    // Capture top of viewport
    const topFile = path.join(OUT_DIR, `${vp.name}-top.png`);
    await page.screenshot({ path: topFile, clip: { x: 0, y: 0, width: vp.width, height: 300 } });
    console.warn(`  ${vp.name} top → ${topFile}`);

    await context.close();
  }
  await browser.close();
  console.warn("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
