#!/usr/bin/env node
// scripts/build-astro-manifest.mjs
//
// Extract user-visible content from the live Astro portfolio DOM.
// Output: /tmp/portfolio-astro-content-current.json
//
// The Astro site renders BOTH mode variants (HR and Engineering) inside
// the same DOM nodes, hidden by CSS. To compare against the reference
// verbatim, we toggle body[data-mode] per variant and read each in
// sequence.

import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

async function extractInMode(page) {
  return await page.evaluate(() => {
    const textRaw = (el) => (el ? el.textContent.trim() : null);
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // Pick the active mode currently set on <body>.
    const mode = document.body.dataset.mode === "engineering" ? "engineering" : "hr";

    // Resolve a node's visible text. We try, in order:
    //   1. <span data-view="<mode>"> direct child
    //   2. Direct <hr-only> or <engineering-only> class on the node
    //   3. Direct <hr-only> or <engineering-only> direct child
    //   4. Fall back to the node's textContent (single-language fields)
    const visibleTextOf = (el) => {
      if (!el) return null;
      const ds = el.querySelector(`:scope > [data-view="${mode}"]`);
      if (ds) return textRaw(ds);
      const dc = el.querySelector(`:scope > .${mode}-only`);
      if (dc) return textRaw(dc);
      if (el.classList.contains(`${mode}-only`)) return textRaw(el);
      // Fall back: the element itself shows whichever copy is visible.
      // Strip out the inactive copy before reading so we don't double-count.
      const clone = el.cloneNode(true);
      clone
        .querySelectorAll('[data-view]:not([data-view="' + mode + '"])')
        .forEach((n) => n.remove());
      clone
        .querySelectorAll("." + (mode === "hr" ? "engineering" : "hr") + "-only")
        .forEach((n) => n.remove());
      return textRaw(clone);
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
      modeSwitch: $$(".mode-switch a").map((b) => ({
        key: b.dataset.setMode,
        ariaPressed: b.getAttribute("aria-pressed"),
        text: textRaw(b),
      })),
    };

    const heroEl = $(".hero");
    const heroStackEl = heroEl ? heroEl.querySelector(".hero-stack") : null;
    const hero = {
      eyebrow: heroEl ? visibleTextOf(heroEl.querySelector(".eyebrow")) : null,
      h1: heroEl ? textRaw(heroEl.querySelector("h1")) : null,
      role: heroEl ? textRaw(heroEl.querySelector(".role")) : null,
      heroLead: heroEl ? visibleTextOf(heroEl.querySelector(".hero-lead")) : null,
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
            const k = row.querySelector(".panel-k");
            const v = row.querySelector(".panel-v");
            return {
              key: textRaw(k),
              value: visibleTextOf(v),
            };
          })
        : [],
    };

    const workSectionEl = $("#work");
    const workSection = {
      kicker: workSectionEl
        ? visibleTextOf(
            workSectionEl.querySelector(".section-kicker, .section-head .section-kicker, .eyebrow"),
          )
        : null,
      h2: workSectionEl ? textRaw(workSectionEl.querySelector(".section-head h2, h2")) : null,
    };

    const workItems = $$("#work .work-item").map((item) => {
      const index = textRaw(item.querySelector(".work-index"));
      const title = textRaw(item.querySelector("h3"));
      const meta = visibleTextOf(item.querySelector(".work-meta"));
      const sub = visibleTextOf(item.querySelector(".work-sub"));
      // work-lead has two siblings in the reference; if mine puts both
      // modes inside one <p>, visibleTextOf will still resolve correctly.
      const leadHr = visibleTextOf(item.querySelector(".work-lead"));
      const leadEng = visibleTextOf(item.querySelector(".work-lead"));
      const roleLine = textRaw(item.querySelector(".role-line"));
      const pointsHr = Array.from(
        item.querySelectorAll(".work-points.hr-only li, .work-points--hr li"),
      ).map((li) => textRaw(li));
      const pointsEng = Array.from(
        item.querySelectorAll(".work-points.engineering-only li, .work-points--engineering li"),
      ).map((li) => textRaw(li));
      const stackLine = textRaw(item.querySelector(".stack-line"));
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
      const sec = $(".flagship-section, [data-bodi-runtime]");
      if (!sec) return null;
      const eyebrowEl = sec.querySelector(".eyebrow");
      const h2El = sec.querySelector("h2");
      const leadEl = sec.querySelector(".section-lead");
      const sr = sec.querySelector("[data-bodi-runtime]");
      const pipeline = sr
        ? Array.from(sr.querySelectorAll(".rt-pipeline > .rt-node")).map((n) => ({
            key: n.dataset.key,
            step: n.dataset.step,
            labelHr: visibleTextOf(n.querySelector(".rt-label")),
            labelEng: visibleTextOf(n.querySelector(".rt-label")),
          }))
        : [];
      const recovery = sr
        ? Array.from(sr.querySelectorAll(".rt-recovery .rt-rec-node")).map((n) => ({
            rec: n.dataset.rec,
            labelHr: visibleTextOf(n.querySelector(".rt-rec-label")),
            labelEng: visibleTextOf(n.querySelector(".rt-rec-label")),
          }))
        : [];
      const casePoints = Array.from(sec.querySelectorAll(".case-point")).map((cp) => {
        const pHr = cp.querySelector("p.hr-only");
        const pEng = cp.querySelector("p.engineering-only");
        const target =
          mode === "engineering" ? (pEng ?? cp.querySelector("p")) : (pHr ?? cp.querySelector("p"));
        return {
          no: textRaw(cp.querySelector("span")),
          body: visibleTextOf(target),
        };
      });
      return {
        eyebrow: textRaw(eyebrowEl),
        h2: textRaw(h2El),
        leadHr: visibleTextOf(leadEl),
        leadEng: visibleTextOf(leadEl),
        pipeline,
        recovery,
        sideHeadHr: sr ? visibleTextOf(sr.querySelector(".rt-side-head")) : null,
        sideHeadEng: sr ? visibleTextOf(sr.querySelector(".rt-side-head")) : null,
        sideMetaHr: sr ? visibleTextOf(sr.querySelector(".rt-side-meta")) : null,
        sideMetaEng: sr ? visibleTextOf(sr.querySelector(".rt-side-meta")) : null,
        casePoints,
      };
    })();

    const experience = $$("#experience .career-item").map((item) => ({
      time: textRaw(item.querySelector("time")),
      role: textRaw(item.querySelector("h3")),
      employer: textRaw(item.querySelector(".career-employer")),
      highlights: Array.from(item.querySelectorAll("ul li")).map((li) => textRaw(li)),
      subrole: (() => {
        const s = item.querySelector(".subrole");
        if (!s) return null;
        const ps = Array.from(s.querySelectorAll("p"));
        const pHr = s.querySelector("p.hr-only");
        const pEng = s.querySelector("p.engineering-only");
        const lead =
          mode === "engineering" ? visibleTextOf(pEng ?? ps[2]) : visibleTextOf(pHr ?? ps[1]);
        return {
          h4: textRaw(s.querySelector("h4")),
          context: textRaw(ps[0]),
          lead,
          summary: textRaw(ps[3]),
        };
      })(),
    }));

    const education = (() => {
      const aside = $(".education-list");
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

    const capabilities = $$("#capabilities .capability").map((card) => ({
      no: textRaw(card.querySelector(".capability-no")),
      heading: visibleTextOf(card.querySelector("h3")),
      body: (() => {
        const pHr = card.querySelector("p.hr-only");
        const pEng = card.querySelector("p.engineering-only");
        const target =
          mode === "engineering"
            ? (pEng ?? card.querySelector("p"))
            : (pHr ?? card.querySelector("p"));
        return visibleTextOf(target);
      })(),
    }));

    const techStack = (() => {
      const sec = $("#capabilities .tech-stack");
      if (!sec) return [];
      return $$(":scope > div", sec).map((row) => ({
        label: textRaw(row.querySelector("strong")),
        items: textRaw(row.querySelectorAll("span")[1]),
      }));
    })();

    const approach = (() => {
      const sec = $("#about, .about");
      if (!sec) return null;
      return {
        kicker: textRaw(sec.querySelector(".section-kicker")),
        h2: textRaw(sec.querySelector("h2")),
        paragraphs: $$(".approach-list > p", sec).map((p) => textRaw(p)),
      };
    })();

    const contact = (() => {
      const sec = $("#contact");
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
      currentMode: mode,
    };
  });
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:4321/portfolio/", { waitUntil: "networkidle" });

  // Extract twice: once in HR mode, once in Engineering mode, then merge.
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

  // Merge: for each field that varies by mode, keep both variants
  // using the same key shape as the OpenDesign manifest (hr/eng).
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
  await writeFile("/tmp/portfolio-astro-content-current.json", JSON.stringify(merged, null, 2));
  // eslint-disable-next-line no-console
  console.log("Wrote /tmp/portfolio-astro-content-current.json");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
