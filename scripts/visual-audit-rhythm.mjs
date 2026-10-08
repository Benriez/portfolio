// scripts/visual-audit-rhythm.mjs
//
// Captures baseline screenshots focused on the section rhythm of the
// production portfolio at 1440 / 768 / 390 in HR mode.

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PORTFOLIO = "http://127.0.0.1:4321/portfolio/";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

const OUT_DIR = path.resolve("./tmp-visual-audit/rhythm");
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
    const page = await context.newPage();
    await page.goto(`${PORTFOLIO}?mode=hr`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const file = path.join(OUT_DIR, `${vp.name}-hr.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.warn(`  ${vp.name} → ${file}`);

    // Also capture each major section as a focused element screenshot
    const sections = ["#top", "#work", "#experience", "#capabilities", "#about", "#contact"];
    for (const sel of sections) {
      const el = page.locator(sel);
      if (await el.count()) {
        const sectionFile = path.join(OUT_DIR, `${vp.name}-${sel.replace("#", "")}-hr.png`);
        await el.screenshot({ path: sectionFile });
        console.warn(`    ${sel} → ${sectionFile}`);
      }
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
