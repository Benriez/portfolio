import type { DualCopy, ProjectStatus } from "~/types/content";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  "active-development": "In aktiver Entwicklung",
  live: "Live / Production",
};

export function formatProjectMeta(meta: DualCopy, status: ProjectStatus): DualCopy {
  const label = projectStatusLabels[status];
  return {
    hr: [meta.hr, label].filter(Boolean).join(" · "),
    engineering: [meta.engineering, label].filter(Boolean).join(" · "),
  };
}
