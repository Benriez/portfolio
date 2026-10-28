import { test, expect, type Page } from "@playwright/test";

/**
 * Staged scroll experience — functional contract.
 *
 * Nothing here asserts animation timings. The tests pin the behaviour
 * that matters: motion initialises, content is never left hidden (fast
 * scroll, reverse scroll, deep links, mode switch), anchors still land,
 * reduced motion and failure paths keep everything visible, and native
 * scrolling / layout stay intact.
 */

const CONTENT = [
  ".hero h1",
  ".hero-panel",
  "#work .section-kicker",
  "#work .work-item h3",
  "#work .stack-line:not(.engineering-only)",
  ".career-item h3",
  ".education-list > li",
  ".capability",
  ".tech-stack-list > div",
  ".approach-list > p",
  ".contact-list > li",
];

async function waitForMotion(page: Page, state: "ready" | "off") {
  await expect(page.locator("html")).toHaveAttribute("data-motion", state, { timeout: 6_000 });
}

/** Maximum opacity deficit over all content elements (0 = everything fully visible). */
async function hiddenContent(page: Page): Promise<string[]> {
  return page.evaluate((selectors) => {
    const out: string[] = [];
    for (const selector of selectors) {
      for (const el of document.querySelectorAll<HTMLElement>(selector)) {
        const cs = getComputedStyle(el);
        if (cs.display === "none") continue;
        if (parseFloat(cs.opacity) < 0.99 || cs.visibility === "hidden") {
          out.push(
            `${selector} → opacity ${cs.opacity} (${(el.textContent ?? "").trim().slice(0, 30)})`,
          );
        }
      }
    }
    return out;
  }, CONTENT);
}

/** Headline lines are scroll-linked (reversible) and always readable. */
async function headlineLinesReadable(page: Page): Promise<number> {
  return page.evaluate(() =>
    Math.min(
      ...Array.from(document.querySelectorAll<HTMLElement>("#about-title .line")).map((el) =>
        parseFloat(getComputedStyle(el).opacity),
      ),
    ),
  );
}

async function settle(page: Page) {
  // Let pending tweens (≤ ~1 s) finish.
  await page.waitForTimeout(1_300);
}

test.describe("Motion initialisation", () => {
  test("upgrades to data-motion=ready and stages the hero in", async ({ page }) => {
    await page.goto("./?mode=hr");
    await waitForMotion(page, "ready");
    await settle(page);
    // The hero has staged in; below-the-fold content waits for the scroll.
    for (const selector of [".hero h1", ".hero .role", ".hero-actions", ".hero-panel"]) {
      await expect(page.locator(selector)).toHaveCSS("opacity", "1");
    }
    // GSAP chunk is page-local and only loaded on the motion path.
    const scripts = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((e) => e.name)
        .filter((n) => n.includes("/_astro/") && n.endsWith(".js")),
    );
    expect(scripts.some((n) => /scroll-experience/.test(n))).toBe(true);
  });

  test("reduced motion: no motion module, nothing hidden, no progress line", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./?mode=engineering");
    await waitForMotion(page, "off");
    expect(await hiddenContent(page)).toEqual([]);
    await expect(page.locator(".scroll-progress")).toBeHidden();
    const scripts = await page.evaluate(() =>
      performance.getEntriesByType("resource").map((e) => e.name),
    );
    expect(scripts.some((n) => /scroll-experience/.test(n))).toBe(false);
    // Nothing carries an inline opacity / transform.
    expect(await page.locator('main [style*="opacity"]').count()).toBe(0);
  });

  test("failure-safe: if the motion chunk never loads, the hero is released", async ({ page }) => {
    await page.route("**/scroll-experience*", (route) => route.abort());
    await page.goto("./?mode=hr");
    await waitForMotion(page, "off");
    expect(await hiddenContent(page)).toEqual([]);
    await expect(page.locator(".hero h1")).toBeVisible();
  });
});

test.describe("Scrolling", () => {
  test("fast scroll top → bottom leaves no content hidden", async ({ page }) => {
    await page.goto("./?mode=engineering");
    await waitForMotion(page, "ready");
    // Burst of wheel events, then jump to the end.
    for (let i = 0; i < 12; i += 1) await page.mouse.wheel(0, 1_200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle(page);
    expect(await hiddenContent(page)).toEqual([]);
    // Text is never dimmed for emphasis; the headline lines sit at full
    // strength once passed.
    // Only the two scroll-linked cues may sit below 1: the receded hero
    // grid (≥ 0.95) and the headline lines (≥ 0.72, full once passed).
    const dimmed = await page
      .locator('main [style*="opacity"]')
      .evaluateAll((els) =>
        els
          .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99)
          .map((el) => `${el.className}:${getComputedStyle(el).opacity}`),
      );
    expect(dimmed.filter((d) => !d.startsWith("container hero-grid"))).toEqual([]);
    expect(dimmed.every((d) => parseFloat(d.split(":")[1]!) >= 0.95)).toBe(true);
    expect(await headlineLinesReadable(page)).toBeGreaterThanOrEqual(0.99);
  });

  test("reverse scroll bottom → top keeps revealed content visible", async ({ page }) => {
    await page.goto("./?mode=hr");
    await waitForMotion(page, "ready");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle(page);
    for (let i = 0; i < 12; i += 1) await page.mouse.wheel(0, -1_200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page);
    expect(await hiddenContent(page)).toEqual([]);
    // Scroll-linked lines are reversible but never fall below their floor.
    expect(await headlineLinesReadable(page)).toBeGreaterThanOrEqual(0.7);
  });

  test("native scrolling is untouched: no pin spacers, no snap, no scroll proxy", async ({
    page,
  }) => {
    await page.goto("./?mode=hr");
    await waitForMotion(page, "ready");
    expect(await page.locator(".pin-spacer").count()).toBe(0);
    const styles = await page.evaluate(() => ({
      snap: getComputedStyle(document.documentElement).scrollSnapType,
      overflowBody: getComputedStyle(document.body).overflow,
      overflowHtml: getComputedStyle(document.documentElement).overflow,
      fixedMain: getComputedStyle(document.querySelector("main")!).position,
    }));
    expect(styles.snap).toBe("none");
    expect(styles.overflowBody).toBe("visible");
    expect(styles.overflowHtml).toBe("visible");
    expect(styles.fixedMain).toBe("static");
    // A wheel step moves the document by roughly the requested amount.
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    const y = await page.evaluate(() => window.scrollY);
    expect(y).toBeGreaterThan(300);
  });

  test("no horizontal overflow while animating", async ({ page }) => {
    await page.goto("./?mode=engineering");
    await waitForMotion(page, "ready");
    for (const fraction of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), fraction);
      await page.waitForTimeout(120);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `at ${fraction}`).toBeLessThanOrEqual(0);
    }
  });

  test("progress line follows the document position", async ({ page }) => {
    await page.goto("./?mode=hr");
    await waitForMotion(page, "ready");
    const bar = page.locator(".scroll-progress");
    // Rendered (display:block) but scaled to zero width at the top.
    await expect(bar).toHaveCSS("display", "block");
    const box = await bar.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(2);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const scale = await bar.evaluate((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return m.a;
    });
    expect(scale).toBeGreaterThan(0.95);
  });
});

