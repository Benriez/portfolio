import type { ExperienceEntry } from "~/types/content";

export const experience: ExperienceEntry[] = [
  {
    id: "freelance-engineering",
    employer: {
      hr: "Freelance Engineering",
      engineering: "Independent engineering practice",
    },
    role: {
      hr: "Full-Stack Engineer, Berater",
      engineering: "Full-stack engineer / fractional consulting",
    },
    location: {
      hr: "Darmstadt · Deutschland",
      engineering: "Darmstadt, Germany",
    },
    start: "2023-09",
    highlights: [
      {
        hr:
          "Verantwortlich für Konzeption, Aufbau und Betrieb kleiner Web-Plattformen sowie " +
          "datengetriebener Werkzeuge.",
        engineering:
          "End-to-end delivery of small-scale web platforms and data tools: requirements, " +
          "architecture, implementation, deploy, on-call rotation.",
      },
      {
        hr:
          "Indirekte Zusammenarbeit mit Design, Produktverantwortlichen und Geschäftsführung; " +
          "Belastbarkeit in Wochenzyklen.",
        engineering:
          "Cross-functional collaboration with design, product, and operations; " +
          "comfortable in weekly cadence with explicit deliverable contracts.",
      },
    ],
  },
  {
    id: "industry-engineering",
    employer: {
      hr: "Industrieller Mittelstand",
      engineering: "Industrial SME",
    },
    role: {
      hr: "Engineer für Daten- und Produktionssysteme",
      engineering: "Engineer · data + production systems",
    },
    location: {
      hr: "Metropolregion Rhein-Main",
      engineering: "Rhine-Main metropolitan region",
    },
    start: "2020-02",
    end: "2023-08",
    highlights: [
      {
        hr:
          "Operational Data Pipelines und angeschlossene BI-Auswertungen von der Maschine bis " +
          "zur Werksleitung konzipiert und betrieben.",
        engineering:
          "Owned end-to-end delivery of operational data pipelines and BI dashboards " +
          "from PLC/MES telemetry to executive surfaces.",
      },
      {
        hr:
          "Begleitende Software-Wartung für interne Werkzeuge mit Schwerpunkt auf messbarer " +
          "Reduktion wiederkehrender Störungen.",
        engineering:
          "Maintenance of internal tooling; tracked reduction of recurring incidents through " +
          "structured post-mortems and small refactors.",
      },
    ],
  },
  {
    id: "study-research-assistantship",
    employer: {
      hr: "Hochschule Darmstadt (h_da)",
      engineering: "Hochschule Darmstadt (h_da)",
    },
    role: {
      hr: "Wissenschaftliche Hilfskraft",
      engineering: "Student research assistant",
    },
    location: {
      hr: "Darmstadt · Deutschland",
      engineering: "Darmstadt, Germany",
    },
    start: "2019-04",
    end: "2021-09",
    highlights: [
      {
        hr:
          "Mitarbeit in Forschungs- und Lehrprojekten mit Fokus auf zuverlässige Software im " +
          "ingenieurwissenschaftlichen Kontext.",
        engineering:
          "Contributed to research / teaching projects with a focus on reliable software " +
          "in engineering contexts; reproducible evaluations and short technical notes.",
      },
    ],
  },
];
