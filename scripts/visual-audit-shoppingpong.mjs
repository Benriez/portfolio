// scripts/visual-audit-shoppingpong.mjs
//
// Focused visual review of the Shopping-Pong Selected Work entry:
//   * screenshots of the full entry at 390 / 768 / 1440 in both modes
//   * horizontal-overflow probe
//   * external-link visibility / target / duplicate-rendering probe
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

const OUT_DIR = path.resolve("./tmp-visual-audit/shoppingpong");
fs.mkdirSync(OUT_DIR, { recursive: true });

const EXPECTED_LINKS = [
  { label: "Website", href: "https://shoppingpong.shop/" },
  {
    label: "Presseartikel",
    href: "https://merkurist.de/mainz/shoppingpong-tischtennis-spielen-jetzt-auch-bei-schlechtem-wetter-in-mainz-mombach_kzXI",
  },
];

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
        has: page.getByRole("heading", { name: "Shopping-Pong" }),
      });
      await entry.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      const file = path.join(OUT_DIR, `${vp.name}-${mode}.png`);
      await entry.screenshot({ path: file });

      const metrics = await page.evaluate(() => {
        const articles = Array.from(document.querySelectorAll("#work article"));
        const shoppingPong = articles.find(
          (a) => a.querySelector("h3")?.textContent?.trim() === "Shopping-Pong",
        );
        const overflowers = [];
        for (const el of shoppingPong?.querySelectorAll("*") ?? []) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)) {
            overflowers.push({
              tag: el.tagName,
              cls: String(el.className).slice(0, 60),
              left: Math.round(r.left),
              right: Math.round(r.right),
            });
          }
        }
        const links = Array.from(shoppingPong?.querySelectorAll(".case-link") ?? []).map((a) => {
          const r = a.getBoundingClientRect();
          return {
            text: a.textContent?.trim(),
            href: a.getAttribute("href"),
            target: a.getAttribute("target"),
            rel: a.getAttribute("rel"),
            width: Math.round(r.width),
            height: Math.round(r.height),
            visible: r.width > 0 && r.height > 0,
          };
        });
        const linkRow = shoppingPong?.querySelector(".case-links");
        return {
          docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          overflowers,
          links,
          linkRowHeight: Math.round(linkRow?.getBoundingClientRect().height ?? 0),
          index: shoppingPong?.querySelector(".work-index")?.textContent?.trim(),
          meta:
            shoppingPong?.querySelector(".work-meta")?.textContent?.replace(/\s+/g, " ").trim() ??
            "",
          shoppingPongHeight: Math.round(shoppingPong?.getBoundingClientRect().height ?? 0),
          heights: articles.map((a) => ({
            title: a.querySelector("h3")?.textContent?.trim(),
            height: Math.round(a.getBoundingClientRect().height),
          })),
        };
      });

      report.push({ viewport: vp.name, mode, ...metrics });
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));

  let failures = 0;
  for (const r of report) {
    const tag = `${r.viewport}/${r.mode}`;
    const lines = [];
    const assert = (label, ok, detail = "") => {
      if (!ok) failures += 1;
      lines.push(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
    };
    assert("no horizontal overflow", r.docOverflow === 0, String(r.docOverflow));
    assert("no overflowing elements", r.overflowers.length === 0, JSON.stringify(r.overflowers));
    assert("exactly two external links", r.links.length === 2, String(r.links.length));
    assert(
      "link targets correct",
      EXPECTED_LINKS.every((e, i) => r.links[i]?.href === e.href),
      JSON.stringify(r.links.map((l) => l.href)),
    );
    assert(
      "link labels correct",
      EXPECTED_LINKS.every((e, i) => r.links[i]?.text === e.label),
      JSON.stringify(r.links.map((l) => l.text)),
    );
    assert(
      "both links visible",
      r.links.every((l) => l.visible),
    );
    assert(
      "no duplicated link rendering",
      new Set(r.links.map((l) => l.href)).size === r.links.length,
    );
    assert(
      "no target=_blank without rel protection",
      r.links.every((l) => l.target !== "_blank" || /noopener/.test(l.rel ?? "")),
    );
    assert(
      "link row stays compact (no oversized CTA)",
      r.linkRowHeight > 0 && r.linkRowHeight <= 60,
      `${r.linkRowHeight}px`,
    );
    assert("period unchanged", r.index === "2025 – heute", r.index);
    const maxHeight = Math.max(...r.heights.map((h) => h.height));
    assert(
      "project height balanced",
      r.shoppingPongHeight <= maxHeight * 1.25,
      `shoppingpong=${r.shoppingPongHeight} max=${maxHeight}`,
    );

    /* eslint-disable no-console */
    console.log(`${tag}`);
    console.log(lines.join("\n"));
    console.log(`   heights: ${r.heights.map((h) => `${h.title}=${h.height}`).join(", ")}`);
    console.log(`   links: ${JSON.stringify(r.links)}`);
    /* eslint-enable no-console */
  }

  /* eslint-disable no-console */
  console.log("");
  console.log(
    failures === 0
      ? "SHOPPING-PONG VISUAL AUDIT: PASS"
      : `SHOPPING-PONG VISUAL AUDIT: FAIL (${failures})`,
  );
  /* eslint-enable no-console */
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
