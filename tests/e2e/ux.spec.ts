import { test, expect, type Page } from "@playwright/test";

/**
 * UX regression contract.
 *
 * These assertions pin the interaction and accessibility behaviour of the
 * shell: anchor offsets under the sticky header, reduced-motion handling,
 * touch-target sizes, external-link marking, active-section indication,
 * mode-switch stability and the contact flow. Content truth is covered by
 * the unit tests and portfolio.spec.ts.
 */

const SECTIONS = ["work", "experience", "capabilities", "about", "contact"] as const;

async function headerBottom(page: Page): Promise<number> {
  const box = await page.locator(".site-header").boundingBox();
  expect(box).not.toBeNull();
  return box!.y + box!.height;
}

test.describe("Navigation", () => {
  test("anchor navigation lands every section below the sticky header", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./?mode=hr");
    const bottom = await headerBottom(page);
    for (const id of SECTIONS) {
      await page.locator(`.nav-links a[href="#${id}"]`).click();
      await page.waitForFunction(
        (sectionId) => Math.abs(window.scrollY - 0) > 0 && location.hash === `#${sectionId}`,
        id,
      );
      const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
      // Section top sits just under the header, never hidden by it, and
      // never far below it. The last section can only come as close as the
      // page end allows.
      expect(top, `#${id} top vs header bottom`).toBeGreaterThanOrEqual(bottom - 1);
      if (id === "contact") {
        const atEnd = await page.evaluate(
          () => window.innerHeight + window.scrollY >= document.body.scrollHeight - 1,
        );
        expect(atEnd, "#contact scrolls to the page end").toBe(true);
      } else {
        expect(top, `#${id} should start near the header`).toBeLessThanOrEqual(bottom + 40);
      }
    }
  });

  test("marks the section in view with aria-current", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./?mode=hr");
    await expect(page.locator('.nav-links a[aria-current="true"]')).toHaveCount(0);
    await page.locator('.nav-links a[href="#experience"]').click();
    await expect(page.locator('.nav-links a[href="#experience"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.locator('.nav-links a[aria-current="true"]')).toHaveCount(1);
    await page.locator('.nav-links a[href="#contact"]').click();
    await expect(page.locator('.nav-links a[href="#contact"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("header stays compact at every breakpoint", async ({ page }) => {
    await page.goto("./?mode=hr");
    const width = page.viewportSize()!.width;
    const box = await page.locator(".site-header").boundingBox();
    expect(box!.height).toBeLessThanOrEqual(width <= 660 ? 112 : width <= 900 ? 80 : 68);
    // The CSS header-height token tracks the rendered bar (±2px).
    const token = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")),
    );
    expect(Math.abs(token - box!.height)).toBeLessThanOrEqual(2);
  });

  test("smooth scrolling is disabled under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./?mode=hr");
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    ).toBe("auto");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    ).toBe("smooth");
  });
});

test.describe("Mode switch", () => {
  test("uses full labels, exposes pressed state and updates the URL", async ({ page }) => {
    await page.goto("./");
    const hr = page.getByRole("button", { name: "HR", exact: true });
    const engineering = page.getByRole("button", { name: "Engineering", exact: true });
    await expect(hr).toHaveAttribute("aria-pressed", "true");
    await expect(engineering).toHaveAttribute("aria-pressed", "false");
    await expect(engineering).toHaveText("Engineering");
    await expect(page.locator(".mode-label-short")).toHaveCount(0);
    await engineering.click();
    await expect(engineering).toHaveAttribute("aria-pressed", "true");
    await expect(hr).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "engineering");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "engineering");
    expect(new URL(page.url()).searchParams.get("mode")).toBe("engineering");
  });

  test("deep link applies the mode on <html> before the body script runs", async ({ page }) => {
    await page.goto("./?mode=engineering");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "engineering");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "engineering");
    // The Engineering surface heading is the visible one.
    await expect(page.locator("#capabilities-title .engineering-only")).toBeVisible();
    await expect(page.locator("#capabilities-title .hr-only")).toBeHidden();
  });

  test("keeps the reading position when switching modes mid-page", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./?mode=hr#capabilities");
    await page.waitForFunction(() => location.hash === "#capabilities");
    const before = await page
      .locator("#capabilities")
      .evaluate((el) => el.getBoundingClientRect().top);
    // Activate like a user (focus + click). Playwright's click() first
    // scrolls the sticky button "into view", which moves the page itself.
    await page.getByRole("button", { name: "Engineering", exact: true }).evaluate((el) => {
      (el as HTMLButtonElement).focus();
      (el as HTMLButtonElement).click();
    });
    await page.waitForFunction(() => document.documentElement.dataset["mode"] === "engineering");
    const after = await page
      .locator("#capabilities")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
  });

  test("Engineering-only detail stays out of the HR view", async ({ page }) => {
    await page.goto("./?mode=hr");
    const f360 = page.locator("article", {
      has: page.getByRole("heading", { name: "Fahrschule360" }),
    });
    await expect(f360.locator(".stack-line.engineering-only")).toBeHidden();
    await expect(f360.locator(".stack-line").first()).toBeVisible();
    await page.getByRole("button", { name: "Engineering", exact: true }).click();
    await expect(f360.locator(".stack-line.engineering-only")).toBeVisible();
    await expect(f360.locator(".stack-line.engineering-only")).toContainText("VR Hardware");
  });
});

