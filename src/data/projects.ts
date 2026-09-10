import type { ProjectEntry } from "~/types/content";

/**
 * Project set extracted verbatim from the OpenDesign reference.
 *
 * The five projects, in reference order, with all bilingual fields
 * captured exactly as the reference HTML defines them:
 *
 *   1. BODI / agent-garden  (Flagship)
 *   2. Fahrschule360         (2021-2026)
 *   3. Shopping-Pong         (2026)
 *   4. Steuerkompass         (2026, compact)
 *   5. Odoo Add-on Suite     (2026, compact)
 */

const Flagship: ProjectEntry = {
  id: "bodi-agent-garden",
  title: "BODI / agent-garden",
  meta: {
    hr: "AI Operator Control Plane · seit 2026",
    engineering: "AI Operator Control Plane · since 2026",
  },
  sub: {
    hr: "AI Operator Control Plane",
    engineering: "AI Operator Control Plane",
  },
  lead: {
    hr: "Plattform zur zuverlässigen Ausführung autonomer KI-Workflows mit persistentem Zustand, automatischer Fehlerbehandlung und Wiederaufnahme nach Unterbrechungen.",
    engineering:
      "Durable Agent Runtime mit persistenter Workflow-Steuerung, Memory Governance, Recovery und Managed Agent Execution.",
  },
  stack: [],
  status: "ongoing",
  period: { start: "2026" },
  isFlagship: true,
  caseLink: {
    href: "#flagship",
    label: { hr: "Case Study ansehen", engineering: "Case study" },
  },
};

const Fahrschule360: ProjectEntry = {
  id: "fahrschule360",
  title: "Fahrschule360",
  meta: {
    hr: "2021-2026 · Zwei-Personen-Entwicklerteam",
    engineering: "2021-2026 · Two-person engineering team",
  },
  sub: {
    hr: "B2B-VR-Trainingsplattform für Fahrschulen",
    engineering: "B2B VR training platform for driving schools",
  },
  lead: {
    hr: "Mitentwicklung und langfristige Betreuung einer produktiven Plattform, die VR-Headsets, Backend und Windows-Teacher-App zu einem gemeinsamen Trainingssystem verbindet.",
    engineering:
      "Backend-, Integrations-, Betriebs- und Geräte-Lifecycle-Verantwortung in einem produktiven Django-/VR-System mit Multi-Tenant-Struktur.",
  },
  roleLine: {
    hr: "Zwei-Personen-Entwicklerteam · frühe Mitgestaltung von Produkt und Systemarchitektur · langfristige Backend-, Integrations- und Betriebsverantwortung",
    engineering:
      "Two-person engineering team · early co-design of product and system architecture · long-term responsibility for backend, integration and operations",
  },
  pointsHr: [
    "Produktives B2B-System für Fahrschulen mit Backend, VR-Brillen und Teacher App.",
    "Integration von VR-/Teacher-App-Workflows, Geräte-Lifecycle und Kundeneinsatz.",
    "Provisionierung, Messeauftritte und Live-Demonstrationen im realen Produkteinsatz.",
  ],
  pointsEngineering: [
    "Django / DRF, PostgreSQL, Multi-Tenant, Roles / Permissions, Licensing und REST APIs.",
    "WebRTC-Synchronisierung zwischen Pico-G2-VR-Brille und Windows Teacher App.",
    "OTA, Staged Rollouts, Hotfix-Pfade, CapRover und S3-kompatibler Object Storage.",
  ],
  stack: [
    "Python",
    "Django",
    "DRF",
    "PostgreSQL",
    "WebRTC",
    "Windows",
    "Pico G2",
    "Docker",
    "CapRover",
  ],
  status: "shipped",
  period: { start: "2021", end: "2026" },
};

