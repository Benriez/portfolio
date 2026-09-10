// tests/unit/content-manifest.test.ts
//
// CONTENT MANIFEST — must match OpenDesign reference exactly.
// Any drift here is a blocking defect for P3 closure.

import { describe, expect, it } from "vitest";
import { projects } from "~/data/projects";
import { experience } from "~/data/experience";
import { education } from "~/data/education";
import { capabilities } from "~/data/capabilities";
import { techStack } from "~/data/tech-stack";

// ---------------------------------------------------------------
// OpenDesign content contract — what the reference promises
// ---------------------------------------------------------------

// EXACT reference project titles, in EXACT reference order.
// Flagship is first, then the four "regular / compact" entries.
const REFERENCE_PROJECT_TITLES = [
  "BODI / agent-garden",
  "Fahrschule360",
  "Shopping-Pong",
  "Steuerkompass",
  "Odoo Add-on Suite",
] as const;

// EXACT reference experience entry titles, in reference order.
const REFERENCE_EXPERIENCE_TITLES = [
  "Selbstständiger Software- & IT-Dienstleister",
  "Werkstudent → Full-Stack Developer",
  "Technischer Produktdesigner",
] as const;

// (Reference experience date ranges and employer strings are documented
//  in src/data/experience.ts.  They are enforced structurally by the
//  employment-records test below.)

// EXACT reference education entries, in reference order.
const REFERENCE_EDUCATION_TITLES = [
  "Technischer Produktdesigner für Maschinen- und Anlagenbau",
  "Fachoberschule Maschinenbau",
  "Hochschule Darmstadt",
] as const;

// EXACT reference capability headings, in reference order.
// Each capability carries both HR and Engineering variants.
const REFERENCE_CAPABILITY_HEADINGS = {
  hr: [
    "AI & Automation",
    "Software Engineering",
    "Production & Operations",
    "Technical Product Management",
  ],
  engineering: [
    "AI & Agent Systems",
    "Full-Stack Engineering",
    "Production Engineering",
    "Product Engineering",
  ],
} as const;

// EXACT reference tech-stack group labels, in reference order.
const REFERENCE_TECH_STACK_LABELS = [
  "Primary",
  "AI / Systems",
  "Infrastructure",
  "Additional",
] as const;

// ---------------------------------------------------------------
// Tests
// ---------------------------------------------------------------

describe("OpenDesign content parity (P3 contract)", () => {
  describe("Selected work", () => {
    it("has the exact project count", () => {
      expect(projects.length).toBe(REFERENCE_PROJECT_TITLES.length);
    });

    it("projects appear in the exact reference order", () => {
      expect(projects.map((p) => p.title)).toEqual([...REFERENCE_PROJECT_TITLES]);
    });
  });

  describe("Experience", () => {
    it("has the exact experience entry count", () => {
      expect(experience.length).toBe(REFERENCE_EXPERIENCE_TITLES.length);
    });

    it("experience entries appear in the exact reference order", () => {
      const titles = experience.map((e) => e.role.hr);
      expect(titles).toEqual([...REFERENCE_EXPERIENCE_TITLES]);
    });

    it("experience date ranges match the reference verbatim", () => {
      const dates = experience.map((e) => e.start);
      // The "heute" suffix is rendered for entries without an end date
      // and is not asserted here; the start date is what matters.
      expect(dates[0]).toBe("06/2022");
      expect(dates[1]).toBe("09/2020");
      expect(dates[2]).toBe("19.06.2015");
    });
  });

  describe("Education", () => {
    it("has the exact education entry count", () => {
      expect(education.length).toBe(REFERENCE_EDUCATION_TITLES.length);
    });

    it("education entries appear in the exact reference order", () => {
      const titles = education.map((e) => e.degree.hr);
      expect(titles).toEqual([...REFERENCE_EDUCATION_TITLES]);
    });

    it("the h_da entry is explicit about 'ohne Abschluss'", () => {
      // The reference says 2017-2021 and 2021-2023 BOTH were 'ohne Abschluss'.
      // Treat neither as a completed degree.
      const hda = education.find((e) => e.institution.hr.toLowerCase().includes("darmstadt"));
      expect(hda).toBeDefined();
      // Ensure we do NOT falsely claim a B.Eng. — the reference lists both
      // program attempts under "Hochschule Darmstadt" without a degree title.
      expect(hda?.degree.hr).not.toMatch(/Bachelor|Master|B\./);
    });
  });

  describe("Capabilities", () => {
    it("has exactly four capability groups", () => {
      expect(capabilities.length).toBe(REFERENCE_CAPABILITY_HEADINGS.hr.length);
    });

    it("capability HR headings match the reference verbatim and in order", () => {
      const headings = capabilities.map((c) => c.heading.hr);
      expect(headings).toEqual([...REFERENCE_CAPABILITY_HEADINGS.hr]);
    });

    it("capability Engineering headings match the reference verbatim and in order", () => {
      const headings = capabilities.map((c) => c.heading.engineering);
      expect(headings).toEqual([...REFERENCE_CAPABILITY_HEADINGS.engineering]);
    });
  });

  describe("Tech stack", () => {
    it("has exactly four tech-stack rows in reference order", () => {
      expect(techStack.length).toBe(REFERENCE_TECH_STACK_LABELS.length);
    });

    it("tech-stack group labels match the reference verbatim and in order", () => {
      const labels = techStack.map((g) => g.heading.hr);
      expect(labels).toEqual([...REFERENCE_TECH_STACK_LABELS]);
    });
  });
});
