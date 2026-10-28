/**
 * Scroll experience — staged, scroll-aware presentation for the portfolio.
 *
 * One module owns every GSAP / ScrollTrigger instance on the page so the
 * choreography reads as a single language:
 *
 *   A. REVEAL             opacity 0 → 1, translateY → 0, once, triggered at
 *                         90% of the viewport so content arrives with the
 *                         scroll instead of after it.
 *   B. PROGRESSIVE REVEAL the same, in short staggered phases (section
 *                         head, project phases, career roles, capabilities).
 *   C. SCROLL-LINKED      scrubbed, reversible emphasis: hero fade-out,
 *                         active-project emphasis, Working-Approach lines,
 *                         the 2px progress line in the header.
 *
 * Progressive enhancement contract
 *   - Without JavaScript nothing is hidden (the base CSS has no hidden
 *     state). The <head> script sets `html[data-motion="pending"]` only
 *     when motion is wanted; the CSS hides the hero under that attribute
 *     and a 2.5 s fallback timer removes it if this module never runs.
 *   - `initializeScrollExperience()` sets `html[data-motion="ready"]`
 *     only after every initial state is applied, so there is no flash.
 *   - `prefers-reduced-motion: reduce` → nothing is created, everything
 *     stays visible; a runtime change to the preference reverts live.
 *   - Hidden content that receives keyboard focus is revealed at once.
 *   - Native scrolling is never touched: no pinning, no snap, no proxy.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MotionProfile {
  /** Entrance travel distance in px. */
  readonly y: number;
  /** Entrance duration in seconds. */
  readonly duration: number;
  /** Offset between phases of one group in seconds. */
  readonly phase: number;
  /** Offset between siblings inside one phase in seconds. */
  readonly sibling: number;
  /** Scrubbed project emphasis + hero fade (desktop / tablet only). */
  readonly scrubEffects: boolean;
}

const DESKTOP: MotionProfile = {
  y: 22,
  duration: 0.55,
  phase: 0.07,
  sibling: 0.04,
  scrubEffects: true,
};
const MOBILE: MotionProfile = {
  y: 12,
  duration: 0.4,
  phase: 0.05,
  sibling: 0.03,
  scrubEffects: false,
};

const EASE = "power2.out";
/** Reveal before the element reaches the central viewport. */
const REVEAL_START = "top 90%";
/**
 * Contrast floors for scrubbed opacity on text. Dimming text below these
 * values would break WCAG AA while the text is on screen:
 *   - body / small text needs ≥ 0.95 (so it is not dimmed at all),
 *   - large headline text (≥ 24px, 3:1) needs ≥ 0.71.
 */
const HERO_RECEDE_MIN = 0.95;
const HEADLINE_LINE_MIN = 0.72;
const GROUP_ATTR = "data-reveal-group";

type Cleanup = () => void;

function all<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function one<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T | null {
  return root.querySelector<T>(selector);
}

/** True when the element is already at or above the reveal line. */
function alreadyPassed(el: Element): boolean {
  return el.getBoundingClientRect().top < window.innerHeight * 0.9;
}

/* ------------------------------------------------------------------ */
/* Reveal groups                                                        */
/* ------------------------------------------------------------------ */

const groupTimelines = new WeakMap<Element, gsap.core.Timeline>();
let groupCounter = 0;

/**
 * Stage `phases` (arrays of elements) as one choreographed group that
 * plays once when `trigger` reaches the reveal line. Elements that are
 * already past that line when the group is created are shown immediately
 * (deep links, fast initial scroll, already-visible sections).
 */
function revealGroup(trigger: Element, phases: Element[][], profile: MotionProfile): void {
  const flat = phases.flat();
  if (flat.length === 0) return;

  const tl = gsap.timeline({ paused: true });
  phases.forEach((els, index) => {
    if (els.length === 0) return;
    tl.fromTo(
      els,
      { opacity: 0, y: profile.y },
      {
        opacity: 1,
        y: 0,
        duration: profile.duration,
        ease: EASE,
        stagger: profile.sibling,
        clearProps: "transform",
      },
      index * profile.phase,
    );
  });

  trigger.setAttribute(GROUP_ATTR, String(++groupCounter));
  groupTimelines.set(trigger, tl);

  if (alreadyPassed(trigger)) {
    tl.progress(1);
    return;
  }

  ScrollTrigger.create({
    trigger,
    start: REVEAL_START,
    once: true,
    onEnter: () => tl.play(),
  });
}

