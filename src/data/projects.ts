import type { ProjectEntry } from "~/types/content";

/**
 * Project set extracted verbatim from the OpenDesign reference.
 *
 * Five projects, in reference order, with all bilingual fields captured
 * exactly as the reference HTML defines them:
 *
 *   1. BODI / agent-garden  (2026)
 *   2. Fahrschule360         (2020-2026)
 *   3. Shopping-Pong         (2025 – heute)
 *   4. Production Web Platform Migration (2025-2026, compact)
 *   5. UScreen               (2026, compact)
 *
 * Entry 5 was intentionally replaced: the former Odoo Add-on Suite
 * project was retired in favour of UScreen. The set stays at five
 * primary Selected Work projects; UScreen takes the freed slot
 * in place and keeps the established order.
 */

const Flagship: ProjectEntry = {
  id: "bodi-agent-garden",
  index: "2026",
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
    hr: "Mitentwicklung und langfristige Verantwortung für Entwicklung und Betrieb einer selbst gehosteten Server-Infrastruktur für das produktive B2B-VR-Trainingssystem, das VR-Headsets, Backend, Windows-Teacher-App und automatisierte Medienverarbeitung zu einem gemeinsamen Trainingssystem verbindet.",
    engineering:
      "Backend-, Integrations-, Infrastruktur-, Betriebs- und Geräte-Lifecycle-Verantwortung in einem produktiven Django-/VR-System mit Multi-Tenant-Struktur, selbst betriebener Multi-Server-Infrastruktur, containerisierter GPU-/Media-Pipeline und eigener Job-Orchestrierung.",
  },
  roleLine:
    "Zwei-Personen-Entwicklerteam · vom Einstieg als Werkstudent über Full-Stack-Entwicklung bis zur selbstständigen Weiterbetreuung · langfristige Backend-, Integrations-, Infrastruktur-, Geräte-Lifecycle- und Betriebsverantwortung",
  pointsHr: [
    "Langjährige Verantwortung für Entwicklung und Betrieb einer selbst gehosteten Server-Infrastruktur für das produktive System.",
    "Produktives B2B-System für Fahrschulen mit Backend, VR-Brillen, Teacher App und automatisierter Medienverarbeitung.",
    "Integration von VR-/Teacher-App-Workflows, Geräte-Lifecycle, GPU-Pipeline und Kundeneinsatz.",
    "Provisionierung, Messeauftritte und Live-Demonstrationen im realen Produkteinsatz.",
  ],
  pointsEngineering: [
    "Django / DRF, PostgreSQL, Multi-Tenant, Roles / Permissions, Licensing und REST APIs.",
    "WebRTC-Synchronisierung zwischen Pico-G2-VR-Brille und Windows Teacher App inklusive Geräte- und Session-Integration.",
    "Containerisierte GPU-/Media-Pipeline mit Docker API, Topaz Video AI und FFmpeg/ffprobe für automatisierte HLS-/WebM-Ausgabe.",
    "Eigene Job-Orchestrierung mit UUID-basiertem Job-State, Worker-Lifecycle, Preflight, Exit-/Log-Auswertung, kontrolliertem Cleanup und CPU-Fallback.",
    "Langjähriger Betrieb einer selbst gehosteten Multi-Server-Infrastruktur mit CapRover für Deployment, Service-Betrieb und produktive Wartung über die Projektlaufzeit.",
    "OTA, Staged Rollouts, Hotfix-Pfade, S3-kompatibler Object Storage, Health Checks, Log-Tail, Container-Inspektion und produktive Runtime-Härtung.",
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
    "Linux",
    "Self-hosted Infrastructure",
  ],
  integration: [
    "VR Hardware ↔ Windows Teacher App ↔ Django Backend ↔ WebRTC / APIs ↔ Docker / GPU Processing ↔ Self-hosted Infrastructure / CapRover ↔ Deployment · Device Lifecycle",
  ],
  status: "live",
  period: { start: "2020", end: "2026" },
};

