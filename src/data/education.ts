import type { DualCopy, EducationEntry } from "~/types/content";

/**
 * Education entries extracted verbatim from the OpenDesign reference.
 *
 * Three entries, in reference order:
 *   1. Technischer Produktdesigner für Maschinen- und Anlagenbau, tecsis GmbH,
 *      01.08.2012 - 18.06.2015 · Abgeschlossene Berufsausbildung
 *   2. Fachoberschule Maschinenbau, 2016-2017 · Fachabitur
 *   3. Hochschule Darmstadt
 *        - Interactive Media Design · 2017-2021 · ohne Abschluss
 *        - Informatik · 2021-2023 · ohne Abschluss
 *
 * The h_da entry intentionally does NOT carry a degree title — neither
 * program was completed, per the reference.
 */

interface ReferenceEducation {
  readonly id: string;
  readonly institution: DualCopy;
  readonly degree: DualCopy;
  readonly focus: DualCopy;
  readonly periodLines: ReadonlyArray<string>;
  readonly start: string;
  readonly end?: string;
}

const REFERENCE: ReadonlyArray<ReferenceEducation> = [
  {
    id: "tecsis-ausbildung",
    institution: {
      hr: "tecsis GmbH, Offenbach",
      engineering: "tecsis GmbH, Offenbach",
    },
    degree: {
      hr: "Technischer Produktdesigner für Maschinen- und Anlagenbau",
      engineering: "Technical product designer for mechanical and plant engineering",
    },
    focus: {
      hr: "01.08.2012 - 18.06.2015 · Abgeschlossene Berufsausbildung",
      engineering: "01.08.2012 - 18.06.2015 · completed vocational training",
    },
    periodLines: ["01.08.2012 - 18.06.2015 · Abgeschlossene Berufsausbildung"],
    start: "2012-08-01",
    end: "2015-06-18",
  },
  {
    id: "fos-maschinenbau",
    institution: {
      hr: "Fachoberschule",
      engineering: "Vocational college",
    },
    degree: {
      hr: "Fachoberschule Maschinenbau",
      engineering: "Vocational college, mechanical engineering",
    },
    focus: {
      hr: "2016-2017 · Fachabitur",
      engineering: "2016-2017 · Fachabitur (technical college entrance qualification)",
    },
    periodLines: ["2016-2017 · Fachabitur"],
    start: "2016",
    end: "2017",
  },
  {
    id: "hda-imd-informatik",
    institution: {
      hr: "Hochschule Darmstadt",
      engineering: "Hochschule Darmstadt",
    },
    degree: {
      hr: "Hochschule Darmstadt",
      engineering: "Hochschule Darmstadt",
    },
    focus: {
      hr: "Interactive Media Design · 2017-2021 · ohne Abschluss",
      engineering: "Interactive Media Design · 2017-2021 · not completed",
    },
    periodLines: [
      "Interactive Media Design · 2017-2021 · ohne Abschluss",
      "Informatik · 2021-2023 · ohne Abschluss",
    ],
    start: "2017",
    end: "2023",
  },
];

export const education: EducationEntry[] = REFERENCE.map((r) => ({
  id: r.id,
  institution: r.institution,
  degree: r.degree,
  focus: r.focus,
  start: r.start,
  ...(r.end ? { end: r.end } : {}),
}));

export const referenceEducation: ReadonlyArray<ReferenceEducation> = REFERENCE;
