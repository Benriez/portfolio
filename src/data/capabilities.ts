import type { CapabilityGroup, DualCopy } from "~/types/content";

/**
 * Capability groups extracted verbatim from the OpenDesign reference.
 *
 * Four groups, in reference order, each with HR + Engineering variants.
 *
 *   01. AI & Automation          /  AI & Agent Systems
 *   02. Software & Systems Eng.  /  Full-Stack & Systems Integration
 *   03. Production & Operations  /  Production Engineering
 *   04. Technical Product Mgmt   /  Product Engineering
 *
 * The reference renders each group's body as a single line of skill tokens
 * separated by " · "; we preserve that in a single SkillItem per group.
 *
 * The group headings still mirror the reference verbatim. The bodies were
 * sharpened for the Software & AI Systems positioning: they now name the
 * concrete engineering work behind each domain instead of a token wall.
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
      hr: "Agentische Workflows · Agent Runtime · lokale Inferenz · Memory · Tool Use · Verifikation · Recovery · Model Routing · AI-gestützte Entwicklung",
      engineering:
        "Agent Runtime · Durable Execution Graphs · Tool Use · Memory / State · Verification · Recovery · Local Inference · Model Routing / Scheduling · Managed Agent Execution · MCP · AI-assisted Engineering",
    },
  },
  {
    id: "software-systems-engineering",
    number: "02",
    heading: {
      hr: "Software & Systems Engineering",
      engineering: "Full-Stack & Systems Integration",
    },
    body: {
      hr: "TypeScript · Python · Angular · Django / DRF · Rust · APIs · Authentication · WebSockets / WebRTC · Systems Integration · Geräte-Integration",
      engineering:
        "TypeScript · Python · Rust · Angular · Django / DRF · APIs · Authentication · WebSockets / WebRTC · Native Integration · Cross-Platform Systems · Device Communication · Systems Integration",
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
      hr: "Docker · Linux · CapRover · Windows Server / RDS · Self-hosted Infrastructure · CI/CD · Deployment · Production Debugging · Root-Cause Analysis · Reliability Engineering · Release Engineering",
      engineering:
        "Docker · Linux · CapRover · Windows Server / RDS · Self-hosted Infrastructure · CI/CD · Deployment · Production Debugging · Root-Cause Analysis · Reliability Engineering · Release Engineering",
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
      hr: "Architecture · Systems Thinking · Technical Product Engineering · Requirements Engineering · Lifecycle Ownership",
      engineering:
        "Architecture · Systems Thinking · Technical Product Engineering · Requirements Engineering · Lifecycle Ownership",
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