/** Keyboard users must never land on invisible content. */
function revealOnFocus(): Cleanup {
  const onFocus = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const group = target.closest(`[${GROUP_ATTR}]`);
    const tl = group ? groupTimelines.get(group) : undefined;
    if (tl && tl.progress() < 1) tl.progress(1);
  };
  document.addEventListener("focusin", onFocus);
  return () => document.removeEventListener("focusin", onFocus);
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

let heroEntered = false;

function setupHero(profile: MotionProfile): void {
  const hero = one(".hero");
  if (!hero) return;
  const sequence = [
    ".eyebrow",
    "h1",
    ".role",
    ".role-spec",
    ".heroLead",
    ".hero-stack",
    ".hero-actions",
    ".hero-panel",
  ]
    .map((selector) => one(selector, hero))
    .filter((el): el is HTMLElement => el !== null);

  if (!heroEntered) {
    heroEntered = true;
    // A deep link lands further down the page: show the hero, no sequence.
    if (window.location.hash && window.scrollY > 0) {
      gsap.set(sequence, { opacity: 1 });
    } else {
      gsap.fromTo(
        sequence,
        { opacity: 0, y: profile.y * 0.8 },
        {
          opacity: 1,
          y: 0,
          duration: profile.duration,
          ease: EASE,
          stagger: profile.phase * 0.8,
          clearProps: "transform",
        },
      );
    }
  } else {
    gsap.set(sequence, { opacity: 1 });
  }

  // Hero → Selected Work: the hero quietly recedes as it leaves.
  if (profile.scrubEffects) {
    const grid = one(".hero-grid", hero);
    if (grid) {
      gsap.fromTo(
        grid,
        { opacity: 1, y: 0 },
        {
          opacity: HERO_RECEDE_MIN,
          y: -16,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "bottom 55%",
            end: "bottom 5%",
            scrub: true,
          },
        },
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Section heads + section content                                     */
/* ------------------------------------------------------------------ */

function setupSectionReveals(profile: MotionProfile): void {
  // Every section head: label → headline → note.
  for (const head of all(".section-head")) {
    revealGroup(
      head,
      [all(".section-kicker", head), all("h2", head), all(".section-note", head)],
      profile,
    );
  }

  // Experience: each role as date → role → context → bullets → sub-role.
  for (const item of all(".career-item")) {
    revealGroup(
      item,
      [
        all(".career-period", item),
        all("h3", item),
        all(".career-employer", item),
        all(".career-bullets", item),
        all(".subrole", item),
      ],
      profile,
    );
  }

  // Education enters as its own quiet unit.
  const education = one(".education-aside");
  if (education) {
    revealGroup(
      education,
      [all(":scope > .section-kicker", education), all(".education-list > li", education)],
      profile,
    );
  }

  // Capabilities: 01 → 02 → 03 → 04, each domain as one unit.
  const capabilities = one(".capability-grid");
  if (capabilities) {
    revealGroup(capabilities, [all(".capability", capabilities)], profile);
  }
  const techStack = one(".tech-stack");
  if (techStack) {
    revealGroup(
      techStack,
      [all(".tech-stack-title", techStack), all(".tech-stack-list > div", techStack)],
      profile,
    );
  }

  // Working approach paragraphs (the headline has its own treatment).
  const approach = one(".approach-list");
  if (approach) {
    revealGroup(approach, [all(":scope > p", approach)], profile);
  }

  // Contact: the conclusion — one clean sequence.
  const contactList = one(".contact-list");
  if (contactList) {
    revealGroup(contactList, [all(":scope > li", contactList)], profile);
  }
}

/* ------------------------------------------------------------------ */
/* Selected Work                                                       */
/* ------------------------------------------------------------------ */

function setupProjectReveals(profile: MotionProfile): void {
  for (const item of all(".work-item")) {
    revealGroup(
      item,
      [
        all(".work-index, .work-meta", item),
        all("h3, .work-sub", item),
        all(".work-lead, .role-line", item),
        all(".work-points", item),
        all(".stack-line, .case-links", item),
      ],
      profile,
    );

    if (!profile.scrubEffects) continue;

    // Reading emphasis: the project in the reading band carries an accent
    // rule that draws in as it becomes current and withdraws as it leaves.
    // Text is never dimmed (contrast). Pure function of ScrollTrigger
    // progress — no DOM reads while scrolling, transform only.
    const rule = one(".work-focus-rule", item);
    if (!rule) continue;
    ScrollTrigger.create({
      trigger: item,
      start: "top 85%",
      end: "bottom 15%",
      scrub: true,
      onUpdate: (self) => {
        const vh = window.innerHeight;
        const total = Math.max(self.end - self.start, 1);
        const enter = Math.min((0.4 * vh) / total, 0.5);
        const exit = Math.min((0.3 * vh) / total, 0.5);
        const p = self.progress;
        let strength = 1;
        if (p < enter) strength = p / enter;
        else if (p > 1 - exit) strength = (1 - p) / exit;
        gsap.set(rule, { scaleX: strength });
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/* Working approach headline                                           */
/* ------------------------------------------------------------------ */

function setupWorkingApproach(profile: MotionProfile): void {
  const headline = one("#about-title");
  if (!headline) return;
  const lines = all(".line", headline);
  if (lines.length === 0) return;

  if (profile.scrubEffects) {
    // Scroll-linked, reversible: each line gains weight as it travels
    // through the reading band. Always readable (large text, ≥ 3:1).
    lines.forEach((line) => {
      gsap.fromTo(
        line,
        { opacity: HEADLINE_LINE_MIN, y: 16 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top 88%",
            end: "top 58%",
            scrub: 0.4,
          },
        },
      );
    });
  } else {
    revealGroup(
      headline,
      lines.map((line) => [line]),
      profile,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Scroll progress line                                                */
/* ------------------------------------------------------------------ */

function setupScrollProgress(): void {
  const bar = one(".scroll-progress");
  if (!bar) return;
  gsap.fromTo(
    bar,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.2,
      },
    },
  );
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

function profileFor(conditions: gsap.Conditions | undefined): MotionProfile {
  return conditions?.["mobile"] ? MOBILE : DESKTOP;
}

/**
 * Browsers may perform the fragment scroll of a deep link after this
 * module runs. Wait (briefly) until the target is in place so elements
 * around it are treated as already passed instead of staged in late.
 */
function whenFragmentSettled(): Promise<void> {
  const id = window.location.hash.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return Promise.resolve();
  return new Promise((resolve) => {
    const deadline = performance.now() + 400;
    const check = () => {
      const top = target.getBoundingClientRect().top;
      if ((top >= 0 && top <= window.innerHeight * 0.5) || performance.now() > deadline) {
        resolve();
      } else {
        window.requestAnimationFrame(check);
      }
    };
    check();
  });
}

/**
 * Initialise the scroll experience. Returns a cleanup that reverts every
 * animation, trigger and listener (content stays visible afterwards).
 */
export function initializeScrollExperience(): Cleanup {
  let cancelled = false;
  let teardown: Cleanup = () => {
    cancelled = true;
  };
  void whenFragmentSettled().then(() => {
    if (!cancelled) teardown = start();
  });
  return () => teardown();
}

function start(): Cleanup {
  const root = document.documentElement;
  const cleanups: Cleanup[] = [];

  const mm = gsap.matchMedia();
  mm.add(
    {
      reduce: "(prefers-reduced-motion: reduce)",
      mobile: "(max-width: 620px)",
      desktop: "(min-width: 621px)",
    },
    (context) => {
      if (context.conditions?.["reduce"]) {
        root.dataset["motion"] = "off";
        return;
      }
      const profile = profileFor(context.conditions);
      setupHero(profile);
      setupSectionReveals(profile);
      setupProjectReveals(profile);
      setupWorkingApproach(profile);
      setupScrollProgress();
      root.dataset["motion"] = "ready";
    },
  );
  cleanups.push(() => mm.revert());
  cleanups.push(revealOnFocus());

  // Layout changes that move trigger positions.
  const refresh = () => {
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  root.addEventListener("modechange", refresh);
  cleanups.push(() => root.removeEventListener("modechange", refresh));
  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  return () => {
    cleanups.forEach((fn) => fn());
    root.dataset["motion"] = "off";
  };
}
