// scripts/positioning-audit.mjs
//
// Responsive positioning audit for the hero + working-approach update.
//
// Captures full-page screenshots and measures the hero surface at
// 390 / 768 / 1440 in HR and Engineering mode:
//   - horizontal page overflow
//   - hero title / role / specialization-line boxes vs. their container
//   - project count and card heights
//   - working-approach paragraph count
//
// Usage: node scripts/positioning-audit.mjs [baseUrl]

import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:4321/portfolio/";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844, device: devices["Pixel 7"] },
  { name: "tablet-768", width: 768, height: 1024, device: devices["iPad Mini"] },
  { name: "desktop-1440", width: 1440, height: 1000, device: devices["Desktop Chrome"] },
];

const MODES = ["hr", "engineering"];

const OUT_DIR = path.resolve("./tmp-visual-audit/positioning");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const report = [];

  for (const vp of VIEWPORTS) {
    for (const mode of MODES) {
      const context = await browser.newContext({
        ...vp.device,
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      await page.goto(`${BASE}?mode=${mode}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const box = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
            height: Math.round(r.height),
            lines: Math.round(r.height / parseFloat(getComputedStyle(el).lineHeight || r.height)),
            text: (el.textContent ?? "").trim().slice(0, 80),
          };
        };
        const cards = [...document.querySelectorAll("#work .work-item")].map((el) => {
          const r = el.getBoundingClientRect();
          return {
            title: el.querySelector("h3")?.textContent?.trim() ?? "?",
            height: Math.round(r.height),
          };
        });
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          overflow: doc.scrollWidth - doc.clientWidth,
          title: box(".hero h1"),
          role: box(".hero .role"),
          spec: box(".hero .role-spec"),
          lead: box(".hero .heroLead"),
          stack: box(".hero .hero-stack"),
          stackItems: [...document.querySelectorAll(".hero .hero-stack span")].map((s) => {
            const r = s.getBoundingClientRect();
            return { text: s.textContent.trim(), top: Math.round(r.top) };
          }),
          approachParagraphs: document.querySelectorAll("#about .approach-list p").length,
          approachText: [...document.querySelectorAll("#about .approach-list p")].map((p) =>
            p.textContent.trim(),
          ),
          projectCount: cards.length,
          cards,
        };
      });

      await page.screenshot({
        path: path.join(OUT_DIR, `${vp.name}-${mode}.png`),
        fullPage: true,
      });

      report.push({ viewport: vp.name, mode, ...metrics });
      await context.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2), "utf8");

  for (const r of report) {
    console.warn(
      `\n== ${r.viewport} / ${r.mode} ==\n` +
        `  overflow            : ${r.overflow}px\n` +
        `  h1 lines            : ${r.title?.lines} (${r.title?.width}px)\n` +
        `  role                : ${r.role?.text}\n` +
        `  spec                : ${r.spec?.text} (${r.spec?.width}px, ${r.spec?.height}px)\n` +
        `  lead lines          : ${r.lead?.lines}\n` +
        `  stack rows          : ${new Set(r.stackItems.map((s) => s.top)).size}\n` +
        `  approach paragraphs : ${r.approachParagraphs}\n` +
        `  projects            : ${r.projectCount}\n` +
        `  card heights        : ${r.cards.map((c) => `${c.title}=${c.height}`).join(", ")}`,
    );
  }
  console.warn(`\nscreenshots + report in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
