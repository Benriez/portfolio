import type { ProjectEntry } from "~/types/content";

/**
 * Project set extracted verbatim from the OpenDesign reference.
 *
 * Five projects, in reference order, with all bilingual fields captured
 * exactly as the reference HTML defines them:
 *
 *   1. BODI / agent-garden  (Flagship)
 *   2. Fahrschule360         (2020-2026)
 *   3. Shopping-Pong         (2026)
 *   4. Production Web Platform Migration (2025-2026, compact)
 *   5. Odoo Add-on Suite     (2026, compact)
 */

const Flagship: ProjectEntry = {
  id: "bodi-agent-garden",
  index: "Flagship",
  title: "BODI / agent-garden",
  meta: {
    hr: "Self-hosted AI Operator Platform · seit 2026",
    engineering: "Self-hosted AI Operator Platform · seit 2026",
  },
  sub: {
    hr: "AI Operator Runtime & Inference Platform",
    engineering: "AI Operator Runtime & Inference Platform",
  },
  lead: {
    hr: "BODI verbindet langlebige KI-Workflows mit selbst betriebener AI-Infrastruktur. Aufgaben werden als persistente Abläufe ausgeführt, Zustand und Kontext bleiben erhalten und lokale KI-Modelle werden über eine gemeinsame Produktionsschnittstelle kontrolliert bereitgestellt.",
    engineering:
      "Production-grade Runtime für agentische Software-Arbeit und self-hosted Inference: Durable Execution Graphs, Memory Governance, Managed OpenCode Execution, Model Scheduling, Queueing, Recovery und nachvollziehbare Runtime-Provenance.",
  },
  stack: [],
  status: "active-development",
  period: { start: "2026" },
};

const Fahrschule360: ProjectEntry = {
  id: "fahrschule360",
  index: "2020-2026",
  title: "Fahrschule360",
  meta: {
    hr: "2020-2026 · Werkstudent → Full-Stack Developer → selbstständige Weiterbetreuung",
    engineering: "2020-2026 · Werkstudent → Full-Stack Developer → selbstständige Weiterbetreuung",
  },
  sub: {
    hr: "B2B-VR-Trainingsplattform für Fahrschulen",
    engineering: "B2B-VR-Trainingsplattform für Fahrschulen",
  },
  lead: {
    hr: "Mitentwicklung und langfristige Betreuung einer produktiven Plattform, die VR-Headsets, Backend, Windows-Teacher-App und automatisierte Medienverarbeitung zu einem gemeinsamen Trainingssystem verbindet.",
    engineering:
      "Backend-, Integrations-, Betriebs- und Geräte-Lifecycle-Verantwortung in einem produktiven Django-/VR-System mit Multi-Tenant-Struktur, containerisierter GPU-/Media-Pipeline und eigener Job-Orchestrierung.",
  },
  roleLine:
    "Zwei-Personen-Entwicklerteam · vom Einstieg als Werkstudent über Full-Stack-Entwicklung bis zur selbstständigen Weiterbetreuung · langfristige Backend-, Integrations-, Geräte-Lifecycle- und Betriebsverantwortung",
  pointsHr: [
    "Produktives B2B-System für Fahrschulen mit Backend, VR-Brillen, Teacher App und automatisierter Medienverarbeitung.",
    "Integration von VR-/Teacher-App-Workflows, Geräte-Lifecycle, GPU-Pipeline und Kundeneinsatz.",
    "Provisionierung, Messeauftritte und Live-Demonstrationen im realen Produkteinsatz.",
  ],
  pointsEngineering: [
    "Django / DRF, PostgreSQL, Multi-Tenant, Roles / Permissions, Licensing und REST APIs.",
    "WebRTC-Synchronisierung zwischen Pico-G2-VR-Brille und Windows Teacher App inklusive Geräte- und Session-Integration.",
    "Containerisierte GPU-/Media-Pipeline mit Docker API, Topaz Video AI und FFmpeg/ffprobe für automatisierte HLS-/WebM-Ausgabe.",
    "Eigene Job-Orchestrierung mit UUID-basiertem Job-State, Worker-Lifecycle, Preflight, Exit-/Log-Auswertung, kontrolliertem Cleanup und CPU-Fallback.",
    "OTA, Staged Rollouts, Hotfix-Pfade, CapRover, S3-kompatibler Object Storage und produktive Runtime-Härtung (Health Checks, Log-Tail, Container-Inspektion).",
  ],
  stack: [
    "Python",
    "Django / DRF",
    "PostgreSQL",
    "WebRTC",
    "Docker",
    "CapRover",
    "FFmpeg",
    "Topaz Video AI",
    "NVIDIA GPU",
    "Windows",
    "Pico G2",
  ],
  integration: [
    "VR Hardware ↔ Windows Teacher App ↔ Django Backend ↔ WebRTC / APIs ↔ Docker / GPU Processing ↔ Deployment · Device Lifecycle",
  ],
  status: "live",
  period: { start: "2020", end: "2026" },
};

