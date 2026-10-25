import { describe, expect, it } from "vitest";
import { projects } from "~/data/projects";
import { experience } from "~/data/experience";
import { capabilities } from "~/data/capabilities";
import { techStack } from "~/data/tech-stack";
import { education } from "~/data/education";
import { formatProjectMeta, projectStatusLabels } from "~/data/project-status";

const PLACEHOLDER_PATTERNS = [
  /\[handle\]/i,
  /\[email@[\w.-]+\.de\]/i,
  /\[website\.de\]/i,
  /\[name\]/i,
  /\[TODO\]/i,
  /\[TBD\]/i,
];

const LITERAL_BLOCKLIST = [
  "/Users/benny",
  "/Users/benny/Code/agent-garden",
  "/Users/benny/Code/Portfolio/opendesign",
  "/Users/benny/.bodin",
  "Tailscale",
  "GOPATH",
];

function flatten(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flatten).join("\n");
  if (value && typeof value === "object") {
    return Object.values(value).map(flatten).join("\n");
  }
  return "";
}

describe("Public content data", () => {
  it("projects never contain unresolved placeholders", () => {
    const text = flatten(projects);
    for (const pat of PLACEHOLDER_PATTERNS) {
      expect(text).not.toMatch(pat);
    }
  });

  it("experience never contains unresolved placeholders", () => {
    const text = flatten(experience);
    for (const pat of PLACEHOLDER_PATTERNS) {
      expect(text).not.toMatch(pat);
    }
  });

  it("capabilities never contain unresolved placeholders", () => {
    const text = flatten(capabilities);
    for (const pat of PLACEHOLDER_PATTERNS) {
      expect(text).not.toMatch(pat);
    }
  });

  it("tech-stack never contains unresolved placeholders", () => {
    const text = flatten(techStack);
    for (const pat of PLACEHOLDER_PATTERNS) {
      expect(text).not.toMatch(pat);
    }
  });

  it("education never contains unresolved placeholders", () => {
    const text = flatten(education);
    for (const pat of PLACEHOLDER_PATTERNS) {
      expect(text).not.toMatch(pat);
    }
  });

  it("public content never embeds private Agent Garden paths", () => {
    const allText = [projects, experience, capabilities, techStack, education]
      .map(flatten)
      .join("\n");
    for (const needle of LITERAL_BLOCKLIST) {
      expect(allText.toString()).not.toContain(needle);
    }
  });

  it("every project has a meaningful lead in at least one mode", () => {
    for (const p of projects) {
      // HR is always required; engineering may be empty for compact entries.
      expect(p.lead.hr.length).toBeGreaterThan(20);
    }
  });

  it("assigns the canonical project maturity status", () => {
    expect(Object.fromEntries(projects.map((p) => [p.title, p.status]))).toEqual({
      "BODI / agent-garden": "active-development",
      Fahrschule360: "live",
      "Shopping-Pong": "live",
      "Production Web Platform Migration": "live",
      UScreen: "active-development",
    });
  });

  it("renders project meta without injecting an extra status label", () => {
    for (const project of projects) {
      const meta = formatProjectMeta(project.meta, project.status);
      // OpenDesign reference presents maturity through copy, not via a badge.
      // The status type still exists for downstream classification — it
      // must NOT leak into the rendered meta.
      expect(meta.hr).toBe(project.meta.hr);
      expect(meta.engineering).toBe(project.meta.engineering);
      const label = projectStatusLabels[project.status];
      expect(meta.hr.includes(label)).toBe(false);
      expect(meta.engineering.includes(label)).toBe(false);
    }
  });

  it("Fahrschule360 surfaces self-hosted infrastructure ownership in Engineering mode", () => {
    const f360 = projects.find((p) => p.id === "fahrschule360");
    expect(f360, "Fahrschule360 project entry must exist").toBeDefined();
    const text = `${f360!.lead.engineering} ${f360!.roleLine} ${(f360!.pointsEngineering ?? []).join(" ")} ${(f360!.stack ?? []).join(" ")} ${(f360!.integration ?? []).join(" ")}`;
    // Self-hosted production infrastructure is the key signal.
    expect(text).toMatch(/selbst (gehostet|betrieben)|Self-hosted/i);
    // CapRover is named explicitly as the deployment/orchestration tool.
    expect(text).toMatch(/CapRover/);
    // Multi-server / long-term operational responsibility.
    expect(text).toMatch(/Multi-Server|Infrastruktur|Betrieb|Wartung/i);
    // No claim of cloud-managed hyperscaler / Kubernetes / HA cluster.
    for (const overclaim of [
      /Kubernetes/i,
      /hyperscale/i,
      /\bHA[- ]cluster\b/i,
      /zero[- ]downtime/i,
      /autoscal/i,
      /24\/7 NOC/i,
      /\bSRE team\b/i,
    ]) {
      expect(text, `unsupported overclaim: ${overclaim}`).not.toMatch(overclaim);
    }
  });
});

