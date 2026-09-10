import type { EducationEntry } from "~/types/content";

export const education: EducationEntry[] = [
  {
    id: "h-da-beng",
    institution: {
      hr: "Hochschule Darmstadt (h_da)",
      engineering: "Hochschule Darmstadt (h_da)",
    },
    degree: {
      hr: "Bachelor of Engineering — Informationstechnik",
      engineering: "B.Eng. Information Technology",
    },
    focus: {
      hr:
        "Eingebettete Systeme, Regelungstechnik und Software-Engineering mit Schwerpunkt " +
        "auf zuverlässiger, wartbarer Implementierung.",
      engineering:
        "Embedded systems, control engineering, and software engineering with an emphasis on " +
        "reliable, maintainable implementations.",
    },
    start: "2017-09",
    end: "2021-09",
  },
];
