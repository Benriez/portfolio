import { test, expect } from "@playwright/test";

/**
 * BODI flagship — redesigned as a focused editorial system map.
 *
 * The section must communicate BODI's role within ~15-25 seconds: a
 * concise intro, one strong visualization (Task → BODI → Verified Result),
 * three engineering points, and a compact role + evidence line. None of
 * the legacy problem/system/reliability case-grid, evidence dl, or replay
 * stories remain.
 */

test.describe("BODI flagship — editorial system map", () => {
  test("renders the section with eyebrow, title, status, and concise intro", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship).toBeVisible();
    await expect(
      flagship.locator(".eyebrow", { hasText: "Flagship Engineering System" }),
    ).toBeVisible();
    await expect(flagship.locator("h2", { hasText: "agent-garden / BODI" })).toBeVisible();
    await expect(flagship.locator(".bodi-status")).toContainText("In aktiver Entwicklung");
    await expect(flagship.locator(".bodi-intro.hr-only")).toContainText(
      "BODI ist eine selbst betriebene AI Operator Platform",
    );
  });

  test("renders the canonical system visualization: Task → BODI → Verified Result", async ({
    page,
  }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-viz")).toBeVisible();
    await expect(flagship.locator(".bodi-viz-end--input")).toContainText("Aufgabe & Kontext");
    await expect(flagship.locator(".bodi-viz-core")).toBeVisible();
    await expect(flagship.locator(".bodi-viz-end--output")).toContainText("Verified Result");
    await expect(flagship.locator(".bodi-viz-end-list")).toContainText("artifacts");
    await expect(flagship.locator(".bodi-viz-end-list")).toContainText("verification");
    await expect(flagship.locator(".bodi-viz-end-list")).toContainText("provenance");
  });

  test("renders the five-stage execution loop inside the BODI block", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const stages = page.locator(".bodi-viz-stages .bodi-viz-name");
    await expect(stages).toHaveCount(5);
    await expect(stages.nth(0)).toHaveText("Plan");
    await expect(stages.nth(1)).toHaveText("Execute");
    await expect(stages.nth(2)).toHaveText("Verify");
    await expect(stages.nth(3)).toHaveText("Persist");
    await expect(stages.nth(4)).toHaveText("Continue");
  });

  test("renders the recovery arc returning into execution", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    // The static recovery SVG is part of the desktop visualization.
    await expect(flagship.locator(".bodi-viz-recovery")).toBeAttached();
    await expect(flagship.locator(".bodi-viz-recovery-line")).toHaveCount(1);
    await expect(flagship.locator(".bodi-viz-recovery-label")).toContainText("Recovery");
  });

  test("compresses local inference to a single labelled row", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const inference = page.locator(".bodi-viz-inference");
    await expect(inference).toBeVisible();
    await expect(inference.locator(".bodi-viz-inference-key")).toContainText("Local Inference");
    await expect(inference.locator(".bodi-viz-inference-names")).toContainText("Ornith");
    await expect(inference.locator(".bodi-viz-inference-names")).toContainText("Qwen");
    await expect(inference.locator(".bodi-viz-inference-names")).toContainText("Decision");
  });

  test("renders three engineering points after the visualization", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const points = page.locator(".bodi-point");
    await expect(points).toHaveCount(3);
    await expect(points.nth(0).locator(".bodi-point-title")).toHaveText("Durable Execution");
    await expect(points.nth(1).locator(".bodi-point-title")).toHaveText("Recovery & Verification");
    await expect(points.nth(2).locator(".bodi-point-title")).toHaveText("Local AI Infrastructure");
  });

  test("renders a compact role line and evidence strip", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-role-line")).toContainText("Architecture");
    await expect(flagship.locator(".bodi-role-line")).toContainText("Production Engineering");
    await expect(flagship.locator(".bodi-evidence-strip")).toContainText("Persistent State");
    await expect(flagship.locator(".bodi-evidence-strip")).toContainText("Provenance");
  });

  test("does not retain legacy problem/system/reliability case-grid", async ({ page }) => {
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".case-grid")).toHaveCount(0);
    await expect(flagship.locator(".bodi-engineering-ownership")).toHaveCount(0);
    await expect(flagship.locator(".bodi-reliability-engineering")).toHaveCount(0);
    await expect(flagship.locator(".bodi-extra")).toHaveCount(0);
    await expect(flagship.locator(".bodi-evidence")).toHaveCount(0);
    await expect(flagship.locator(".bodi-replay")).toHaveCount(0);
    await expect(flagship.locator(".bodi-provenance")).toHaveCount(0);
    await expect(flagship.locator(".bodi-failure-model")).toHaveCount(0);
  });

  test("renders the Engineering intro variant under engineering mode", async ({ page }) => {
    await page.goto("./?mode=engineering#flagship");
    await page.waitForFunction(() => document.body.dataset["mode"] === "engineering");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-intro.engineering-only")).toContainText(
      "Durable Agent Execution",
    );
    // The five-stage execution loop is shared across modes — same labels
    // in HR and Engineering, since they describe the universal execution
    // flow.
    const stages = page.locator(".bodi-viz-stages .bodi-viz-name");
    await expect(stages.nth(2)).toHaveText("Verify");
  });

  test("is static — no animation timer or runtime token leakage", async ({ page }) => {
    await page.goto("./?mode=engineering#flagship");
    await page.waitForFunction(() => document.body.dataset["mode"] === "engineering");
    await expect(page.locator("[data-bodi-runtime]")).toHaveCount(0);
    await expect(page.locator(".rt-token")).toHaveCount(0);
  });

  test("respects prefers-reduced-motion and still renders the full visualization", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("./?mode=engineering#flagship");
    await page.waitForFunction(() => document.body.dataset["mode"] === "engineering");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-viz-core")).toBeVisible();
    await expect(flagship.locator(".bodi-viz-stages")).toBeVisible();
    await context.close();
  });

  test("collapses to a single-column mobile flow on <=560px viewports", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./?mode=hr#flagship");
    const flagship = page.locator("#flagship");
    await expect(flagship.locator(".bodi-viz-stages")).toBeVisible();
    // On mobile, the recovery SVG overlay is hidden (the down arrows between
    // stages imply the flow) but the recovery label is still present as part
    // of the static document, so the structure remains meaningful.
    const stages = flagship.locator(".bodi-viz-stage");
    await expect(stages).toHaveCount(5);
  });
});
