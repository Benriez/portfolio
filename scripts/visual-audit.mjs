// scripts/visual-audit.mjs
//
// One-shot visual audit. Loads:
//   reference at http://127.0.0.1:8001/   (OpenDesign)
//   mine      at http://127.0.0.1:4321/portfolio/?mode=...
//
// Captures:
//   - full-page screenshots for both, at 1440/768/390, both modes
//   - layout / typography / color measurements for shared concepts

import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const REFERENCE = "http://127.0.0.1:8001/";
const MINE_BASE = "http://127.0.0.1:4321/portfolio/";
const OUT_DIR = "/tmp/parity-screens";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
const MODES = ["hr", "engineering"];

async function shoot(page, url, label, viewportName) {
  const file = `${OUT_DIR}/${label}-${viewportName}.png`;
  await page.goto(url, { waitUntil: "networkidle" });
  // Allow BODI runtime to settle a frame
  await page.waitForTimeout(500);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function snapshotPage(page) {
  return await page.evaluate(() => {
    const out = {};
    out.bodyBg = getComputedStyle(document.body).backgroundColor;
    out.bodyFont = getComputedStyle(document.body).fontFamily;
    out.bodySize = getComputedStyle(document.body).fontSize;
    out.bodyLeading = getComputedStyle(document.body).lineHeight;
    const root = getComputedStyle(document.documentElement);
    const tokens = [
      "--bg",
      "--surface",
      "--fg",
      "--fg-soft",
      "--muted",
      "--accent",
      "--hairline",
      "--rule",
      "--font-display",
      "--font-body",
      "--font-mono",
    ];
    out.tokens = {};
    for (const t of tokens) out.tokens[t] = root.getPropertyValue(t).trim();
    const header = document.querySelector(".site-header") || document.querySelector("header");
    if (header) {
      const r = header.getBoundingClientRect();
      const cs = getComputedStyle(header);
      out.header = {
        height: r.height,
        bg: cs.backgroundColor,
        border: cs.borderBottom,
        backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
      };
    }
    const hero =
      document.querySelector(".hero") ||
      document.querySelector("[data-od-id=hero]") ||
      document.querySelector("#top");
    if (hero) {
      const h1 = hero.querySelector("h1");
      const r = hero.getBoundingClientRect();
      const h1cs = h1 ? getComputedStyle(h1) : null;
      out.hero = {
        height: r.height,
        h1: h1cs
          ? {
              size: h1cs.fontSize,
              weight: h1cs.fontWeight,
              tracking: h1cs.letterSpacing,
              leading: h1cs.lineHeight,
              font: h1cs.fontFamily,
            }
          : null,
        h1Text: h1 ? h1.textContent.trim() : null,
      };
    }
    out.sectionH2s = Array.from(document.querySelectorAll("section h2")).map((h) => {
      const cs = getComputedStyle(h);
      return { text: h.textContent.trim().slice(0, 64), size: cs.fontSize, weight: cs.fontWeight };
    });
    const caps = document.querySelector(".capability-grid");
    out.capabilities = {
      hasGrid: !!caps,
      gridCols: caps ? getComputedStyle(caps).gridTemplateColumns : null,
    };
    const ts = document.querySelector(".tech-stack");
    out.techStack = { hasDefinition: !!ts };
    const rt =
      document.querySelector("[data-runtime]") ||
      document.querySelector(".rt-map") ||
      document.querySelector("[data-bodi-root]");
    out.runtime = { found: !!rt };
    if (rt) {
      out.runtime.tagName = rt.tagName.toLowerCase();
      out.runtime.layout = getComputedStyle(rt).display;
    }
    return out;
  });
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const report = {};

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    for (const mode of MODES) {
      report[`reference-${vp.name}-${mode}`] = await shoot(
        page,
        `${REFERENCE}?mode=${mode}`,
        `reference-${vp.name}-${mode === "hr" ? "hr" : "eng"}`,
        vp.name,
      );
      report[`mine-${vp.name}-${mode}`] = await shoot(
        page,
        `${MINE_BASE}?mode=${mode}`,
        `mine-${vp.name}-${mode === "hr" ? "hr" : "eng"}`,
        vp.name,
      );
    }

    // Detailed measurements of mine in HR at desktop, vs reference
    if (vp.name === "desktop") {
      await page.goto(`${REFERENCE}?mode=hr`, { waitUntil: "networkidle" });
      report.measurementsReferenceHR = await snapshotPage(page);

      await page.goto(`${MINE_BASE}?mode=hr`, { waitUntil: "networkidle" });
      report.measurementsMineHR = await snapshotPage(page);

      await page.goto(`${REFERENCE}?mode=engineering`, { waitUntil: "networkidle" });
      report.measurementsReferenceEng = await snapshotPage(page);

      await page.goto(`${MINE_BASE}?mode=engineering`, { waitUntil: "networkidle" });
      report.measurementsMineEng = await snapshotPage(page);
    }

    await ctx.close();
  }

  await browser.close();
  await fs.writeFile(`${OUT_DIR}/report.json`, JSON.stringify(report, null, 2));
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, report: `${OUT_DIR}/report.json` }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
