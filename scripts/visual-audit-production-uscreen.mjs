// scripts/visual-audit-production-uscreen.mjs
//
// Live acceptance check for the UScreen Selected Work entry against the
// deployed GitHub Pages site.
//
// Verifies: project set size, UScreen present, Odoo project absent,
// development status wording, link targets, release-truth wording and
// overflow / height balance at 1440 / 768 / 390 in both modes.

import { chromium } from "@playwright/test";

const URL = process.env.PORTFOLIO_URL ?? "https://benriez.github.io/portfolio/";
const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];
const MODES = ["hr", "engineering"];

const results = [];
const failures = [];

function check(label, ok, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

async function main() {
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const mode of MODES) {
      const page = await context.newPage();
      const tag = `${vp.name}/${mode}`;
      const response = await page.goto(`${URL}?mode=${mode}`, { waitUntil: "networkidle" });
      check(`${tag} live URL responds 200`, response?.status() === 200, String(response?.status()));

      const headings = await page.locator("#work .work-body h3").allTextContents();
      check(
        `${tag} exactly five Selected Work projects`,
        headings.length === 5,
        String(headings.length),
      );
      check(`${tag} UScreen present`, headings.includes("UScreen"), headings.join(" | "));
      check(`${tag} Odoo Add-on Suite absent`, !headings.includes("Odoo Add-on Suite"));

      const entry = page.locator("article", {
        has: page.getByRole("heading", { name: "UScreen", exact: true }),
      });
      check(`${tag} exactly one UScreen entry`, (await entry.count()) === 1);

      const meta = (await entry.locator(`.work-meta [data-view='${mode}']`).textContent()) ?? "";
      check(`${tag} status indicates development`, /Aktive Entwicklung/i.test(meta), meta.trim());

      if (mode === "engineering") {
        check(
          `${tag} release truth present`,
          /v0\.2\.0-preview\.3/.test(meta) && /v0\.3\.0-dev\.1/.test(meta),
          meta.trim(),
        );
        check(
          `${tag} development release not claimed as hardware accepted`,
          /v0\.3\.0-dev\.1 ohne Hardware-Abnahme/.test(meta),
          meta.trim(),
        );
        const bodyText = (await entry.textContent()) ?? "";
        check(
          `${tag} no "stable/production ready" claim`,
          !/stable release|production ready|fully hardware verified/i.test(bodyText),
        );
      }

      const links = await entry
        .locator(".case-link")
        .evaluateAll((els) =>
          els.map((a) => ({ text: a.textContent?.trim(), href: a.getAttribute("href") })),
        );
      check(
        `${tag} primary CTA is the project website`,
        links[0]?.href === "https://benriez.github.io/uscreen/",
        JSON.stringify(links),
      );
      check(
        `${tag} secondary CTA is the hardware-tested release`,
        links[1]?.href === "https://github.com/Benriez/uscreen/releases/tag/v0.2.0-preview.3",
        JSON.stringify(links),
      );

      const geometry = await page.evaluate(() => {
        const articles = Array.from(document.querySelectorAll("#work article"));
        const uscreen = articles.find(
          (a) => a.querySelector("h3")?.textContent?.trim() === "UScreen",
        );
        const overflowers = [];
        for (const el of uscreen?.querySelectorAll("*") ?? []) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)) {
            overflowers.push(el.tagName + "." + String(el.className).slice(0, 40));
          }
        }
        const stack = uscreen?.querySelector(".stack-line");
        return {
          docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          overflowers,
          stackOverflow: stack ? stack.scrollWidth > stack.clientWidth + 1 : null,
          uscreenHeight: Math.round(uscreen?.getBoundingClientRect().height ?? 0),
          heights: articles.map((a) => ({
            title: a.querySelector("h3")?.textContent?.trim(),
            height: Math.round(a.getBoundingClientRect().height),
          })),
        };
      });
      check(
        `${tag} no horizontal overflow`,
        geometry.docOverflow === 0,
        String(geometry.docOverflow),
      );
      check(
        `${tag} no overflowing elements`,
        geometry.overflowers.length === 0,
        geometry.overflowers.join(", "),
      );
      check(
        `${tag} stack line not overflowing`,
        geometry.stackOverflow === false,
        String(geometry.stackOverflow),
      );

      const maxHeight = Math.max(...geometry.heights.map((h) => h.height));
      check(
        `${tag} project height balanced vs. tallest entry`,
        geometry.uscreenHeight <= maxHeight * 1.25,
        `uscreen=${geometry.uscreenHeight} max=${maxHeight}`,
      );

      await page.close();
    }
    await context.close();
  }

  await browser.close();

  // Link reachability from the live page.
  for (const href of [
    "https://benriez.github.io/uscreen/",
    "https://github.com/Benriez/uscreen/releases/tag/v0.2.0-preview.3",
    "https://github.com/Benriez/uscreen/releases/tag/v0.3.0-dev.1",
  ]) {
    const res = await fetch(href, { redirect: "follow" });
    check(`link reachable: ${href}`, res.status === 200, String(res.status));
  }

  /* eslint-disable no-console */
  console.log(results.join("\n"));
  console.log("");
  console.log(
    failures.length === 0 ? "LIVE ACCEPTANCE: PASS" : `LIVE ACCEPTANCE: FAIL (${failures.length})`,
  );
  /* eslint-enable no-console */
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
