// scripts/visual-audit-flagship.mjs
//
// Captures a focused screenshot of the #flagship section for direct visual
// parity comparison between the portfolio and the OpenDesign reference.

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const TARGETS = [
  {
    label: "portfolio",
    url: "http://127.0.0.1:4321/portfolio/",
  },
  {
    label: "opendesign",
    url: "http://127.0.0.1:9876/",
  },
];

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "tablet-768", width: 768, height: 1024 },
];

const MODES = [
  { name: "hr", query: "?mode=hr" },
  { name: "engineering", query: "?mode=engineering" },
];

const OUT_DIR = path.resolve("./tmp-visual-audit/flagship");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  for (const target of TARGETS) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        ...(vp.name === "tablet-768" ? devices["iPad Mini"] : {}),
        ...(vp.name === "desktop-1440" ? devices["Desktop Chrome"] : {}),
      });
      for (const mode of MODES) {
        const page = await context.newPage();
        await page.goto(`${target.url}${mode.query}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);
        const selector = target.label === "portfolio" ? "#flagship" : ".flagship-section";
        const el = page.locator(selector);
        if (await el.count()) {
          const file = path.join(OUT_DIR, `${target.label}-${vp.name}-${mode.name}.png`);
          await el.screenshot({ path: file });
          console.log(`  saved ${file}`);
        } else {
          console.warn(`  ${selector} not found on ${target.label}`);
        }
        await page.close();
      }
      await context.close();
    }
  }
  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});