test.describe("Targets and links", () => {
  test("every interactive target is at least 24px tall", async ({ page }) => {
    await page.goto("./?mode=engineering");
    const boxes = await page
      .locator(".nav-links a, .mode-switch button, .hero-actions a, .case-link, .contact-list a")
      .evaluateAll((els) =>
        els.map((el) => ({
          text: (el.textContent ?? "").trim(),
          h: el.getBoundingClientRect().height,
          w: el.getBoundingClientRect().width,
        })),
      );
    expect(boxes.length).toBeGreaterThan(10);
    for (const box of boxes) {
      expect(box.h, `${box.text} height`).toBeGreaterThanOrEqual(24);
      expect(box.w, `${box.text} width`).toBeGreaterThanOrEqual(24);
    }
  });

  test("external links are marked and carry a safe rel", async ({ page }) => {
    await page.goto("./?mode=hr");
    const external = page.locator('main a[href^="http"], header a[href^="http"]');
    const count = await external.count();
    expect(count).toBeGreaterThanOrEqual(7);
    for (let i = 0; i < count; i += 1) {
      const link = external.nth(i);
      await expect(link, `rel on ${await link.getAttribute("href")}`).toHaveAttribute(
        "rel",
        /noopener/,
      );
      await expect(link.locator(".ext-icon")).toHaveCount(1);
      await expect(link.locator(".ext-icon")).toHaveAttribute("aria-hidden", "true");
    }
    // Internal anchors and mailto links are not marked as external.
    await expect(page.locator('a[href^="#"] .ext-icon, a[href^="mailto:"] .ext-icon')).toHaveCount(
      0,
    );
  });

  test("project links keep their accessible names", async ({ page }) => {
    await page.goto("./?mode=hr");
    for (const name of ["Website", "Presseartikel", "Projektseite", "Release v0.2.0-preview.3"]) {
      await expect(page.getByRole("link", { name, exact: true })).toHaveCount(1);
    }
  });
});

test.describe("Selected Work presentation", () => {
  test("period rail is shown once per project on narrow viewports", async ({ page }) => {
    await page.goto("./?mode=hr");
    const width = page.viewportSize()!.width;
    const bodi = page.locator("article", {
      has: page.getByRole("heading", { name: "BODI / agent-garden" }),
    });
    const migration = page.locator("article", {
      has: page.getByRole("heading", { name: "Production Web Platform Migration" }),
    });
    if (width <= 900) {
      // The meta line already states the period → the rail is hidden.
      await expect(bodi.locator(".work-index")).toBeHidden();
      await expect(bodi.locator(".work-meta")).toBeVisible();
      // Without a meta line the rail is the only period → it stays visible.
      await expect(migration.locator(".work-index")).toBeVisible();
    } else {
      await expect(bodi.locator(".work-index")).toBeVisible();
      await expect(migration.locator(".work-index")).toBeVisible();
    }
  });

  test("stack tokens never break inside a term", async ({ page }) => {
    await page.goto("./?mode=engineering");
    const tokens = page.locator(".stack-items .tok, .capability-body .tok, .tech-stack-items .tok");
    expect(await tokens.count()).toBeGreaterThan(40);
    const multiLine = await tokens.evaluateAll((els) =>
      els.filter((el) => el.getClientRects().length > 1).map((el) => (el.textContent ?? "").trim()),
    );
    expect(multiLine).toEqual([]);
  });
});

test.describe("Contact", () => {
  test("lists e-mail, GitHub and LinkedIn with label-first rows", async ({ page }) => {
    await page.goto("./?mode=hr");
    const rows = page.locator("#contact .contact-list a");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0).locator(".contact-label")).toHaveText("E-Mail");
    await expect(rows.nth(0)).toHaveAttribute("href", "mailto:bennyriezler@gmail.com");
    await expect(rows.nth(1).locator(".contact-label")).toContainText("GitHub");
    await expect(rows.nth(1)).toHaveAttribute("href", "https://github.com/Benriez");
    await expect(rows.nth(2).locator(".contact-label")).toContainText("LinkedIn");
    await expect(rows.nth(2)).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/benjamin-riezler-239b61181/",
    );
    await expect(rows.nth(2).locator(".contact-value")).toHaveText(
      "linkedin.com/in/benjamin-riezler-239b61181",
    );
  });
});

test.describe("Semantics", () => {
  test("landmarks, heading order and hero facts are well-formed", async ({ page }) => {
    await page.goto("./?mode=hr");
    await expect(page.locator("h1")).toHaveCount(1);
    for (const id of SECTIONS) {
      await expect(page.locator(`#${id}[aria-labelledby]`)).toHaveCount(1);
    }
    await expect(page.locator(".hero-panel dt")).toHaveCount(4);
    await expect(page.locator(".hero-stack li")).toHaveCount(8);
    await expect(page.locator(".education-list > li")).toHaveCount(3);
    await expect(page.locator("#capabilities .tech-stack-title [data-view='hr']")).toHaveText(
      "Technischer Stack",
    );
    await expect(page.locator("dt h3, dt h4, time")).toHaveCount(0);
  });

  test("no horizontal overflow in either mode", async ({ page }) => {
    for (const mode of ["hr", "engineering"]) {
      await page.goto(`./?mode=${mode}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, mode).toBeLessThanOrEqual(0);
    }
  });
});
