import type { CapabilityGroup } from "~/types/content";

export const capabilities: CapabilityGroup[] = [
  {
    heading: {
      hr: "Architektur & Engineering",
      engineering: "Architecture & engineering",
    },
    skills: [
      {
        label: "System design",
        hint: {
          hr: "Schnittstellen, Datenflüsse, Trade-offs.",
          engineering: "APIs, data flows, trade-offs.",
        },
      },
      {
        label: "Reliability",
        hint: {
          hr: "Klare Fehlerzustände, Wiederholbarkeit.",
          engineering: "Explicit failure states, deterministic recovery.",
        },
      },
      {
        label: "Operability",
        hint: {
          hr: "Logs, Metriken, On-Call-fähig.",
          engineering: "Logs, metrics, runbook-friendly.",
        },
      },
    ],
  },
  {
    heading: {
      hr: "Sprachen & Frameworks",
      engineering: "Languages & frameworks",
    },
    skills: [
      {
        label: "TypeScript",
        hint: {
          hr: "Anwendungslogik, Backend-Skripte.",
          engineering: "Application logic, backend scripts.",
        },
      },
      {
        label: "Node.js",
        hint: {
          hr: "Langlebige Dienste, isolierte Werkzeuge.",
          engineering: "Long-running services, isolated tooling.",
        },
      },
      {
        label: "Astro / static-first",
        hint: {
          hr: "Schnelle, wartbare öffentliche Oberflächen.",
          engineering: "Fast, maintainable public surfaces.",
        },
      },
      {
        label: "Python",
        hint: {
          hr: "Daten- und Automatisierungs-Skripte.",
          engineering: "Data and automation scripts.",
        },
      },
      {
        label: "PHP",
        hint: {
          hr: "Kleine Kundenportale, WordPress.",
          engineering: "Small customer portals, WordPress.",
        },
      },
    ],
  },
  {
    heading: {
      hr: "Daten & Betrieb",
      engineering: "Data & operations",
    },
    skills: [
      {
        label: "PostgreSQL",
        hint: {
          hr: "Modellierung, Indizes, Migrationspfade.",
          engineering: "Modeling, indexes, migration paths.",
        },
      },
      {
        label: "SQLite",
        hint: {
          hr: "Lokale Beständigkeit ohne Server.",
          engineering: "Local durability without a server.",
        },
      },
      {
        label: "Airflow / dbt",
        hint: {
          hr: "Planbare Datenflüsse, testbare Modelle.",
          engineering: "Schedulable flows, testable models.",
        },
      },
      {
        label: "Docker Compose",
        hint: {
          hr: "Reproduzierbare lokale und kleine Deployments.",
          engineering: "Reproducible local and small-scale deployments.",
        },
      },
    ],
  },
  {
    heading: {
      hr: "Arbeitsweise",
      engineering: "Working approach",
    },
    skills: [
      {
        label: "Klare Commits",
        hint: {
          hr: "Nachvollziehbare Geschichte statt großer Brocken.",
          engineering: "Reviewable history, not mega-commits.",
        },
      },
      {
        label: "Tests zuerst",
        hint: {
          hr: "Akzeptanzkriterien werden zu überprüfbaren Tests.",
          engineering: "Acceptance criteria become verifiable tests.",
        },
      },
      {
        label: "Dokumentation am Code",
        hint: {
          hr: "Entscheidungen sind aufzufinden, nicht zu erraten.",
          engineering: "Decisions are findable, not guessable.",
        },
      },
    ],
  },
];
