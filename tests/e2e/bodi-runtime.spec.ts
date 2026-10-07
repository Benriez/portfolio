import { test, expect } from "@playwright/test";

test.describe("BODI flagship system architecture", () => {
  test("renders the static architecture diagram in HR mode", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship).toBeVisible();
    await expect(flagship.locator("h2", { hasText: "agent-garden / BODI" })).toBeVisible();
    await expect(flagship.locator(".bodi-map-stage")).toBeVisible();
    await expect(flagship.locator(".bodi-node--input")).toBeVisible();
    await expect(flagship.locator(".bodi-node--core")).toBeVisible();
    await expect(flagship.locator(".bodi-node--output")).toBeVisible();
    await expect(flagship.locator(".bodi-node--models")).toBeVisible();
  });

  test("renders Engineering-only stage labels in Engineering mode", async ({ page }) => {
    await page.goto("./?mode=engineering#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship).toBeVisible();
    // Engineering stages include "Durable Execution Graph"
    await expect(
      flagship.locator(".bodi-stage-name", { hasText: "Durable Execution Graph" }),
    ).toBeVisible();
    await expect(
      flagship.locator(".bodi-stage-name", { hasText: "Delivery Safety" }),
    ).toBeVisible();
    // HR stages are CSS-hidden (display: none) under body[data-mode=engineering]
    for (const li of await flagship.locator("li.hr-only").all()) {
      await expect(li).toBeHidden();
    }
  });

  test("exposes the local-model layer with the canonical names", async ({ page }) => {
    await page.goto("./?mode=engineering#flagship");
    const models = page.locator(".bodi-node--models");
    await expect(models).toBeVisible();
    await expect(models.getByText("Ornith")).toBeVisible();
    await expect(models.getByText("Qwen")).toBeVisible();
    await expect(models.getByText("Decision")).toBeVisible();
    await expect(models.getByText("lokal betrieben · privat · kontrolliert")).toBeVisible();
  });

  test("renders the recovery label and curve", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-recovery")).toBeAttached();
    await expect(flagship.locator(".bodi-recovery-label")).toContainText("RECOVERY & FORTSETZUNG");
  });

  test("renders Problem / System / Reliability case-grid", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".case-grid")).toBeVisible();
    await expect(flagship.getByText("01 Problem")).toBeVisible();
    await expect(flagship.getByText("02 System")).toBeVisible();
    await expect(flagship.getByText("03 Reliability")).toBeVisible();
  });

  test("renders Production Evidence with the key/value list", async ({ page }) => {
    await page.goto("./?mode=engineering#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-evidence")).toBeVisible();
    await expect(flagship.locator(".bodi-evidence-list dt", { hasText: "Access" })).toBeVisible();
    await expect(
      flagship.locator(".bodi-evidence-list dd", { hasText: "Tenant-isolated API keys" }),
    ).toBeVisible();
    await expect(
      flagship.locator(".bodi-evidence-list dt", { hasText: "Dispatch Safety" }),
    ).toBeVisible();
  });

  test("renders the provenance chain Source → Build → Release → Runtime", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    const steps = flagship.locator(".bodi-provenance li.is-verified");
    await expect(steps).toHaveCount(4);
    await expect(steps.nth(0)).toContainText("Source");
    await expect(steps.nth(1)).toContainText("Build");
    await expect(steps.nth(2)).toContainText("Release");
    await expect(steps.nth(3)).toContainText("Runtime");
  });

  test("renders Queue Replay and Durable Dispatch reliability stories", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-replay", { hasText: "Queue Replay" })).toBeVisible();
    await expect(
      flagship.locator(".bodi-replay--dispatch", { hasText: "Durable Dispatch" }),
    ).toBeVisible();
    await expect(
      flagship.locator(".bodi-replay-steps span", { hasText: "Reproduce" }),
    ).toBeVisible();
    await expect(
      flagship.locator(".bodi-replay-steps span", { hasText: "Production verification" }),
    ).toBeVisible();
  });

  test("is static — no animation timer or token", async ({ page }) => {
    await page.goto("./?mode=engineering#flagship");
    // No rt-runtime elements should leak from the old runtime visualization.
    await expect(page.locator("[data-bodi-runtime]")).toHaveCount(0);
    await expect(page.locator(".rt-token")).toHaveCount(0);
  });

  test("respects prefers-reduced-motion (still renders the full diagram)", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("./?mode=engineering#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-map-stage")).toBeVisible();
    await expect(flagship.locator(".bodi-node--core")).toBeVisible();
    await context.close();
  });
});
