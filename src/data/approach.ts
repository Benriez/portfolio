/**
 * Working Approach copy.
 *
 * Three paragraphs, rendered in order under the "Arbeitsweise" headline:
 *
 *   1. the framing paragraph (requirement ↔ architecture ↔ operation)
 *   2. AI-assisted, verification-driven engineering
 *   3. requirements engineering, root-cause analysis, recovery thinking and
 *      production ownership
 *
 * The copy is public-facing: it names no commercial model or vendor.
 */
export const approachParagraphs: ReadonlyArray<string> = [
  "Ich arbeite an der Schnittstelle zwischen Produktanforderung, Softwarearchitektur und laufendem Betrieb. Wichtig ist nicht nur, dass ein Feature funktioniert, sondern wie es sich bei Fehlern, Deployments, Zustandswechseln und echten Nutzungsbedingungen verhält.",
  "AI-gestützte Entwicklung nutze ich als Engineering-Werkzeug, nicht als Ersatz für technische Verantwortung. Architektur und Systemgrenzen definiere ich bewusst; Implementierungen verifiziere ich über Tests, Typechecks, E2E-Prüfungen, Runtime-Evidence und, wo relevant, Hardware-Abnahmen.",
  "Meine Arbeit verbindet Requirements Engineering, Root-Cause Analysis, Recovery Thinking und Production Ownership. Konzept, Implementierung, Verifikation und Betrieb gehören dabei zusammen.",
];