const ShoppingPong: ProjectEntry = {
  id: "shopping-pong",
  index: "2026",
  title: "Shopping-Pong",
  meta: {
    hr: "2026 · Zwei-Personen-Team",
    engineering: "2026 · Zwei-Personen-Team",
  },
  sub: {
    hr: "Automatisierte Laden- & Spielinfrastruktur",
    engineering: "Automatisierte Laden- & Spielinfrastruktur",
  },
  lead: {
    hr: "Gemeinsame Konzeption, Aufbau, Inbetriebnahme und Betrieb einer automatisierten Tischtennis-Location von Online-Buchung und Payment bis Zutritt, Netzwerk und lokaler Spielsteuerung.",
    engineering:
      "Cyber-physisches System mit Web-/Payment-Schicht, lokaler Venue-Infrastruktur, Android-Kiosk, ESP-Tastern, Smart-Home-Steuerung und CapRover Production.",
  },
  roleLine:
    "Zwei-Personen-Team · Web-/Payment-Schicht, Venue-Infrastruktur und Production-Betrieb · eigenständige Test- und Release-Verantwortung",
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
  integration: ["Web / Payment ↔ Netzwerk ↔ Raspberry Pi ↔ ESP32 / Smart Home ↔ Android Kiosk"],
  status: "live",
  period: { start: "2026" },
};

const ProductionWebPlatform: ProjectEntry = {
  id: "production-web-platform",
  index: "2025–2026",
  title: "Production Web Platform Migration",
  meta: { hr: "", engineering: "" },
  sub: {
    hr: "CMS-, Deployment- und Go-Live-Migration",
    engineering: "Production migration with CI/CD, OAuth and controlled cutover",
  },
  lead: {
    hr: "Migration einer bestehenden Unternehmenswebsite auf eine neue produktive Hosting- und Deployment-Infrastruktur mit Git-basierter Content-Pipeline, CMS-Zugriff, Formular-/Mail-Integration und kontrolliertem Production-Cutover.",
    engineering: "",
  },
  roleLine:
    "Technische Verantwortung für Deployment-Architektur, CMS-Integration, Authentifizierung, Release-Prozess, Produktionsumschaltung und Post-Go-Live-Verifikation",
  pointsEngineering: [
    "Git-basierte Build- und Deployment-Pipeline mit explizitem Staging- und Production-Mode sowie reproduzierbaren Builds.",
    "Git-basiertes CMS mit OAuth-Login über einen serverseitigen Auth-Proxy und strikter Host-Allowlist.",
    "Kontrollierter Production-Domain-Cutover inklusive Canonical- und Indexierbarkeits-Gates, Redirect-Verhalten und Rollback-Vorbereitung.",
    "Production-Verifikation für CMS, Formularzustellung, TLS, Routing und Release-Provenienz des deployten Artefakts.",
  ],
  stack: ["GitHub Actions", "IONOS Deploy Now", "Sveltia CMS", "Eleventy", "PHP", "OAuth", "SMTP"],
  status: "live",
  period: { start: "2025", end: "2026" },
  compact: true,
};

const OdooAddonSuite: ProjectEntry = {
  id: "odoo-addon-suite",
  index: "2026",
  title: "Odoo Add-on Suite",
  meta: { hr: "", engineering: "" },
  sub: {
    hr: "ERP-Erweiterung für Geschäftsprozesse",
    engineering: "Odoo-19-Suite mit 16 verzahnten Modulen",
  },
  lead: {
    hr: "ERP-Erweiterung zur Digitalisierung und Verbindung von CRM, Kunden-Onboarding, Dokumentenfluss und operativen Geschäftsprozessen.",
    engineering: "",
  },
  roleLine:
    "Konzipiert und implementiert als modulare Suite mit Workflow-Logik, Security-Modell und CRM-Integration",
  pointsEngineering: [
    "Modellierung realer Kanzlei- und Geschäftsprozesse über Workflow-Steps und explizite Zustandsübergänge.",
    "Activities und base_automation für automatisierte Folgeaktionen und operative Prozesssteuerung.",
    "Rollen-, Berechtigungs- und Record-Rule-Modell für saubere Zugriffstrennung.",
    "Dokumentanforderungen und CRM-/Kundenintegration über die modulare Suite hinweg.",
    "Analyse von Persistenz-, Session- und Workflow-Problemen sowie E2E-Verifikation produktiver Abläufe.",
  ],
  stack: ["Python", "Odoo", "PostgreSQL", "XML", "base_automation"],
  status: "live",
  period: { start: "2026" },
  compact: true,
};

export const projects: ProjectEntry[] = [
  Flagship,
  Fahrschule360,
  ShoppingPong,
  ProductionWebPlatform,
  OdooAddonSuite,
];
