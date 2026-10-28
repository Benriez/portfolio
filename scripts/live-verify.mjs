// scripts/live-verify.mjs
//
// Live verification of the deployed portfolio.
//
// Usage: node scripts/live-verify.mjs [baseUrl]
//   default: https://benriez.github.io/portfolio/

import { chromium } from "@playwright/test";

const BASE = (process.argv[2] ?? "https://benriez.github.io/portfolio/").replace(/\/?$/, "/");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
];

const MODES = ["hr", "engineering"];

const EXPECTED_PROJECTS = [
  "BODI / agent-garden",
  "Fahrschule360",
  "Shopping-Pong",
  "Production Web Platform Migration",
  "UScreen",
];

const EXTERNAL_LINKS = [
  "https://shoppingpong.shop/",
  "https://merkurist.de/mainz/shoppingpong-tischtennis-spielen-jetzt-auch-bei-schlechtem-wetter-in-mainz-mombach_kzXI",
  "https://benriez.github.io/uscreen/",
  "https://github.com/Benriez/uscreen/releases/tag/v0.2.0-preview.3",
  "https://github.com/Benriez",
];

let failures = 0;
function check(label, ok, detail = "") {
  if (!ok) failures += 1;
  console.warn(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const browser = await chromium.launch();
  const consoleErrors = [];
  const failedRequests = [];

  for (const vp of VIEWPORTS) {
    for (const mode of MODES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(`${vp.name}/${mode}: ${m.text()}`);
      });
      page.on("response", (r) => {
        if (r.status() >= 400) failedRequests.push(`${vp.name}/${mode}: ${r.status()} ${r.url()}`);
      });

      const url = `${BASE}?mode=${mode}`;
      const res = await page.goto(url, { waitUntil: "networkidle" });
      console.warn(`\n== ${vp.name} x ${vp.height} / ${mode} ==`);
      check("page responds 200", res?.status() === 200, String(res?.status()));

      // --- primary role + specialization ---
      // `textContent` (not `innerText`): the design uppercases these
      // strings via CSS text-transform, which `innerText` would report.
      const role = await page.locator(".hero .role").textContent();
      check("primary role", role?.trim() === "Software & AI Systems Engineer", role?.trim());
      const spec = (await page.locator(".hero .role-spec").textContent()) ?? "";
      check(
        "specialization line",
        spec.includes("Full-Stack") &&
          spec.includes("Agentic AI") &&
          spec.includes("Production Engineering"),
        spec.replace(/\s+/g, " "),
      );
      const lead = await page.locator(".hero .heroLead").textContent();
      check(
        "hero lead covers full chain",
        [
          "Produktanforderung",
          "Architektur",
          "Implementierung",
          "Production",
          "Reliability",
          "AI-System",
        ].every((c) => lead.includes(c)),
      );

      // --- project set ---
      const headings = await page.locator("#work .work-body h3").allInnerTexts();
      check("project count = 5", headings.length === 5, String(headings.length));
      check(
        "project set + order",
        JSON.stringify(headings) === JSON.stringify(EXPECTED_PROJECTS),
        headings.join(" | "),
      );
      const workText = await page.locator("#work").innerText();
      check("no Steuerkompass in Selected Work", !/steuerkompass/i.test(workText));
      check("no Odoo project in Selected Work", !/odoo/i.test(workText));

      // --- working approach ---
      const approach = await page.locator("#about .approach-list").innerText();
      check(
        "AI-assisted verification paragraph visible",
        approach.includes("AI-gestützte Entwicklung") &&
          approach.includes("Typechecks") &&
          approach.includes("E2E-Prüfungen") &&
          approach.includes("Runtime-Evidence") &&
          approach.includes("Hardware-Abnahmen"),
      );
      check(
        "production ownership visible",
        approach.includes("Production Ownership") &&
          approach.includes("Root-Cause Analysis") &&
          approach.includes("Recovery Thinking"),
      );
      const aboutHeading = await page.locator("#about h2").innerText();
      check(
        "working approach headline unchanged",
        aboutHeading === "Systemisch denken, präzise bauen, zuverlässig betreiben.",
        aboutHeading,
      );
      const workHeading = await page.locator("#work h2").innerText();
      check(
        "selected work headline unchanged",
        workHeading === "Systeme, die Produkt, Betrieb und technische Tiefe verbinden.",
        workHeading,
      );

      // --- navigation ---
      const navLabels = await page
        .locator(".nav-links a")
        .evaluateAll((els) => els.map((e) => (e.textContent ?? "").trim()));
      check(
        "nav destinations",
        JSON.stringify(navLabels) ===
          JSON.stringify([
            "Projekte",
            "Berufserfahrung",
            "Kompetenzen",
            "Arbeitsweise",
            "Kontakt",
            "GitHub",
          ]),
        navLabels.join(", "),
      );
      const bodyMode = await page.locator("body").getAttribute("data-mode");
      check("mode applied", bodyMode === mode, String(bodyMode));

      // --- links ---
      const hrefs = await page
        .locator("a")
        .evaluateAll((els) => els.map((e) => e.getAttribute("href")).filter(Boolean));
      for (const link of EXTERNAL_LINKS) {
        check(`link present: ${link}`, hrefs.includes(link));
      }
      const mailto = hrefs.filter((h) => h.startsWith("mailto:"));
      check("contact mailto present", mailto.length > 0, mailto.join(", "));
      const linkedin = hrefs.filter((h) => h.includes("linkedin.com"));
      check("contact linkedin present", linkedin.length > 0);

      // --- overflow ---
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      check("no horizontal overflow", overflow <= 1, `${overflow}px`);

      // --- section presence ---
      for (const id of ["work", "experience", "capabilities", "about"]) {
        check(`section #${id} present`, (await page.locator(`#${id}`).count()) === 1);
      }

      await context.close();
    }
  }

  // --- mode switch interaction ---
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    console.warn("\n== mode switch ==");
    await page.goto(`${BASE}?mode=hr`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Engineering", exact: true }).click();
    await page.waitForFunction(() => document.body.dataset["mode"] === "engineering");
    check("mode switch works", true);
    await context.close();
  }

  // --- first-party request check ---
  console.warn("\n== network ==");
  const firstParty = failedRequests.filter((r) => r.includes("benriez.github.io/portfolio"));
  check("no first-party 404s", firstParty.length === 0, firstParty.join(" | "));
  const external = failedRequests.filter((r) => !r.includes("benriez.github.io/portfolio"));
  if (external.length) console.warn(`  note: external failures: ${external.join(" | ")}`);
  if (consoleErrors.length) console.warn(`  note: console errors: ${consoleErrors.join(" | ")}`);

  await browser.close();
  console.warn(`\n${failures === 0 ? "LIVE VERIFY: PASS" : `LIVE VERIFY: FAIL (${failures})`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
