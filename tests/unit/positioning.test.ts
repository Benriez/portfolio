// tests/unit/positioning.test.ts
//
// POSITIONING CONTRACT — the public professional positioning.
//
// The portfolio positions itself as "Software & AI Systems Engineer":
// software architecture + agentic AI systems + systems integration +
// production operation. These assertions pin that positioning down and
// guard the hard project-set freeze.
//
// They are semantic assertions on the content model, not on rendered
// markup; the rendered counterpart lives in tests/e2e/portfolio.spec.ts.

import { describe, expect, it } from "vitest";
import { heroLead, heroPanel, heroPrimaryRole, heroSpecialization, heroStack } from "~/data/hero";
import { approachParagraphs } from "~/data/approach";
import { projects } from "~/data/projects";

const PRIMARY_ROLE = "Software & AI Systems Engineer";

const SELECTED_WORK_TITLES = [
  "BODI / agent-garden",
  "Fahrschule360",
  "Shopping-Pong",
  "Production Web Platform Migration",
  "UScreen",
] as const;

describe("Hero positioning", () => {
  it("states the canonical primary role", () => {
    expect(heroPrimaryRole).toBe(PRIMARY_ROLE);
  });

  it("no longer uses the superseded top-level professional label", () => {
    expect(heroPrimaryRole).not.toMatch(/Applied AI/i);
    expect(heroLead).not.toMatch(/Applied AI/i);
    expect(heroSpecialization).not.toMatch(/Applied AI/i);
  });

  it("states the specialization line with Agentic AI and Production Engineering", () => {
    expect(heroSpecialization).toContain("Full-Stack");
    expect(heroSpecialization).toContain("Agentic AI");
    expect(heroSpecialization).toContain("Production Engineering");
  });

  it("keeps the hero lead concise and covers the full delivery chain", () => {
    // One paragraph, not a marketing block.
    expect(heroLead.length).toBeLessThan(220);
    for (const concept of [
      /Produktanforderung/i,
      /Architektur/i,
      /Implementierung/i,
      /Production/i,
      /Reliability/i,
      /AI-System/i,
    ]) {
      expect(heroLead, `hero lead must mention ${concept}`).toMatch(concept);
    }
  });

  it("keeps the technology line a positioning line, not a skill wall", () => {
    expect(heroStack.length).toBeLessThanOrEqual(8);
    for (const token of [
      "TypeScript",
      "Python",
      "Rust",
      "AI Agent Systems",
      "Production Engineering",
      "Systems Integration",
    ]) {
      expect(heroStack, `hero stack must contain ${token}`).toContain(token);
    }
  });

  it("keeps the factual side facts unchanged", () => {
    const text = heroPanel.map((p) => `${p.keyLabel} ${p.valueLabel.hr}`).join(" ");
    expect(text).toContain("Darmstadt · Deutschland");
    expect(text).toContain("Softwareentwicklung seit 2020");
  });
});

describe("Selected Work project set (hard freeze)", () => {
  it("keeps exactly five primary Selected Work projects", () => {
    expect(projects).toHaveLength(5);
  });

  it("keeps the approved project set and order", () => {
    expect(projects.map((p) => p.title)).toEqual([...SELECTED_WORK_TITLES]);
  });

  it("keeps exactly one entry per approved project", () => {
    for (const title of SELECTED_WORK_TITLES) {
      expect(projects.filter((p) => p.title === title)).toHaveLength(1);
    }
  });

  it("does not contain a Steuerkompass Selected Work project", () => {
    expect(projects.filter((p) => /steuerkompass/i.test(p.title))).toHaveLength(0);
    expect(projects.filter((p) => /steuerkompass/i.test(p.id))).toHaveLength(0);
    expect(projects.filter((p) => /steuerkompass/i.test(JSON.stringify(p)))).toHaveLength(0);
  });

  it("does not contain an Odoo Selected Work project", () => {
    expect(projects.filter((p) => /odoo/i.test(p.title))).toHaveLength(0);
    expect(projects.filter((p) => /odoo/i.test(p.id))).toHaveLength(0);
    expect(projects.filter((p) => /base_automation/i.test(JSON.stringify(p)))).toHaveLength(0);
  });
});

describe("BODI selected-work entry", () => {
  const bodi = projects.find((p) => p.id === "bodi-agent-garden");

  it("exists and stays in active development", () => {
    expect(bodi, "BODI project entry must exist").toBeDefined();
    expect(bodi!.status).toBe("active-development");
  });

  it("communicates controlled AI execution instead of generic 'AI agents'", () => {
    const text = `${bodi!.sub.hr} ${bodi!.lead.hr} ${bodi!.lead.engineering}`;
    for (const concept of [
      /Agent Runtime/i,
      /Harness/i,
      /Execution Graph/i,
      /Memory \/ State/i,
      /Tool Use/i,
      /Verification/i,
      /Recovery/i,
      /Model Routing/i,
      /Inference/i,
    ]) {
      expect(text, `BODI copy must mention ${concept}`).toMatch(concept);
    }
  });

  it("never claims BODI is finished", () => {
    const text = `${bodi!.meta.hr} ${bodi!.lead.hr} ${bodi!.lead.engineering}`;
    for (const overclaim of [/fertiggestellt/i, /abgeschlossen/i, /production[- ]fertig/i]) {
      expect(text, `unsupported overclaim: ${overclaim}`).not.toMatch(overclaim);
    }
  });
});

describe("Working Approach", () => {
  const text = approachParagraphs.join("\n");

  it("explains AI-assisted, verification-driven engineering", () => {
    for (const concept of [
      /AI-gestützte Entwicklung/i,
      /Engineering-Werkzeug/i,
      /Architektur/i,
      /Tests/i,
      /Typechecks/i,
      /E2E/i,
      /Runtime-Evidence/i,
      /Hardware-Abnahme/i,
    ]) {
      expect(text, `working approach must mention ${concept}`).toMatch(concept);
    }
  });

  it("keeps requirements engineering, root-cause analysis, recovery and production ownership", () => {
    expect(text).toContain("Requirements Engineering");
    expect(text).toContain("Root-Cause Analysis");
    expect(text).toContain("Recovery Thinking");
    expect(text).toContain("Production Ownership");
  });

  it("names no commercial model or vendor in public copy", () => {
    for (const vendor of [
      /\bClaude\b/,
      /\bGPT\b/,
      /\bAstra\b/,
      /\bOpenAI\b/,
      /\bGemini\b/,
      /\bCopilot\b/,
    ]) {
      expect(text, `public copy must not name ${vendor}`).not.toMatch(vendor);
    }
  });

  it("stays a compact three-paragraph section", () => {
    expect(approachParagraphs).toHaveLength(3);
  });
});
