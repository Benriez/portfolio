import { test, expect } from "@playwright/test";

test.describe("Portfolio shell", () => {
  test("renders the hero, sections, and no maintenance page", async ({ page }) => {
    await page.goto("./");
    // Maintenance page must no longer be visible.
    await expect(page.getByRole("heading", { level: 1, name: /wartung/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Benjamin Riezler" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
  });

  test("supports HR mode via query parameter", async ({ page }) => {
    await page.goto("./?mode=hr");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "hr");
  });

  test("supports Engineering mode via query parameter", async ({ page }) => {
    await page.goto("./?mode=engineering");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "engineering");
  });

  test("toggles via UI without a full reload", async ({ page }) => {
    await page.goto("./?mode=hr");
    await page.waitForFunction(() => document.body.dataset["mode"] === "hr");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "hr");
    await page.getByRole("button", { name: "Engineering", exact: true }).click();
    await page.waitForFunction(() => document.body.dataset["mode"] === "engineering");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "engineering");
  });

  test("renders the canonical primary role and specialization line", async ({ page }) => {
    for (const mode of ["hr", "engineering"]) {
      await page.goto(`./?mode=${mode}`);
      const role = page.locator(".hero .role");
      await expect(role).toHaveText("Software & AI Systems Engineer");
      // The superseded top-level label is gone from the hero.
      await expect(role).not.toContainText("Applied AI");
      const spec = page.locator(".hero .role-spec");
      await expect(spec).toContainText("Full-Stack");
      await expect(spec).toContainText("Agentic AI");
      await expect(spec).toContainText("Production Engineering");
      // The lead keeps the full delivery chain in one concise paragraph.
      const lead = page.locator(".hero .heroLead");
      await expect(lead).toContainText("Produktanforderung");
      await expect(lead).toContainText("Architektur");
      await expect(lead).toContainText("Production");
      await expect(lead).toContainText("Reliability");
      await expect(lead).toContainText("AI-Systemen");
    }
  });

  test("shows the AI-assisted, verification-driven engineering paragraph in both modes", async ({
    page,
  }) => {
    for (const mode of ["hr", "engineering"]) {
      await page.goto(`./?mode=${mode}#about`);
      const approach = page.locator("#about .approach-list");
      await expect(approach).toContainText("AI-gestützte Entwicklung");
      await expect(approach).toContainText("Engineering-Werkzeug");
      await expect(approach).toContainText("Typechecks");
      await expect(approach).toContainText("E2E-Prüfungen");
      await expect(approach).toContainText("Runtime-Evidence");
      await expect(approach).toContainText("Hardware-Abnahmen");
      await expect(approach).toContainText("Production Ownership");
    }
  });

  test("renders the exact OpenDesign project set in order", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    const headings = page.locator("#work .work-body h3");
    await expect(headings).toHaveCount(5);
    await expect(headings.nth(0)).toHaveText("BODI / agent-garden");
    await expect(headings.nth(1)).toHaveText("Fahrschule360");
    await expect(headings.nth(2)).toHaveText("Shopping-Pong");
    await expect(headings.nth(3)).toHaveText("Production Web Platform Migration");
    await expect(headings.nth(4)).toHaveText("UScreen");
  });

  test("renders UScreen with active-development status, stack and public links", async ({
    page,
  }) => {
    await page.goto("./?mode=hr#work");
    const uscreen = page.locator("article", {
      has: page.getByRole("heading", { name: "UScreen", exact: true }),
    });
    await expect(uscreen).toHaveCount(1);
    await expect(uscreen.locator(".work-index")).toHaveText("2026");
    await expect(uscreen.locator(".work-meta [data-view='hr']")).toContainText(
      "Aktive Entwicklung",
    );
    const stackLine = uscreen.locator(".stack-items").first();
    await expect(stackLine).toContainText("Rust");
    await expect(stackLine).toContainText("Swift");
    await expect(stackLine).toContainText("Kotlin");
    // The project website is the primary CTA.
    await expect(uscreen.getByRole("link", { name: "Projektseite" })).toHaveAttribute(
      "href",
      "https://benriez.github.io/uscreen/",
    );
  });

  test("does not render the retired Odoo project anywhere in Selected Work", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    await expect(page.getByRole("heading", { name: "Odoo Add-on Suite" })).toHaveCount(0);
    await expect(page.locator("#work")).not.toContainText("Odoo");
    await expect(page.locator("#work")).not.toContainText("base_automation");
    // No dead Odoo anchor or CTA is left behind.
    await expect(page.locator("#odoo-addon-suite")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /odoo/i })).toHaveCount(0);
  });

  test("UScreen Engineering mode keeps the release distinction intact", async ({ page }) => {
    await page.goto("./?mode=engineering#work");
    const uscreen = page.locator("article", {
      has: page.getByRole("heading", { name: "UScreen", exact: true }),
    });
    const meta = uscreen.locator(".work-meta [data-view='engineering']");
    await expect(meta).toContainText("Aktive Entwicklung");
    await expect(meta).toContainText("v0.2.0-preview.3");
    await expect(meta).toContainText("v0.3.0-dev.1");
    await expect(meta).toContainText("ohne Hardware-Abnahme");
    // The development release is never claimed as hardware verified.
    await expect(uscreen).not.toContainText("v0.3.0-dev.1 ist hardware");
    await expect(uscreen).not.toContainText("stable release");
  });

  test("does not render the removed BODI flagship case-study link", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    const caseLink = page.getByRole("link", { name: "Case Study ansehen" });
    await expect(caseLink).toHaveCount(0);
  });

  test("does not render a Steuerkompass project anywhere in Selected Work", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    await expect(page.getByRole("heading", { name: /Steuerkompass/i })).toHaveCount(0);
    await expect(page.locator("#work")).not.toContainText(/Steuerkompass/i);
  });

  test("renders BODI as controlled agent execution with an active-development stack", async ({
    page,
  }) => {
    await page.goto("./?mode=engineering#work");
    const bodi = page.locator("article", {
      has: page.getByRole("heading", { name: "BODI / agent-garden" }),
    });
    await expect(bodi).toHaveCount(1);
    await expect(bodi.locator(".work-sub")).toContainText("Agent Runtime");
    await expect(bodi.locator(".work-lead")).toContainText("Tool Use");
    await expect(bodi.locator(".work-lead")).toContainText("Verification");
    await expect(bodi.locator(".work-lead")).toContainText("Recovery");
    await expect(bodi.locator(".stack-items").first()).toContainText("Self-hosted Inference");
  });

  test("does not expose a #flagship anchor on the page", async ({ page }) => {
    await page.goto("./?mode=hr");
    await expect(page.locator("#flagship")).toHaveCount(0);
    await expect(page.locator(".flagship-section")).toHaveCount(0);
  });

  test("renders BODI with '2026' as the left meta and no 'Flagship' label", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    const bodi = page.locator("article", {
      has: page.getByRole("heading", { name: "BODI / agent-garden" }),
    });
    await expect(bodi.locator(".work-index")).toHaveText("2026");
    await expect(bodi.locator(".work-index")).not.toContainText("Flagship");
    await expect(bodi.locator(".work-meta [data-view='hr']")).toContainText(
      "Self-hosted AI Operator Platform",
    );
  });

  test("renders Shopping-Pong as ongoing with '2025 – heute' and live status", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    const shoppingPong = page.locator("article", {
      has: page.getByRole("heading", { name: "Shopping-Pong" }),
    });
    await expect(shoppingPong.locator(".work-index")).toHaveText("2025 – heute");
    await expect(shoppingPong.locator(".work-meta [data-view='hr']")).toContainText("2025 – heute");
    await expect(shoppingPong.locator(".work-meta [data-view='hr']")).not.toContainText(
      "In aktiver Entwicklung",
    );
    await expect(shoppingPong.locator(".work-meta [data-view='hr']")).not.toContainText(
      "Live / Production",
    );
    // No stale "2026" date on Shopping-Pong anywhere in the project card.
    await expect(shoppingPong).not.toContainText("2026");
  });

  test("renders Shopping-Pong with website and press links exactly once", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    const shoppingPong = page.locator("article", {
      has: page.getByRole("heading", { name: "Shopping-Pong" }),
    });
    const website = shoppingPong.getByRole("link", { name: "Website" });
    const press = shoppingPong.getByRole("link", { name: "Presseartikel" });
    await expect(website).toHaveCount(1);
    await expect(press).toHaveCount(1);
    await expect(website).toHaveAttribute("href", "https://shoppingpong.shop/");
    await expect(press).toHaveAttribute(
      "href",
      "https://merkurist.de/mainz/shoppingpong-tischtennis-spielen-jetzt-auch-bei-schlechtem-wetter-in-mainz-mombach_kzXI",
    );
    // No duplicated rendering of either reference.
    await expect(shoppingPong.locator('a[href="https://shoppingpong.shop/"]')).toHaveCount(1);
    await expect(
      shoppingPong.locator(
        'a[href="https://merkurist.de/mainz/shoppingpong-tischtennis-spielen-jetzt-auch-bei-schlechtem-wetter-in-mainz-mombach_kzXI"]',
      ),
    ).toHaveCount(1);
    // The links stay part of the project card, not a separate CTA block.
    await expect(shoppingPong.locator(".case-links .case-link")).toHaveCount(2);
  });

  test("Shopping-Pong external links are rendered in both modes", async ({ page }) => {
    for (const mode of ["hr", "engineering"]) {
      await page.goto(`./?mode=${mode}#work`);
      const shoppingPong = page.locator("article", {
        has: page.getByRole("heading", { name: "Shopping-Pong" }),
      });
      await expect(shoppingPong.getByRole("link", { name: "Website" })).toBeVisible();
      await expect(shoppingPong.getByRole("link", { name: "Presseartikel" })).toBeVisible();
      // The period stays open-ended in both modes.
      await expect(shoppingPong.locator(".work-index")).toHaveText("2025 – heute");
    }
  });

  test("does not render any CV / Print button in Hero or Contact", async ({ page }) => {
    await page.goto("./?mode=hr");
    const allButtons = page.getByRole("button", { name: /cv.*print|print/i });
    await expect(allButtons).toHaveCount(0);
    await expect(page.locator("[data-print]")).toHaveCount(0);
  });

  test("mobile header at 390px is compact and shows BR, all nav links, and a compact mode switch", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./?mode=hr");
    const header = page.locator(".site-header");
    await expect(header).toBeVisible();
    // BR lettermark is visible
    await expect(page.locator(".brand")).toContainText("BR");
    // All six nav destinations are present (5 sections + GitHub).
    const linkTexts = await page.locator(".nav-links a").allTextContents();
    expect(linkTexts.map((t) => t.trim())).toEqual([
      "Projekte",
      "Berufserfahrung",
      "Kompetenzen",
      "Arbeitsweise",
      "Kontakt",
      "GitHub",
    ]);
    // Both mode buttons are visible and the active mode is pressed.
    const hrButton = page.getByRole("button", { name: "HR", exact: true });
    const engineeringButton = page.getByRole("button", { name: "Engineering", exact: true });
    await expect(hrButton).toBeVisible();
    await expect(engineeringButton).toBeVisible();
    await expect(hrButton).toHaveAttribute("aria-pressed", "true");
    await expect(engineeringButton).toHaveAttribute("aria-pressed", "false");
    // The mobile header is compact: the bounding box of the header is
    // well under 200px tall (was 219px before the redesign).
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(headerBox!.height).toBeLessThan(180);
    // No horizontal page overflow.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("mobile header at 430px still keeps all six nav destinations visible without overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto("./?mode=hr");
    const linkTexts = await page.locator(".nav-links a").allTextContents();
    expect(linkTexts.map((t) => t.trim())).toEqual([
      "Projekte",
      "Berufserfahrung",
      "Kompetenzen",
      "Arbeitsweise",
      "Kontakt",
      "GitHub",
    ]);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("desktop header at 1440px is unchanged: 4-column grid with GitHub and full mode labels", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("./?mode=hr");
    // All six destinations are visible.
    const linkTexts = await page.locator(".nav-links a").allTextContents();
    expect(linkTexts.map((t) => t.trim())).toEqual([
      "Projekte",
      "Berufserfahrung",
      "Kompetenzen",
      "Arbeitsweise",
      "Kontakt",
      "GitHub",
    ]);
    // Full "Engineering" label (not "Eng") on desktop.
    await expect(page.getByRole("button", { name: "Engineering", exact: true })).toBeVisible();
    // Desktop header is the original 69px-ish row.
    const headerBox = await page.locator(".site-header").boundingBox();
    expect(headerBox!.height).toBeLessThan(80);
  });

  test("project meta carries period and tagline without an extra status label", async ({
    page,
  }) => {
    await page.goto("./?mode=hr#work");

    const fahrschule360 = page.locator("article", {
      has: page.getByRole("heading", { name: "Fahrschule360" }),
    });
    await expect(fahrschule360.locator(".work-meta [data-view='hr']")).toContainText("2020-2026");
    await expect(fahrschule360.locator(".work-meta [data-view='hr']")).not.toContainText(
      "In aktiver Entwicklung",
    );

    const bodi = page.locator("article", {
      has: page.getByRole("heading", { name: "BODI / agent-garden" }),
    });
    await expect(bodi.locator(".work-meta [data-view='hr']")).toContainText(
      "Self-hosted AI Operator Platform",
    );
  });
});

test.describe("Accessibility", () => {
  test("has a skip link and main landmark", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".skip-link")).toBeAttached();
    await expect(page.getByRole("main")).toBeVisible();
  });
});
