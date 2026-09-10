import type { TechStackGroup } from "~/types/content";

export const techStack: TechStackGroup[] = [
  {
    heading: {
      hr: "Programmiersprachen",
      engineering: "Languages",
    },
    items: ["TypeScript", "Node 22", "Python 3.12", "PHP 8", "SQL"],
  },
  {
    heading: {
      hr: "Build- und Test-Werkzeuge",
      engineering: "Build & test",
    },
    items: ["Astro 7", "Vite", "Vitest 5", "Playwright 1.63", "axe-core", "Prettier", "ESLint 9"],
  },
  {
    heading: {
      hr: "Daten und Persistenz",
      engineering: "Data & persistence",
    },
    items: ["PostgreSQL", "SQLite", "Airflow", "dbt"],
  },
  {
    heading: {
      hr: "Container & Auslieferung",
      engineering: "Containers & delivery",
    },
    items: ["Docker Compose", "nginx-proxy", "GitHub Actions", "GitHub Pages"],
  },
];
