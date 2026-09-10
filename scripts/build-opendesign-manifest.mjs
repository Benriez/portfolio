#!/usr/bin/env node
// scripts/build-opendesign-manifest.mjs
//
// Forensically extract every user-visible content field from the live
// OpenDesign reference DOM. Output: /tmp/portfolio-opendesign-content-reference.json
//
// The OpenDesign site uses CLASS-BASED mode split (`hr-only` / `engineering-only`)
// with `body[data-mode]` controlling visibility. We extract twice (HR mode,
// Engineering mode) and merge so each field becomes `{ hr, eng }`.

import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

async function extractInMode(page) {
  return await page.evaluate(() => {
    const textRaw = (el) => (el ? el.textContent.trim() : null);
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // Resolve a node's visible text. The reference uses sibling <p>
    // elements with hr-only / engineering-only classes.
    const visibleTextOf = (el) => {
      if (!el) return null;
      // Single-language element
      if (el.classList.contains("hr-only") || el.classList.contains("engineering-only")) {
        const mode = document.body.dataset.mode === "engineering" ? "engineering" : "hr";
        if (el.classList.contains(`${mode}-only`)) return textRaw(el);
        return null;
      }
      // Two siblings: pick the active one
      const hr = el.querySelector(".hr-only");
      const eng = el.querySelector(".engineering-only");
      const mode = document.body.dataset.mode === "engineering" ? "engineering" : "hr";
      if (mode === "hr" && hr) return textRaw(hr);
      if (mode === "engineering" && eng) return textRaw(eng);
      // No mode split: return text directly
      return textRaw(el);
    };

    const header = {
      brand: textRaw($(".brand")),
      navLinks: $$(".nav-links a").map((a) => ({
        href: a.getAttribute("href"),
        text: textRaw(a),
      })),
      navActions: $$(".nav-actions a").map((a) => ({
        href: a.getAttribute("href"),
        text: textRaw(a),
      })),
      modeSwitch: $$(".mode-switch button").map((b) => ({
        key: b.dataset.setMode,
        ariaPressed: b.getAttribute("aria-pressed"),
        text: textRaw(b),
      })),
    };

    const heroEl = $(".hero");
    const heroStackEl = heroEl ? heroEl.querySelector(".hero-stack") : null;
    const hero = {
      eyebrow: visibleTextOf(heroEl ? heroEl.querySelector(".eyebrow") : null),
      h1: textRaw(heroEl ? heroEl.querySelector("h1") : null),
      role: textRaw(heroEl ? heroEl.querySelector(".role") : null),
      heroLead: visibleTextOf(heroEl ? heroEl.querySelector(".hero-lead") : null),
      heroStack: heroStackEl
        ? Array.from(heroStackEl.querySelectorAll("span")).map((s) => textRaw(s))
        : [],
      heroActions: heroEl
        ? Array.from(heroEl.querySelectorAll(".hero-actions > *")).map((a) => ({
            tag: a.tagName.toLowerCase(),
            text: textRaw(a),
            href: a.getAttribute ? a.getAttribute("href") : null,
          }))
        : [],
      heroPanel: heroEl
        ? Array.from(heroEl.querySelectorAll(".hero-panel > div")).map((row) => {
            const k = textRaw(row.querySelector(".panel-k"));
            const v = row.querySelector(".panel-v");
            return {
              key: k,
              value: visibleTextOf(v),
            };
          })
        : [],
    };

    const workSectionEl = $("#work");
    const workSection = {
      kicker: visibleTextOf(workSectionEl ? workSectionEl.querySelector(".section-kicker") : null),
      h2: textRaw(workSectionEl ? workSectionEl.querySelector(".section-head h2, h2") : null),
    };

    const workItems = $$("#work .work-item").map((item) => {
      const index = textRaw(item.querySelector(".work-index"));
      const title = textRaw(item.querySelector("h3"));
      const meta = visibleTextOf(item.querySelector(".work-meta"));
      const sub = visibleTextOf(item.querySelector(".work-sub"));
      // The reference has SEPARATE hr-only / engineering-only <p> elements.
      const leadHr = visibleTextOf(item.querySelector(".work-lead.hr-only"));
      const leadEng = visibleTextOf(item.querySelector(".work-lead.engineering-only"));
      const roleLine = visibleTextOf(item.querySelector(".role-line"));
      const pointsHr = Array.from(item.querySelectorAll(".work-points.hr-only li")).map((li) =>
        textRaw(li),
      );
      const pointsEng = Array.from(item.querySelectorAll(".work-points.engineering-only li")).map(
        (li) => textRaw(li),
      );
      const stackLine = visibleTextOf(item.querySelector(".stack-line"));
      const caseLink = (() => {
        const a = item.querySelector(".case-link");
        return a ? { href: a.getAttribute("href"), text: textRaw(a) } : null;
      })();
      return {
        index,
        title,
        meta,
        sub,
        leadHr,
        leadEng,
        roleLine,
        pointsHr,
        pointsEng,
        stackLine,
        caseLink,
      };
    });

    const flagship = (() => {
      const sec = $("#flagship");
      if (!sec) return null;
      const eyebrow = visibleTextOf(sec.querySelector(".eyebrow"));
      const h2 = textRaw(sec.querySelector("h2"));
      const leadHr = visibleTextOf(sec.querySelector(".section-lead.hr-only"));
      const leadEng = visibleTextOf(sec.querySelector(".section-lead.engineering-only"));
      const sr = sec.querySelector("[data-runtime]");
      const pipeline = $$(".rt-pipeline > .rt-node", sr).map((n) => ({
        key: n.dataset.key,
        step: n.dataset.step,
        labelHr: visibleTextOf(n.querySelector(".rt-label")),
        labelEng: visibleTextOf(n.querySelector(".rt-label")),
      }));
      const recovery = $$(".rt-recovery .rt-rec-node", sr).map((n) => ({
        rec: n.dataset.rec,
        labelHr: visibleTextOf(n.querySelector(".rt-rec-label")),
        labelEng: visibleTextOf(n.querySelector(".rt-rec-label")),
      }));
      const sideHeadHr = visibleTextOf(sr.querySelector(".rt-side-head"));
      const sideHeadEng = visibleTextOf(sr.querySelector(".rt-side-head"));
      const sideMetaHr = visibleTextOf(sr.querySelector(".rt-side-meta"));
      const sideMetaEng = visibleTextOf(sr.querySelector(".rt-side-meta"));
      const casePoints = $$(".case-point", sec).map((cp) => {
        // Reference: span (number), p.hr-only (HR body), p.engineering-only (Eng body).
        // Pick the <p> for the active mode first; fall back to first <p>.
        const pHr = cp.querySelector("p.hr-only");
        const pEng = cp.querySelector("p.engineering-only");
        const currentMode = document.body.dataset.mode === "engineering" ? "engineering" : "hr";
        const target =
          currentMode === "engineering"
            ? (pEng ?? cp.querySelector("p"))
            : (pHr ?? cp.querySelector("p"));
        return {
          no: textRaw(cp.querySelector("span")),
          body: visibleTextOf(target),
        };
      });
      return {
        eyebrow,
        h2,
        leadHr,
        leadEng,
        pipeline,
        recovery,
        sideHeadHr,
        sideHeadEng,
        sideMetaHr,
        sideMetaEng,
        casePoints,
      };
    })();

    const experience = $$("#experience .career-item").map((item) => ({
      time: textRaw(item.querySelector("time")),
      role: textRaw(item.querySelector("h3")),
      employer: textRaw(item.querySelectorAll("p")[0]),
      highlights: Array.from(item.querySelectorAll("ul li, .career-bullets li")).map((li) =>
        textRaw(li),
      ),
      subrole: (() => {
        const s = item.querySelector(".subrole");
        if (!s) return null;
        const ps = Array.from(s.querySelectorAll("p"));
        const pHr = s.querySelector("p.hr-only");
        const pEng = s.querySelector("p.engineering-only");
        const currentMode = document.body.dataset.mode === "engineering" ? "engineering" : "hr";
        const lead =
          currentMode === "engineering"
            ? visibleTextOf(pEng ?? ps[2])
            : visibleTextOf(pHr ?? ps[1]);
        return {
          h4: textRaw(s.querySelector("h4")),
          context: textRaw(ps[0]),
          lead,
          summary: textRaw(ps[3]),
        };
      })(),
    }));

    const education = (() => {
      const aside = document.querySelector(".education-list");
      if (!aside) return [];
      return $$(":scope > div", aside).map((entry) => {
        const allP = Array.from(entry.querySelectorAll("p"));
        return {
          title: textRaw(entry.querySelector("h3")),
          institution: textRaw(allP[0]),
          periods: allP.slice(1).map((p) => textRaw(p)),
        };
      });
    })();

    const capabilities = $$("#capabilities .capability").map((card) => {
      const pHr = card.querySelector("p.hr-only");
      const pEng = card.querySelector("p.engineering-only");
      const currentMode = document.body.dataset.mode === "engineering" ? "engineering" : "hr";
      const target =
        currentMode === "engineering"
          ? (pEng ?? card.querySelector("p"))
          : (pHr ?? card.querySelector("p"));
      return {
        no: textRaw(card.querySelector("span")),
        heading: visibleTextOf(card.querySelector("h3")),
        body: visibleTextOf(target),
      };
    });

    const techStack = (() => {
      const sec = document.querySelector("#capabilities .tech-stack");
      if (!sec) return [];
      return $$(":scope > div", sec).map((row) => ({
        label: textRaw(row.querySelector("strong")),
        items: textRaw(row.querySelectorAll("span")[1]),
      }));
    })();

    const approach = (() => {
      const sec = document.querySelector("#about, .about");
      if (!sec) return null;
      return {
        kicker: textRaw(sec.querySelector(".section-kicker")),
        h2: textRaw(sec.querySelector("h2")),
        paragraphs: $$(".approach-list > p", sec).map((p) => textRaw(p)),
      };
    })();

    const contact = (() => {
      const sec = document.querySelector("#contact");
      if (!sec) return null;
      return {
        kicker: textRaw(sec.querySelector(".section-kicker")),
        h2: textRaw(sec.querySelector("h2")),
        actions: $$(".contact-actions > *").map((a) => ({
          tag: a.tagName.toLowerCase(),
          href: a.getAttribute ? a.getAttribute("href") : null,
          text: textRaw(a),
        })),
      };
    })();

    return {
      header,
      hero,
      workSection,
      workItems,
      flagship,
      experience,
      education,
      capabilities,
      techStack,
      approach,
      contact,
      currentMode: document.body.dataset.mode === "engineering" ? "engineering" : "hr",
    };
  });
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:8001/", { waitUntil: "networkidle" });

  await page.evaluate(() => {
    document.documentElement.dataset["mode"] = "hr";
    document.body.dataset["mode"] = "hr";
  });
  const hr = await extractInMode(page);

  await page.evaluate(() => {
    document.documentElement.dataset["mode"] = "engineering";
    document.body.dataset["mode"] = "engineering";
  });
  const eng = await extractInMode(page);

  function merge(hrVal, engVal) {
    return {
      hr: hrVal ?? null,
      eng: engVal ?? null,
    };
  }
  const merged = {
    header: {
      ...hr.header,
      navLinks: hr.header.navLinks.map((l, i) => ({
        ...l,
        text: merge(l.text, eng.header.navLinks[i]?.text),
      })),
      navActions: hr.header.navActions.map((a, i) => ({
        ...a,
        text: merge(a.text, eng.header.navActions[i]?.text),
        href: merge(a.href, eng.header.navActions[i]?.href),
      })),
    },
    hero: {
      eyebrow: merge(hr.hero.eyebrow, eng.hero.eyebrow),
      h1: hr.hero.h1,
      role: hr.hero.role,
      heroLead: merge(hr.hero.heroLead, eng.hero.heroLead),
      heroStack: hr.hero.heroStack,
      heroActions: hr.hero.heroActions.map((a, i) => ({
        ...a,
        text: merge(a.text, eng.hero.heroActions[i]?.text),
        href: merge(a.href, eng.hero.heroActions[i]?.href),
      })),
      heroPanel: hr.hero.heroPanel.map((p, i) => ({
        key: p.key,
        value: merge(p.value, eng.hero.heroPanel[i]?.value),
      })),
    },
    workSection: {
      kicker: merge(hr.workSection.kicker, eng.workSection.kicker),
      h2: hr.workSection.h2,
    },
    workItems: hr.workItems.map((p, i) => ({
      index: p.index,
      title: p.title,
      meta: merge(p.meta, eng.workItems[i]?.meta),
      sub: merge(p.sub, eng.workItems[i]?.sub),
      leadHr: p.leadHr,
      leadEng: eng.workItems[i]?.leadEng,
      roleLine: p.roleLine,
      pointsHr: p.pointsHr,
      pointsEng: eng.workItems[i]?.pointsEng,
      stackLine: p.stackLine,
      caseLink: p.caseLink,
    })),
    flagship: hr.flagship
      ? {
          eyebrow: hr.flagship.eyebrow,
          h2: hr.flagship.h2,
          leadHr: hr.flagship.leadHr,
          leadEng: eng.flagship?.leadEng,
          pipeline: hr.flagship.pipeline.map((n, i) => ({
            key: n.key,
            step: n.step,
            labelHr: n.labelHr,
            labelEng: eng.flagship?.pipeline[i]?.labelEng,
          })),
          recovery: hr.flagship.recovery.map((n, i) => ({
            rec: n.rec,
            labelHr: n.labelHr,
            labelEng: eng.flagship?.recovery[i]?.labelEng,
          })),
          sideHeadHr: hr.flagship.sideHeadHr,
          sideHeadEng: eng.flagship?.sideHeadEng,
          sideMetaHr: hr.flagship.sideMetaHr,
          sideMetaEng: eng.flagship?.sideMetaEng,
          casePoints: hr.flagship.casePoints.map((c, i) => ({
            no: c.no,
            body: merge(c.body, eng.flagship?.casePoints[i]?.body),
          })),
        }
      : null,
    experience: hr.experience,
    education: hr.education,
    capabilities: hr.capabilities.map((c, i) => ({
      ...c,
      heading: merge(c.heading, eng.capabilities[i]?.heading),
      body: merge(c.body, eng.capabilities[i]?.body),
    })),
    techStack: hr.techStack,
    approach: hr.approach,
    contact: hr.contact,
  };

  await browser.close();
  await writeFile(
    "/tmp/portfolio-opendesign-content-reference.json",
    JSON.stringify(merged, null, 2),
  );
  // eslint-disable-next-line no-console
  console.log("Wrote /tmp/portfolio-opendesign-content-reference.json");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