test.describe("Navigation with motion on", () => {
  test("anchor navigation still lands below the header and reveals the target", async ({
    page,
  }) => {
    await page.goto("./?mode=hr");
    await waitForMotion(page, "ready");
    const header = await page.locator(".site-header").boundingBox();
    for (const id of ["experience", "capabilities", "about"]) {
      await page.locator(`.nav-links a[href="#${id}"]`).click();
      // Smooth scroll: wait until the position is stable.
      await page.waitForFunction(() => {
        const w = window as unknown as { __lastY?: number };
        const same = w.__lastY === window.scrollY;
        w.__lastY = window.scrollY;
        return same;
      });
      await settle(page);
      const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
      const bottom = header!.y + header!.height;
      expect(top, `#${id}`).toBeGreaterThanOrEqual(bottom - 1);
      expect(top, `#${id}`).toBeLessThanOrEqual(bottom + 40);
      // The target section's head is revealed.
      await expect(page.locator(`#${id} .section-kicker`).first()).toHaveCSS("opacity", "1");
      await expect(page.locator(`#${id} h2`).first()).toHaveCSS("opacity", "1");
    }
  });

  test("deep link lands on the section with its content visible at once", async ({ page }) => {
    await page.goto("./?mode=engineering#capabilities");
    await waitForMotion(page, "ready");
    // Immediately — not after an entrance animation.
    const earlyHidden = await page.evaluate(
      () =>
        Array.from(
          document.querySelectorAll<HTMLElement>("#capabilities .capability, #capabilities h2"),
        )
          .map((el) => parseFloat(getComputedStyle(el).opacity))
          .filter((o) => o < 0.99).length,
    );
    expect(earlyHidden).toBe(0);
    const header = await page.locator(".site-header").boundingBox();
    const top = await page
      .locator("#capabilities")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
    expect(top).toBeLessThanOrEqual(header!.y + header!.height + 40);
    await expect(page.locator("html")).toHaveAttribute("data-mode", "engineering");
  });

  test("mode switch keeps the section, refreshes triggers and hides nothing", async ({ page }) => {
    await page.goto("./?mode=hr#experience");
    await waitForMotion(page, "ready");
    await settle(page);
    const before = await page
      .locator("#experience")
      .evaluate((el) => el.getBoundingClientRect().top);
    await page.getByRole("button", { name: "Engineering", exact: true }).evaluate((el) => {
      (el as HTMLButtonElement).focus();
      (el as HTMLButtonElement).click();
    });
    await expect(page.locator("html")).toHaveAttribute("data-mode", "engineering");
    const after = await page
      .locator("#experience")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle(page);
    expect(await hiddenContent(page)).toEqual([]);
    // Engineering-only detail that was display:none at init is visible now.
    await expect(page.locator(".work-item .stack-line.engineering-only").first()).toBeVisible();
    await expect(page.locator(".work-item .stack-line.engineering-only").first()).toHaveCSS(
      "opacity",
      "1",
    );
  });

  test("resize across the mobile breakpoint re-stages without hiding content", async ({ page }) => {
    await page.goto("./?mode=engineering");
    await waitForMotion(page, "ready");
    const start = page.viewportSize()!;
    // Cross the 620px motion breakpoint in both directions (orientation
    // change on phones, window resize on desktop).
    const other = start.width <= 620 ? { width: 900, height: 600 } : { width: 500, height: 800 };
    await page.setViewportSize(other);
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle(page);
    expect(await hiddenContent(page)).toEqual([]);
    await page.setViewportSize(start);
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle(page);
    expect(await hiddenContent(page)).toEqual([]);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "ready");
  });

  test("keyboard focus reveals content that has not scrolled in yet", async ({ page }) => {
    await page.goto("./?mode=hr");
    await waitForMotion(page, "ready");
    const link = page.getByRole("link", { name: "Projektseite", exact: true });
    await link.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }));
    await page.waitForTimeout(100);
    await expect(link).toHaveCSS("opacity", "1");
    await expect(link.locator("xpath=ancestor::article")).toHaveCSS("opacity", /^(1|0\.[89]\d*)$/);
  });
});
