import type { CapabilityGroup, DualCopy } from "~/types/content";

/**
 * Capability groups extracted verbatim from the OpenDesign reference.
 *
 * Four groups, in reference order, each with HR + Engineering variants.
 *
 *   01. AI & Automation  /  AI & Agent Systems
 *   02. Software Engineering  /  Full-Stack Engineering
 *   03. Production & Operations  /  Production Engineering
 *   04. Technical Product Management  /  Product Engineering
 *
 * The reference renders each group's body as a single line of skill tokens
 * separated by " · "; we preserve that in a single SkillItem per group.
 */

interface ReferenceCapability {
  readonly id: string;
  readonly number: string;
  readonly heading: DualCopy;
  readonly body: DualCopy;
}

const REFERENCE: ReadonlyArray<ReferenceCapability> = [
  {
    id: "ai-automation",
    number: "01",
    heading: {
      hr: "AI & Automation",
      engineering: "AI & Agent Systems",
    },
    body: {
      hr: "Autonome KI-Workflows · zuverlässige Ausführung · Memory · MCP · LLM Integration",
      engineering:
        "Agent Runtime · Durable Execution Graphs · Memory Governance · Supervisor / Recovery · MCP · LLM Integration · Agent Reliability",
    },
  },
  {
    id: "software-engineering",
    number: "02",
    heading: {
      hr: "Software Engineering",
      engineering: "Full-Stack Engineering",
    },
    body: {
      hr: "TypeScript · Angular · Node.js / Express · Python · Django / DRF · Authentication · WebSockets",
      engineering:
        "TypeScript · Angular · Node.js / Express · Python · Django / DRF · Authentication · WebSockets",
    },
  },
  {
    id: "production-operations",
    number: "03",
    heading: {
      hr: "Production & Operations",
      engineering: "Production Engineering",
    },
    body: {
      hr: "Docker · CapRover · Linux · Reliability · Root-Cause Analysis · Recovery Engineering",
      engineering:
        "Docker · CapRover · Linux · Reliability · Root-Cause Analysis · Recovery Engineering",
    },
  },
  {
    id: "technical-product-management",
    number: "04",
    heading: {
      hr: "Technical Product Management",
      engineering: "Product Engineering",
    },
    body: {
      hr: "Architecture · Systems Thinking · Technical Product Management · Requirements Engineering · Lifecycle Ownership",
      engineering:
        "Architecture · Systems Thinking · Technical Product Management · Requirements Engineering · Lifecycle Ownership",
    },
  },
];

/**
 * Convert the four reference capabilities into the typed CapabilityGroup
 * shape, keeping each group's content as a single SkillItem for layout
 * parity with the reference (the reference renders one body line per card).
 *
 * We expose the capability number as a separate `number` field on the
 * SkillItem so the layout can render the mono "01" .. "04" label exactly
 * as the reference does.
 */
export interface CapabilityItemWithNumber {
  readonly label: string;
  readonly hint?: { hr: string; engineering: string };
  readonly number: string;
}

export const capabilities: (CapabilityGroup & { readonly number: string })[] = REFERENCE.map(
  (r) => {
    const skill: CapabilityItemWithNumber = {
      label: r.body.hr,
      number: r.number,
    };
    if (r.body.engineering !== r.body.hr) {
      (skill as { hint?: { hr: string; engineering: string } }).hint = {
        hr: r.body.hr,
        engineering: r.body.engineering,
      };
    }
    return {
      number: r.number,
      heading: r.heading,
      skills: [skill],
    };
  },
);

export const referenceCapabilities: ReadonlyArray<ReferenceCapability> = REFERENCE;
