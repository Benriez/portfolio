import type { DualCopy, ProjectStatus } from "~/types/content";

/**
 * Project status is encoded by the project copy itself, not by an
 * additional status label appended to the work-meta line. The OpenDesign
 * reference carries project maturity through phrasing (e.g. "Self-hosted
 * AI Operator Platform" or "Migration") rather than via a separate badge.
 *
 * `formatProjectMeta` therefore returns the meta verbatim. The
 * `ProjectStatus` field remains a typed invariant so the data layer can
 * still classify a project without an extra label appearing in the render.
 */
export const projectStatusLabels: Record<ProjectStatus, string> = {
  "active-development": "In aktiver Entwicklung",
  live: "Live / Production",
};

export function formatProjectMeta(meta: DualCopy, _status: ProjectStatus): DualCopy {
  void _status;
  return {
    hr: meta.hr,
    engineering: meta.engineering,
  };
}
