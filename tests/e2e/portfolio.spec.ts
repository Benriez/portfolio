import { test, expect } from "@playwright/test";

test.describe("Portfolio shell", () => {
  test("renders the hero, sections, and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /agent-garden|BODI/i })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("supports HR mode via query parameter", async ({ page }) => {
    await page.goto("/?mode=hr");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "hr");
  });

  test("supports Engineering mode via query parameter", async ({ page }) => {
    await page.goto("/?mode=engineering");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "engineering");
  });

  test("toggles via UI without a full reload", async ({ page }) => {
    await page.goto("/?mode=hr");
    await expect(page.locator("body")).toHaveAttribute("data-mode", "hr");
    await page.getByRole("button", { name: "Engineering", exact: true }).click();
    await expect(page.locator("body")).toHaveAttribute("data-mode", "engineering");
  });
});

test.describe("Accessibility", () => {
  test("has a skip link and main landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".skip-link")).toBeAttached();
    await expect(page.getByRole("main")).toBeVisible();
  });
});