const ShoppingPong: ProjectEntry = {
  id: "shopping-pong",
  index: "2025 – heute",
  title: "Shopping-Pong",
  meta: {
    hr: "2025 – heute · Zwei-Personen-Team",
    engineering: "2025 – heute · Zwei-Personen-Team",
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
  period: { start: "2025" },
  caseLinks: [
    { href: "https://shoppingpong.shop/", label: "Website" },
    {
      href: "https://merkurist.de/mainz/shoppingpong-tischtennis-spielen-jetzt-auch-bei-schlechtem-wetter-in-mainz-mombach_kzXI",
      label: "Presseartikel",
    },
  ],
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

const UScreen: ProjectEntry = {
  id: "uscreen",
  index: "2026",
  title: "UScreen",
  meta: {
    hr: "2026 · Aktive Entwicklung",
    engineering:
      "2026 · Aktive Entwicklung · v0.2.0-preview.3 hardware-abgenommen · v0.3.0-dev.1 ohne Hardware-Abnahme",
  },
  sub: {
    hr: "Nativer macOS-Zweitbildschirm für Android-Tablets",
    engineering: "Native macOS Extended Display for Android Tablets",
  },
  lead: {
    hr: "Cross-Platform-Systementwicklung für einen nativen macOS-Zweitbildschirm auf Android-Tablets: Display-Integration, USB-Streaming, Android-Receiver und Touch-Rückkanal mit Rust, Swift und Kotlin.",
    engineering:
      "Native macOS-/Android-System, das ein Android-Tablet als echten erweiterten macOS-Desktop einbindet. Rust-Backend, native Swift-Integration, hardwarebeschleunigter Android-Receiver und lokale USB/ADB-Übertragung.",
  },
  roleLine:
    "Eigenständige Systementwicklung über macOS, Android, Streaming, Gerätekommunikation und Runtime-Lifecycle",
  pointsHr: [
    "Android-Tablet als echter erweiterter macOS-Desktop – kein Mirroring, sondern ein registriertes virtuelles Display.",
    "Lokale USB/ADB-Übertragung ohne Cloud-Dienst; Touch-Eingaben des Tablets werden zu Zeiger- und Scroll-Events auf dem Mac.",
    "Schwerpunkte: Systems Engineering, Performance-Optimierung, Hardware-Tests und zuverlässige Release-Prozesse.",
  ],
  pointsEngineering: [
    "Rust-Backend für USB-Kommunikation, Session-Lifecycle, Supervisor und Sicherheitsmechanismen.",
    "Native Swift-Integration für virtuelle Displays, Screen Capture und Eingabesteuerung unter macOS – inklusive WindowServer-/ColorSync-Lifecycle und nicht offiziell unterstützter Display-Schnittstellen.",
    "Kotlin-/MediaCodec-Receiver auf Android mit Touch-Rückkanal zum Mac, adaptiert aus dem MIT-lizenzierten UScreen-Projekt; erweiterter Desktop sowie Tippen und Ziehen auf M1 Pro mit DOOGEE U12 verifiziert.",
    "Capture-/Streaming-Pipeline optimiert bis auf ca. 54–55,6 FPS im kontrollierten Bewegungsbenchmark; 28,8–43 FPS Capture bei normaler Fensterbewegung, dokumentiert stabile Session über 3 h.",
    "Stable-/Development-Trennung mit Installationsschutz, Rollback und Hardware-Abnahmeprozess nach Problemen mit experimentellen Releases; 988 von 990 Rust-Tests je Konfiguration und 20 Android-JVM-Tests zum Entwicklungsabschluss bestanden.",
  ],
  stack: [
    "Rust",
    "Swift",
    "Kotlin",
    "macOS",
    "Android",
    "USB / ADB",
    "MediaCodec",
    "Systems Engineering",
  ],
  integration: [
    "macOS Virtual Display ↔ Screen Capture ↔ Encode ↔ USB / ADB ↔ Android Receiver ↔ Touch Input ↔ Mac",
  ],
  status: "active-development",
  period: { start: "2026" },
  compact: true,
  caseLinks: [
    { href: "https://benriez.github.io/uscreen/", label: "Projektseite" },
    {
      href: "https://github.com/Benriez/uscreen/releases/tag/v0.2.0-preview.3",
      label: "Release v0.2.0-preview.3",
    },
  ],
};

export const projects: ProjectEntry[] = [
  Flagship,
  Fahrschule360,
  ShoppingPong,
  ProductionWebPlatform,
  UScreen,
];
