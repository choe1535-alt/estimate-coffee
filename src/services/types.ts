import type { ComponentType, ReactNode } from "react";

/**
 * One inspector section in the left sidebar (예: 고객 정보, 계약 옵션).
 *
 * Each service defines its own set of sections — schemas, forms, and
 * business rules are NOT shared across services. The shell only knows
 * the section's id/label/icon and the Panel component to render.
 */
export type ServiceSection = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Form rendered in the left sidebar when this section is active. */
  Panel: ComponentType;
};

/**
 * A pluggable quote-builder service.
 *
 * The editor shell (TopBar / SectionTabs / LeftSidebar / Canvas /
 * RightSidebar) is fully generic. Each service implements this
 * interface to plug its own data, forms, and quote document into
 * the shell. Services are otherwise independent — different
 * customer schemas, different data models, different APIs.
 */
export type Service = {
  /** Stable URL-safe id (e.g. "coffee"). Persisted in app store. */
  id: string;
  /** Display name shown in the service switcher and topbar. */
  name: string;
  /** Short brand label shown next to the topbar logo. */
  shortName: string;
  /** One-line description shown in the service switcher menu. */
  tagline: string;
  /** Lucide icon (or any ReactNode) for the topbar / switcher. */
  icon: ReactNode;
  /** Background gradient for the logo chip. Two CSS color stops. */
  accent: [string, string];

  /** Left-sidebar inspector sections, in tab order. */
  sections: ServiceSection[];
  /** Initial section to focus when this service becomes active. */
  defaultSectionId: string;

  /** A4 quote document rendered in the canvas. */
  QuoteDocument: ComponentType;
  /** Optional right-sidebar summary panel. */
  SummaryPanel?: ComponentType;

  /**
   * Optional hook returning the natural (unscaled) width in px of
   * the service's quote document. The shell's Canvas uses this to
   * scale-to-fit. Defaults to A4 portrait (794px) when omitted.
   * Must be a React hook (called inside Canvas render).
   */
  useNaturalPageWidthPx?: () => number;
};
