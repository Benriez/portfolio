// scripts/measure-caps.mjs
// One-off: measure capability grid and its container
import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:4321/portfolio/?mode=hr", { waitUntil: "networkidle" });
  const out = await page.evaluate(() => {
    const grid = document.querySelector(".capability-grid");
    const container = document.querySelector("#capabilities .container");
    const section = document.querySelector("#capabilities");
    const r = grid?.getBoundingClientRect();
    const c = container?.getBoundingClientRect();
    const s = section?.getBoundingClientRect();
    const gridCs = grid ? getComputedStyle(grid) : null;
    return {
      grid: r && { x: r.x, w: r.width, cols: gridCs?.gridTemplateColumns },
      container: c && { x: c.x, w: c.width },
      section: s && { x: s.x, w: s.width },
    };
  });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}
main();