const ShoppingPong: ProjectEntry = {
  id: "shopping-pong",
  title: "Shopping-Pong",
  meta: {
    hr: "2026 · Zwei-Personen-Team",
    engineering: "2026 · Two-person team",
  },
  sub: {
    hr: "Automatisierte Laden- & Spielinfrastruktur",
    engineering: "Automated store and table-tennis venue",
  },
  lead: {
    hr: "Gemeinsame Konzeption, Aufbau, Inbetriebnahme und Betrieb einer automatisierten Tischtennis-Location von Online-Buchung und Payment bis Zutritt, Netzwerk und lokaler Spielsteuerung.",
    engineering:
      "Cyber-physisches System mit Web-/Payment-Schicht, lokaler Venue-Infrastruktur, Android-Kiosk, ESP-Tastern, Smart-Home-Steuerung und CapRover Production.",
  },
  roleLine: {
    hr: "Zwei-Personen-Team · Web-, Payment-, Venue-Infrastruktur- und Production-Arbeit",
    engineering: "Two-person team · web, payment, venue infrastructure and production work",
  },
  pointsHr: [
    "Buchung, Payment, digitaler Zutritt und lokaler Betrieb in einem gemeinsamen Venue-System.",
    "Venue-Infrastruktur mit Netzwerk, Kiosk-Terminal, Smart-Home-Licht und Spielsteuerung.",
  ],
  pointsEngineering: [
    "Angular, Django / DRF, PostgreSQL, PayPal, Same-Origin und Auth-/Payment Failure Analysis.",
    "OpenWrt, Raspberry Pi, MQTT, ESP32, Smart Home, Android Kiosk und lokale Steuerung.",
    "CapRover, Playwright, Dev / Prod separation sowie Environment / DB safety.",
  ],
  stack: [
    "Angular",
    "Django / DRF",
    "PostgreSQL",
    "PayPal",
    "Raspberry Pi",
    "OpenWrt",
    "MQTT",
    "ESP32",
    "Smart Home",
    "CapRover",
    "Playwright",
  ],
  status: "shipped",
  period: { start: "2026" },
};

const Steuerkompass: ProjectEntry = {
  id: "steuerkompass",
  title: "Steuerkompass",
  meta: { hr: "2026", engineering: "2026" },
  sub: {
    hr: "Privacy-first Desktop-Anwendung",
    engineering: "Electron / Angular desktop product",
  },
  lead: {
    hr: "Desktop-Anwendung mit Fokus auf lokale Verarbeitung, kontrollierte Release-Artefakte und eine konsistente, zugängliche Benutzeroberfläche.",
    engineering:
      "Privacy-first desktop application focused on local processing, controlled release artifacts, and a consistent, accessible user interface.",
  },
  pointsEngineering: [
    "Electron, Angular 17, TypeScript, macOS DMG und fail-closed Artifact Verification.",
    "ARIA, Fokus, Kontrast, prefers-reduced-motion und MCP.",
  ],
  stack: ["Angular", "Electron", "TypeScript", "MCP", "macOS"],
  status: "shipped",
  period: { start: "2026" },
  compact: true,
};

const OdooAddonSuite: ProjectEntry = {
  id: "odoo-addon-suite",
  title: "Odoo Add-on Suite",
  meta: { hr: "2026", engineering: "2026" },
  sub: {
    hr: "ERP-Erweiterung für Geschäftsprozesse",
    engineering: "Odoo 19 suite with 16 interlocking modules",
  },
  lead: {
    hr: "ERP-Erweiterung für CRM-, Kunden-, Onboarding-, Dokument- und operative Geschäftsprozesse.",
    engineering:
      "ERP extension for CRM, customer, onboarding, document and operational business processes.",
  },
  pointsEngineering: ["Python, PostgreSQL, XML, base_automation, Activities und CRM Integration."],
  stack: ["Python", "Odoo", "PostgreSQL", "XML"],
  status: "shipped",
  period: { start: "2026" },
  compact: true,
};

export const projects: ProjectEntry[] = [
  Flagship,
  Fahrschule360,
  ShoppingPong,
  Steuerkompass,
  OdooAddonSuite,
];
