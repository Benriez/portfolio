import { test, expect } from "@playwright/test";

test.describe("Portfolio shell", () => {
  test("renders the hero, sections, and footer", async ({ page }) => {
    await page.goto("./");
    const h1 = page.getByRole("heading", { level: 1 });
    if (await h1.isVisible()) {
      await expect(h1).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { level: 1, name: /wartung/i })).toBeVisible();
      await expect(page.getByText(/kurzfristig nicht erreichbar/)).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    }
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
    await expect(page.locator("body")).toHaveAttribute("data-mode", "hr");
    await page.getByRole("button", { name: "Engineering", exact: true }).click();
    await expect(page.locator("body")).toHaveAttribute("data-mode", "engineering");
  });

  test("renders project maturity labels in selected work", async ({ page }) => {
    await page.goto("./?mode=hr");

    if (await page.getByRole("heading", { level: 1, name: /wartung/i }).isVisible()) {
      test.skip(true, "Portfolio project list unavailable during maintenance");
    }

    const bodi = page.locator("article", {
      has: page.getByRole("heading", { name: "BODI / agent-garden" }),
    });
    const fahrschule360 = page.locator("article", {
      has: page.getByRole("heading", { name: "Fahrschule360" }),
    });
    const shoppingPong = page.locator("article", {
      has: page.getByRole("heading", { name: "Shopping-Pong" }),
    });
    const steuerkompass = page.locator("article", {
      has: page.getByRole("heading", { name: "Steuerkompass" }),
    });
    const odoo = page.locator("article", {
      has: page.getByRole("heading", { name: "Odoo Add-on Suite" }),
    });

    await expect(bodi.locator(".work-meta [data-view='hr']")).toContainText(
      "In aktiver Entwicklung",
    );
    await expect(steuerkompass.locator(".work-meta [data-view='hr']")).toHaveText(
      "In aktiver Entwicklung",
    );
    await expect(fahrschule360.locator(".work-meta [data-view='hr']")).toContainText(
      "Live / Production",
    );
    await expect(shoppingPong.locator(".work-meta [data-view='hr']")).toContainText(
      "Live / Production",
    );
    await expect(odoo.locator(".work-meta [data-view='hr']")).toHaveText("Live / Production");

    await page.getByRole("button", { name: "Engineering", exact: true }).click();
    await expect(bodi.locator(".work-meta [data-view='engineering']")).toContainText(
      "In aktiver Entwicklung",
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
