import type { DualCopy } from "~/types/content";

/**
 * Hero content model.
 *
 * The hero carries the portfolio's positioning surface: the primary role,
 * the specialization line, the lead paragraph, the technology line and the
 * side facts.
 *
 * Keeping the copy in `src/data/` (next to the other content payloads)
 * makes it assertable from the unit tests and keeps `Hero.astro` a pure
 * rendering surface — the layout and the content stay decoupled.
 */

/**
 * Canonical public-facing role label.
 *
 * The portfolio is not a generic Full-Stack or generic-AI profile: it
 * combines software architecture, agentic AI systems, systems integration
 * and production operation. This label states that combination.
 */
export const heroPrimaryRole = "Software & AI Systems Engineer";
/**
 * Concise specialization line under the role label.
 *
 * Split into segments so the line can break cleanly between the segments
 * on narrow viewports instead of splitting a single concept.
 */
export const heroSpecializationSegments: ReadonlyArray<string> = [
  "Full-Stack",
  "Agentic AI",
  "Production Engineering",
];

/** Joined form of the specialization line (semantic contract). */
export const heroSpecialization = heroSpecializationSegments.join(" · ");

/**
 * Hero lead paragraph. Rendered identically in HR and Engineering mode —
 * the reference design does not split the hero lead either.
 */
export const heroLead =
  "Ich entwickle und betreibe Softwaresysteme von der Produktanforderung über Architektur und Implementierung bis Production, Reliability und agentischen AI-Systemen.";

/**
 * Technology / focus line. Positioning only — not a complete inventory of
 * every technology ever used.
 */
export const heroStack: ReadonlyArray<string> = [
  "TypeScript",
  "Python",
  "Rust",
  "Angular",
  "Django",
  "AI Agent Systems",
  "Production Engineering",
  "Systems Integration",
];

export interface HeroPanelItem {
  readonly keyLabel: string;
  readonly valueLabel: DualCopy;
}

/** Side facts of the hero panel. */
export const heroPanel: ReadonlyArray<HeroPanelItem> = [
  {
    keyLabel: "Modus",
    valueLabel: {
      hr: "HR · Produkt, Rolle &amp; Verantwortung",
      engineering: "Engineering · Architektur &amp; technische Tiefe",
    },
  },
  {
    keyLabel: "Fokus",
    valueLabel: {
      hr: "Software · AI Systems · Production",
      engineering: "Software · AI Systems · Production",
    },
  },
  {
    keyLabel: "Erfahrung",
    valueLabel: {
      hr: "Softwareentwicklung seit 2020",
      engineering: "Softwareentwicklung seit 2020",
    },
  },
  {
    keyLabel: "Standort",
    valueLabel: {
      hr: "Darmstadt · Deutschland",
      engineering: "Darmstadt · Deutschland",
    },
  },
];

export const heroGitHubUrl = "https://github.com/Benriez";
export const heroEmail = "bennyriezler@gmail.com";
