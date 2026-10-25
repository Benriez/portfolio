// scripts/visual-audit-uscreen.mjs
//
// Focused visual review of the UScreen Selected Work entry:
//   * screenshots of the full entry at 390 / 768 / 1440 in both modes
//   * horizontal-overflow probe
//   * stack-line / meta-line overflow probe
//   * project height compared against the other Selected Work entries
//
// Requires the preview server on 127.0.0.1:4321.

import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

const MODES = ["hr", "engineering"];

const OUT_DIR = path.resolve("./tmp-visual-audit/uscreen");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const report = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const mode of MODES) {
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:4321/portfolio/?mode=${mode}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(400);

      const entry = page.locator("article", {
        has: page.getByRole("heading", { name: "UScreen", exact: true }),
      });
      await entry.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      const file = path.join(OUT_DIR, `${vp.name}-${mode}.png`);
      await entry.screenshot({ path: file });

      const metrics = await page.evaluate(() => {
        const articles = Array.from(document.querySelectorAll("#work article"));
        const uscreen = articles.find(
          (a) => a.querySelector("h3")?.textContent?.trim() === "UScreen",
        );
        const body = uscreen?.querySelector(".work-body");
        const rect = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { width: Math.round(r.width), height: Math.round(r.height) };
        };
        const overflowers = [];
        if (body) {
          for (const el of body.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)) {
              overflowers.push({
                tag: el.tagName,
                cls: el.className?.toString().slice(0, 60),
                left: Math.round(r.left),
                right: Math.round(r.right),
              });
            }
          }
        }
        const docOverflow =
          document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const stackLine = uscreen?.querySelector(".stack-line");
        const metaLine = uscreen?.querySelector(".work-meta");
        const visible = (el) => {
          if (!el) return null;
          const style = getComputedStyle(el);
          if (style.display === "none") return null;
          return el.textContent?.replace(/\s+/g, " ").trim();
        };
        return {
          docOverflow,
          overflowers,
          heights: articles.map((a) => ({
            title: a.querySelector("h3")?.textContent?.trim(),
            height: Math.round(a.getBoundingClientRect().height),
          })),
          uscreenHeight: Math.round(uscreen?.getBoundingClientRect().height ?? 0),
          stackRect: rect(stackLine),
          stackText: visible(stackLine),
          stackOverflow: stackLine ? stackLine.scrollWidth > stackLine.clientWidth + 1 : null,
          metaRect: rect(metaLine),
          metaText: visible(metaLine),
          metaOverflow: metaLine ? metaLine.scrollWidth > metaLine.clientWidth + 1 : null,
          links: Array.from(uscreen?.querySelectorAll(".case-link") ?? []).map((a) => ({
            text: a.textContent?.trim(),
            href: a.getAttribute("href"),
          })),
          subText: visible(uscreen?.querySelector(".work-sub")),
        };
      });

      report.push({ viewport: vp.name, mode, ...metrics });
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  for (const r of report) {
    /* eslint-disable no-console */
    console.log(
      `${r.viewport}/${r.mode}: overflow=${r.docOverflow} height=${r.uscreenHeight} ` +
        `stackOverflow=${r.stackOverflow} metaOverflow=${r.metaOverflow} ` +
        `overflowers=${r.overflowers.length}`,
    );
    if (r.overflowers.length > 0) console.log("  ", JSON.stringify(r.overflowers));
    console.log("   heights:", r.heights.map((h) => `${h.title}=${h.height}`).join(", "));
    console.log("   stack:", r.stackText);
    console.log("   meta:", r.metaText);
    console.log("   sub:", r.subText);
    console.log("   links:", JSON.stringify(r.links));
    /* eslint-enable no-console */
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
