// scripts/content-audit.mjs
//
// Forensically extract content text from the OpenDesign reference HTML
// and compare against the rendered Astro portfolio. Used during P3 to
// verify content parity, not just layout parity.

import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";

const REFERENCE = "http://127.0.0.1:8001/";
const MINE_HR = "http://127.0.0.1:4321/portfolio/?mode=hr";
const MINE_ENG = "http://127.0.0.1:4321/portfolio/?mode=engineering";

async function extractSections(page) {
  return await page.evaluate(() => {
    const out = {};
    const sel = (s) => document.querySelector(s);
    const selAll = (s) => Array.from(document.querySelectorAll(s));

    // Hero
    const hero = sel(".hero");
    if (hero) {
      out.hero = {
        eyebrow: hero.querySelector(".eyebrow")?.textContent?.trim() ?? null,
        h1: hero.querySelector("h1")?.textContent?.trim() ?? null,
        role: hero.querySelector(".role")?.textContent?.trim() ?? null,
        lead: hero.querySelector(".hero-lead")?.textContent?.trim() ?? null,
        stack: selAll(".hero-stack span").map((e) => e.textContent.trim()),
        panel: selAll(".hero-panel > div").map((row) => ({
          k: row.querySelector(".panel-k")?.textContent?.trim() ?? null,
          v: row.querySelector(".panel-v")?.textContent?.trim() ?? null,
        })),
      };
    }

    // Projects
    out.projects = selAll(".work-item").map((item) => {
      const index = item.querySelector(".work-index")?.textContent?.trim() ?? null;
      const title = item.querySelector("h3")?.textContent?.trim() ?? null;
      const sub = item.querySelector(".work-sub")?.textContent?.trim() ?? null;
      const lead =
        Array.from(item.querySelectorAll(".work-lead"))
          .map((e) => e.textContent?.trim() ?? "")
          .find((t) => t.length > 0) ?? null;
      const points = Array.from(item.querySelectorAll(".work-points li")).map(
        (li) => li.textContent?.trim() ?? "",
      );
      const stack = item.querySelector(".stack-line")?.textContent?.trim() ?? null;
      return { index, title, sub, lead, points, stack };
    });

    // Experience
    out.experience = selAll(".career-item").map((item) => ({
      time: item.querySelector("time")?.textContent?.trim() ?? null,
      role: item.querySelector("h3")?.textContent?.trim() ?? null,
      employer: item.querySelector(".career-employer")?.textContent?.trim() ?? null,
      highlights: Array.from(item.querySelectorAll(".career-bullets li")).map(
        (li) => li.textContent?.trim() ?? "",
      ),
      subrole: item.querySelector(".subrole h4")?.textContent?.trim() ?? null,
    }));

    // Education
    out.education = selAll(".education-list > div").map((entry) => ({
      title: entry.querySelector("h3")?.textContent?.trim() ?? null,
      institution: entry.querySelector("p")?.textContent?.trim() ?? null,
      periods: Array.from(entry.querySelectorAll("p"))
        .map((p) => p.textContent?.trim() ?? "")
        .filter((t) => t.length > 0),
    }));

    // Capabilities
    out.capabilities = selAll(".capability").map((card) => ({
      no: card.querySelector(".capability-no")?.textContent?.trim() ?? null,
      heading: card.querySelector("h3")?.textContent?.trim() ?? null,
      body: card.querySelector(".capability-body")?.textContent?.trim() ?? null,
    }));

    // Tech stack
    out.techStack = selAll(".tech-stack-list > div").map((row) => ({
      label: row.querySelector("strong")?.textContent?.trim() ?? null,
      items: row.querySelector(".tech-stack-items")?.textContent?.trim() ?? null,
    }));

    return out;
  });
}

function compare(a, b, path = "") {
  if (typeof a !== typeof b) {
    return [`${path}: type mismatch (${typeof a} vs ${typeof b})`];
  }
  if (a === null || b === null) {
    if (a !== b) return [`${path}: ${a} vs ${b}`];
    return [];
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return [`${path}: array vs non-array`];
    if (a.length !== b.length) {
      return [`${path}: array length ${a.length} vs ${b.length}`];
    }
    const out = [];
    for (let i = 0; i < a.length; i += 1) {
      out.push(...compare(a[i], b[i], `${path}[${i}]`));
    }
    return out;
  }
  if (typeof a === "object") {
    const out = [];
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      out.push(...compare(a[k], b[k], `${path}.${k}`));
    }
    return out;
  }
  if (a !== b) {
    return [`${path}: ${JSON.stringify(a).slice(0, 80)} vs ${JSON.stringify(b).slice(0, 80)}`];
  }
  return [];
}

async function main() {
  const referenceHtml = await readFile(
    "/Users/benny/Code/Portfolio/opendesign/application-site/index.html",
    "utf8",
  );
  void referenceHtml;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(REFERENCE, { waitUntil: "networkidle" });
  const ref = await extractSections(page);
  await ctx.close();

  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page2 = await ctx2.newPage();
  await page2.goto(MINE_HR, { waitUntil: "networkidle" });
  const mineHR = await extractSections(page2);
  await ctx2.close();

  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page3 = await ctx3.newPage();
  await page3.goto(MINE_ENG, { waitUntil: "networkidle" });
  const mineEng = await extractSections(page3);
  await ctx3.close();

  await browser.close();

  const out = {
    hr: compare(ref, mineHR),
    eng: null,
    counts: {
      projects: { ref: ref.projects?.length ?? 0, mine: mineHR.projects?.length ?? 0 },
      experience: { ref: ref.experience?.length ?? 0, mine: mineHR.experience?.length ?? 0 },
      education: { ref: ref.education?.length ?? 0, mine: mineHR.education?.length ?? 0 },
      capabilities: { ref: ref.capabilities?.length ?? 0, mine: mineHR.capabilities?.length ?? 0 },
      techStack: { ref: ref.techStack?.length ?? 0, mine: mineHR.techStack?.length ?? 0 },
    },
  };
  void mineEng;
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
