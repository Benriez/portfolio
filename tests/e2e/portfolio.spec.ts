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

  test("renders the exact OpenDesign project set in order", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    const headings = page.locator("#work .work-body h3");
    await expect(headings).toHaveCount(5);
    await expect(headings.nth(0)).toHaveText("BODI / agent-garden");
    await expect(headings.nth(1)).toHaveText("Fahrschule360");
    await expect(headings.nth(2)).toHaveText("Shopping-Pong");
    await expect(headings.nth(3)).toHaveText("Production Web Platform Migration");
    await expect(headings.nth(4)).toHaveText("Odoo Add-on Suite");
  });

  test("does not render the removed BODI flagship case-study link", async ({ page }) => {
    await page.goto("./?mode=hr#work");
    const caseLink = page.getByRole("link", { name: "Case Study ansehen" });
    await expect(caseLink).toHaveCount(0);
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

  test("does not render any CV / Print button in Hero or Contact", async ({ page }) => {
    await page.goto("./?mode=hr");
    const allButtons = page.getByRole("button", { name: /cv.*print|print/i });
    await expect(allButtons).toHaveCount(0);
    await expect(page.locator("[data-print]")).toHaveCount(0);
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
