import { describe, expect, it } from "vitest";
import { projects } from "~/data/projects";
import { experience } from "~/data/experience";
import { capabilities } from "~/data/capabilities";
import { techStack } from "~/data/tech-stack";
import { education } from "~/data/education";

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
      expect(allText).not.toContain(needle);
    }
  });

  it("every project has a meaningful lead in at least one mode", () => {
    for (const p of projects) {
      // HR is always required; engineering may be empty for compact entries.
      expect(p.lead.hr.length).toBeGreaterThan(20);
    }
  });
});
