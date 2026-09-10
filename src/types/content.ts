/**
 * Shared portfolio types.
 *
 * The portfolio holds German content. Each piece of content that supports
 * HR / Engineering dual-view rendering exposes a {@link DualCopy} variant.
 * Otherwise, the field is rendered as-is in both views.
 */

/** A textual value available in HR and Engineering voice. */
export interface DualCopy {
  hr: string;
  engineering: string;
}

/** ISO-8601 date string (e.g. "2021-04"). */
export type IsoDate = string;

/** A short, label-only bullet or capability item. */
export interface Labeled {
  label: string;
}

/** A categorized skill tag shown in the capabilities section. */
export interface SkillItem extends Labeled {
  hint?: DualCopy;
}

export interface CapabilityGroup {
  heading: DualCopy;
  skills: SkillItem[];
}

export type ProjectStatus = "shipped" | "ongoing" | "research";

/**
 * Project entry — fields mirror the OpenDesign reference's
 * `.work-item` content. The Flagship project (BODI / agent-garden) has
 * `isFlagship: true` and renders without role-line / points / stack-line.
 * Compact entries render with reduced vertical padding.
 */
export interface ProjectEntry {
  id: string;
  title: string;
  /** 1-line mono-uppercase meta: "2021-2026 · Zwei-Personen-Entwicklerteam" */
  meta: DualCopy;
  /** 1-line italic sub-title: "B2B-VR-Trainingsplattform für Fahrschulen" */
  sub: DualCopy;
  /** Lead paragraph: 1-2 sentences describing the project. */
  lead: DualCopy;
  /** Optional 1-line role line below the lead. */
  roleLine?: DualCopy;
  /** Optional HR-mode bullet list (work-points). */
  pointsHr?: string[];
  /** Optional Engineering-mode bullet list (work-points). */
  pointsEngineering?: string[];
  /** Stack line tokens, joined with " · ". */
  stack: string[];
  /** Internal status flag for the project's lifecycle. */
  status: ProjectStatus;
  period: { start: IsoDate; end?: IsoDate };
  /** True for the flagship project; renders a larger h3. */
  isFlagship?: boolean;
  /** True for compact entries; reduced padding. */
  compact?: boolean;
  /** Optional case-study link (e.g. "Case Study ansehen"). */
  caseLink?: { href: string; label: DualCopy };
}

export interface ExperienceEntry {
  id: string;
  employer: DualCopy;
  role: DualCopy;
  location: DualCopy;
  start: IsoDate;
  end?: IsoDate;
  highlights: DualCopy[];
}

export interface EducationEntry {
  id: string;
  institution: DualCopy;
  degree: DualCopy;
  focus: DualCopy;
  start: IsoDate;
  end?: IsoDate;
}

/** A coarse "Tech stack" tile content. */
export interface TechStackGroup {
  heading: DualCopy;
  items: string[];
}

/** Public contact item. */
export interface ContactItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

/** View mode for HR / Engineering dual rendering. */
export type ViewMode = "hr" | "engineering";
