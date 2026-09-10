import type { DualCopy, ExperienceEntry } from "~/types/content";

/**
 * Career history extracted verbatim from the OpenDesign reference.
 *
 * Three entries, in reference order:
 *
 *   1. 06/2022 - heute, Selbstständiger Software- & IT-Dienstleister, Darmstadt
 *      (includes a sub-role: Technischer Produktmanager · Steuerbüro)
 *   2. 09/2020 - 05/2022, Werkstudent → Full-Stack Developer, Fahrschule360 · Mainz
 *   3. 19.06.2015 - 31.07.2016, Technischer Produktdesigner, tecsis GmbH · Offenbach
 *
 * The sub-role structure is encoded as a `points` field on entry 1: the
 * reference renders it as a `.subrole` block with h4 + HR/Eng text + summary.
 */

interface ReferenceExperience {
  readonly id: string;
  readonly period: string;
  readonly role: DualCopy;
  readonly employer: DualCopy;
  readonly highlights: DualCopy[];
  readonly subroleTitle?: string;
  readonly subroleContext?: string;
  readonly subroleLead?: DualCopy;
  readonly subroleSummary?: string;
}

const REFERENCE: ReadonlyArray<ReferenceExperience> = [
  {
    id: "freelance-it",
    period: "06/2022 - heute",
    role: {
      hr: "Selbstständiger Software- & IT-Dienstleister",
      engineering: "Independent software and IT service provider",
    },
    employer: {
      hr: "Darmstadt · Selbstständige Tätigkeit",
      engineering: "Darmstadt · Independent practice",
    },
    highlights: [
      {
        hr: "Full-Stack-Entwicklung und Production-Betrieb von Web- und Business-Systemen.",
        engineering:
          "Full-stack development and production operations of web and business systems.",
      },
      {
        hr: "Betrieb eigener Linux-/Docker-/CapRover-Infrastruktur sowie Windows-RDP-Server für fünf Nutzer mit Benutzer-, Rechte- und Zugriffsverwaltung.",
        engineering:
          "Operation of own Linux / Docker / CapRover infrastructure and a Windows RDP server for five users with user, role and access management.",
      },
    ],
    subroleTitle: "Technischer Produktmanager · Steuerbüro",
    subroleContext: "Kundenrolle im Rahmen der Selbstständigkeit",
    subroleLead: {
      hr: "Fachliche Anforderungen aufnehmen und strukturieren, Prioritäten festlegen und gemeinsam mit Anwendern technische Lösungen in die Produktentwicklung überführen.",
      engineering:
        "Fachliche Anforderungen strukturieren, in technische Lösungen übersetzen, Umsetzung priorisieren und die Weiterentwicklung produktiver Systeme begleiten.",
    },
    subroleSummary:
      "Schnittstelle zwischen Fachanwendern, Geschäftsprozessen und technischer Umsetzung.",
  },
  {
    id: "fahrschule360-ws",
    period: "09/2020 - 05/2022",
    role: {
      hr: "Werkstudent → Full-Stack Developer",
      engineering: "Working student → full-stack developer",
    },
    employer: {
      hr: "Fahrschule360 · Mainz",
      engineering: "Fahrschule360 · Mainz",
    },
    highlights: [
      {
        hr: "Full-Stack-Entwicklung mit JavaScript und Python für Client- und Server-Systeme.",
        engineering:
          "Full-stack development with JavaScript and Python for client and server systems.",
      },
      {
        hr: "Mitarbeit an VR-Systemen, Build-/Deployment-Prozessen, Container- und Cloud-Infrastruktur.",
        engineering:
          "Contributing to VR systems, build and deployment processes, container and cloud infrastructure.",
      },
    ],
  },
  {
    id: "tecsis-design",
    period: "19.06.2015 - 31.07.2016",
    role: {
      hr: "Technischer Produktdesigner",
      engineering: "Technical product designer",
    },
    employer: {
      hr: "tecsis GmbH · Offenbach",
      engineering: "tecsis GmbH · Offenbach",
    },
    highlights: [
      {
        hr: "Konstruktion elektromechanischer Baugruppen, technische Zeichnungen und struktur-/mechanische Analysen einschließlich FEM.",
        engineering:
          "Design of electromechanical assemblies, technical drawings and structural / mechanical analyses including FEM.",
      },
    ],
  },
];

/** Convert "06/2022 - heute" → { start: "06/2022", end: undefined }. */
function periodToIso(period: string): { start: string; end?: string } {
  const [start, end] = period.split(" - ").map((s) => s.trim());
  if (!start) {
    return { start: period };
  }
  if (!end || end === "heute" || end === "today") {
    return { start };
  }
  return { start, end };
}

/**
 * Convert the reference data to the canonical ExperienceEntry shape.
 * Sub-role copy is rendered by ExperienceTimeline from the rich
 * ReferenceExperience payload exported below; the canonical
 * ExperienceEntry only carries the top-level career line.
 */
export const experience: ExperienceEntry[] = REFERENCE.map((r) => ({
  id: r.id,
  role: r.role,
  employer: r.employer,
  location: r.employer,
  start: periodToIso(r.period).start,
  ...(periodToIso(r.period).end ? { end: periodToIso(r.period).end } : {}),
  highlights: r.highlights,
}));

/** Reference-aligned full experience payload used by ExperienceTimeline. */
export const referenceExperience: ReadonlyArray<ReferenceExperience> = REFERENCE;
