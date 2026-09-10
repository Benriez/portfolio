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

export interface ProjectEntry {
  id: string;
  title: string;
  customer: DualCopy;
  role: DualCopy;
  stack: string[];
  summary: DualCopy;
  impact: DualCopy[];
  status: ProjectStatus;
  period: { start: IsoDate; end?: IsoDate };
  link?: { href: string; label: DualCopy };
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