const USCREEN_PRIMARY_LINK = "https://benriez.github.io/uscreen/";
const USCREEN_HARDWARE_TESTED_RELEASE = "v0.2.0-preview.3";
const USCREEN_DEVELOPMENT_RELEASE = "v0.3.0-dev.1";

describe("UScreen selected-work entry", () => {
  const uscreen = projects.find((p) => p.id === "uscreen");

  it("is exactly one primary Selected Work project", () => {
    expect(projects.filter((p) => p.title === "UScreen")).toHaveLength(1);
    expect(uscreen, "UScreen project entry must exist").toBeDefined();
  });

  it("keeps the Selected Work set at exactly five primary projects", () => {
    expect(projects).toHaveLength(5);
  });

  it("leaves no Odoo project entry behind", () => {
    expect(projects.filter((p) => /odoo/i.test(p.title))).toHaveLength(0);
    expect(projects.filter((p) => /odoo/i.test(p.id))).toHaveLength(0);
    expect(projects.filter((p) => /base_automation/i.test(JSON.stringify(p)))).toHaveLength(0);
  });

  it("is dated 2026 and flagged as active development", () => {
    expect(uscreen!.index).toBe("2026");
    expect(uscreen!.period.start).toBe("2026");
    expect(uscreen!.status).toBe("active-development");
    expect(uscreen!.meta.hr).toMatch(/Aktive Entwicklung/i);
    expect(uscreen!.meta.engineering).toMatch(/Aktive Entwicklung/i);
  });

  it("surfaces the core cross-platform technology stack", () => {
    for (const token of ["Rust", "Swift", "Kotlin"]) {
      expect(uscreen!.stack, `stack must contain ${token}`).toContain(token);
    }
    expect(uscreen!.stack.join(" ")).toMatch(/macOS/);
    expect(uscreen!.stack.join(" ")).toMatch(/Android/);
    expect(uscreen!.stack.join(" ")).toMatch(/USB \/ ADB/);
  });

  it("links the project website as the primary CTA", () => {
    expect(uscreen!.caseLinks?.[0]?.href).toBe(USCREEN_PRIMARY_LINK);
  });

  it("separates the hardware-tested release from the development release", () => {
    const meta = uscreen!.meta.engineering;
    // Both release identifiers are named so the distinction is visible.
    expect(meta).toContain(USCREEN_HARDWARE_TESTED_RELEASE);
    expect(meta).toContain(USCREEN_DEVELOPMENT_RELEASE);
    // The hardware-tested release is stated as hardware accepted.
    expect(meta).toMatch(/v0\.2\.0-preview\.3 hardware-abgenommen/);
    // The development release is explicitly stated as NOT hardware accepted.
    expect(meta).toMatch(/v0\.3\.0-dev\.1 ohne Hardware-Abnahme/);
    // It must never be labelled stable or production ready.
    for (const overclaim of [
      /stabil/i,
      /stable/i,
      /production[- ]ready/i,
      /hardware[- ]verified/i,
    ]) {
      expect(meta, `unsupported overclaim: ${overclaim}`).not.toMatch(overclaim);
    }
  });

  it("never presents the project as finished or fully hardware verified", () => {
    const text = [
      uscreen!.meta.hr,
      uscreen!.meta.engineering,
      uscreen!.lead.hr,
      uscreen!.lead.engineering,
      uscreen!.roleLine ?? "",
      ...(uscreen!.pointsHr ?? []),
      ...(uscreen!.pointsEngineering ?? []),
    ].join(" ");
    for (const overclaim of [
      /fully hardware[- ]verified/i,
      /hardware[- ]vollständig/i,
      /production complete/i,
      /production[- ]fertig/i,
      /stable release/i,
      /fertiggestellt/i,
      /abgeschlossen und/i,
    ]) {
      expect(text, `unsupported overclaim: ${overclaim}`).not.toMatch(overclaim);
    }
  });

  it("scopes the performance figures to their benchmark", () => {
    const text = (uscreen!.pointsEngineering ?? []).join(" ");
    // The headline figure must stay attached to the controlled benchmark.
    expect(text).toMatch(/54[–-]55,6 FPS im kontrollierten Bewegungsbenchmark/);
    // The live-session capture rate must be preserved as a separate figure.
    expect(text).toMatch(/28,8[–-]43 FPS/);
    // A blanket "runs at 55 FPS" claim is not allowed.
    expect(text).not.toMatch(/läuft mit 55 FPS|runs at 55 FPS/);
  });
});
