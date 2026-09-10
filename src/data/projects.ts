import type { ProjectEntry } from "~/types/content";

/**
 * Curated project entries.
 *
 * IMPORTANT:
 *  Resolve any unresolved contact-style placeholders (GitHub handle,
 *  email, personal-website) before the public release. Until then,
 *  keep `link` undefined.
 */
export const projects: ProjectEntry[] = [
  {
    id: "agent-garden",
    title: "Agent Garden — bounded autonomous execution",
    customer: {
      hr: "Eigenes Vorhaben",
      engineering: "Personal / open-source semantic-authority project",
    },
    role: {
      hr: "Gründer und alleiniger Engineer",
      engineering: "Founder & sole engineer · durable runtime + supervisor + memory",
    },
    stack: ["TypeScript", "Node 22", "SQLite", "Bridge / Telegram", "Vitest"],
    summary: {
      hr:
        "Eine offene Referenzimplementierung für deterministische, wiederaufnehmbare KI-Agenten-Läufe " +
        "mit Supervisor, Bounded Retries und nachvollziehbarem Laufzustand.",
      engineering:
        "Reference implementation of a durable, resumable agent runtime with supervisor-recovery, " +
        "bounded attempt budget, durable graph execution, and an auditable memory gate.",
    },
    impact: [
      {
        hr: "Klare Verantwortlichkeit: jede Aktion ist rückverfolgbar im Audit-Log.",
        engineering:
          "Every node mutation is persisted before forward propagation; failures replay deterministically.",
      },
      {
        hr: "Robust gegen lange Läufe ohne externe Steuerung.",
        engineering:
          "Bounded attempt budget (3) with explicit recovery vs. exhausted-failure terminal state.",
      },
    ],
    status: "ongoing",
    period: { start: "2025-09" },
  },
  {
    id: "kaimuk-thaimassage",
    title: "Kaimuk Thai-Massage — produktive Geschäftsseite",
    customer: {
      hr: "Lokales Unternehmen, Darmstadt",
      engineering: "Local SME, Darmstadt",
    },
    role: {
      hr: "Engineering und Konzept",
      engineering: "Full-stack delivery · Docker Compose + WordPress",
    },
    stack: ["PHP", "WordPress", "Docker Compose", "Mailgun SMTP"],
    summary: {
      hr:
        "Mehrsprachige Firmen-Webseite mit Termin-Anfrage, abgesicherter Zustellung " +
        "und kontinuierlichem Betrieb seit 2024.",
      engineering:
        "Trilingual WordPress site behind nginx-proxy + hardened WordPress container, " +
        "reverse-proxied TLS via mkcert, transactional mail routed through Mailgun.",
    },
    impact: [
      {
        hr: "Sichtbar auf Google für die Region, regelmäßige Terminanfragen.",
        engineering: "PageSpeed Lighthouse ≥ 90 on mobile; A11y ≥ 95; Core Web Vitals green.",
      },
      {
        hr: "Wartungsfreundlich: klare Container-Grenzen, reproduzierbare Deploys.",
        engineering: "Container-per-service isolation; reproducible bootstrap via `make up`.",
      },
    ],
    status: "shipped",
    period: { start: "2024-01", end: "2024-08" },
    link: {
      href: "https://kaimuk-thaimassage.de",
      label: { hr: "Webseite", engineering: "Live site" },
    },
  },
  {
    id: "operational-data-pipelines",
    title: "Operational Data Pipelines — Werksdatenanalyse",
    customer: {
      hr: "Industrielles mittelständisches Unternehmen",
      engineering: "Industrial SME",
    },
    role: {
      hr: "Engineering und Delivery",
      engineering: "Lead engineer · end-to-end data platform",
    },
    stack: ["Python", "PostgreSQL", "Airflow", "dbt"],
    summary: {
      hr:
        "Tagesaktuelle Auswertungen aus Maschinendaten, visualisiert für Werksleitung und Schichtleiter. " +
        "Reduzierte Reaktionszeit bei Abweichungen.",
      engineering:
        "Idempotent ingestion of machine telemetry into PostgreSQL with Airflow orchestration " +
        "and dbt transformations; observation dashboards surfaced anomalies within minutes.",
    },
    impact: [
      {
        hr: "Berichte stehen morgens vor Schichtbeginn automatisch bereit.",
        engineering: "Pipeline SLA < 30 min for the morning shift briefing window.",
      },
      {
        hr: "Nachvollziehbare Datenherkunft in jeder Auswertung.",
        engineering:
          "Lineage + test coverage on every transformation via dbt + Great Expectations.",
      },
    ],
    status: "shipped",
    period: { start: "2022-03", end: "2023-06" },
  },
];
