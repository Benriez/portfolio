import type { DualCopy, TechStackGroup } from "~/types/content";

/**
 * Tech-stack groups extracted verbatim from the OpenDesign reference.
 *
 * Four groups, in reference order, each with HR + Engineering variants.
 *
 *   Primary       · TypeScript · Python · JavaScript · Angular · Django / DRF · Node.js / Express
 *   AI / Systems  · Agent Orchestration · Durable Execution · Memory Systems · Managed OpenCode · Self-hosted LLMs · Inference Gateway · Multi-tenant API · Model Scheduling / Queueing · MCP · Evaluation / Reliability
 *   Infrastructure · Docker · CapRover · Linux · Windows Server 2022 · RDS · PowerShell · NTFS / ACL · Microsoft 365 · Exchange Online · PostgreSQL · nginx · DigitalOcean · AWS EC2 / S3
 *   Additional    · Electron · Odoo · WordPress / PHP · FastAPI · Playwright · Raspberry Pi · ESP32 / ESP-IDF · MQTT · OpenWrt · FFmpeg
 *
 * The reference renders these as a definition list: a 150px mono-uppercase
 * label column beside a comma-separated items column.
 */

interface ReferenceTechStackGroup {
  readonly id: string;
  readonly heading: DualCopy;
  readonly items: ReadonlyArray<string>;
}

const REFERENCE: ReadonlyArray<ReferenceTechStackGroup> = [
  {
    id: "primary",
    heading: {
      hr: "Primary",
      engineering: "Primary",
    },
    items: ["TypeScript", "Python", "JavaScript", "Angular", "Django / DRF", "Node.js / Express"],
  },
  {
    id: "ai-systems",
    heading: {
      hr: "AI / Systems",
      engineering: "AI / Systems",
    },
    items: [
      "Agent Orchestration",
      "Durable Execution",
      "Memory Systems",
      "Managed OpenCode",
      "Self-hosted LLMs",
      "Inference Gateway",
      "Multi-tenant API",
      "Model Scheduling / Queueing",
      "MCP",
      "Evaluation / Reliability",
    ],
  },
  {
    id: "infrastructure",
    heading: {
      hr: "Infrastructure",
      engineering: "Infrastructure",
    },
    items: [
      "Docker",
      "CapRover",
      "Linux",
      "Windows Server 2022",
      "RDS",
      "PowerShell",
      "NTFS / ACL",
      "Microsoft 365",
      "Exchange Online",
      "PostgreSQL",
      "nginx",
      "DigitalOcean",
      "AWS EC2 / S3",
    ],
  },
  {
    id: "additional",
    heading: {
      hr: "Additional",
      engineering: "Additional",
    },
    items: [
      "Electron",
      "Odoo",
      "WordPress / PHP",
      "FastAPI",
      "Playwright",
      "Raspberry Pi",
      "ESP32 / ESP-IDF",
      "MQTT",
      "OpenWrt",
      "FFmpeg",
    ],
  },
];

export const techStack: TechStackGroup[] = REFERENCE.map((r) => ({
  heading: r.heading,
  items: [...r.items],
}));

export type ReferenceTechStackGroupData = ReferenceTechStackGroup;
export const referenceTechStack: ReadonlyArray<ReferenceTechStackGroupData> = REFERENCE;
