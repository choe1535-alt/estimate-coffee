import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Shell-level state shared across all services.
 * Service-specific state (form fields, business toggles) lives in
 * each service's own store under src/services/<name>/store.ts.
 */
export type AppState = {
  /** Currently active service id (e.g. "coffee"). */
  activeServiceId: string;
  /** Active inspector section per service id. */
  activeSectionByService: Record<string, string>;

  setActiveServiceId: (id: string, defaultSectionId?: string) => void;
  setActiveSection: (sectionId: string) => void;
};

const defaults = {
  activeServiceId: "coffee",
  activeSectionByService: {} as Record<string, string>,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaults,

      setActiveServiceId: (id, defaultSectionId) =>
        set((prev) => {
          const next = { ...prev.activeSectionByService };
          if (defaultSectionId && !next[id]) {
            next[id] = defaultSectionId;
          }
          return { activeServiceId: id, activeSectionByService: next };
        }),

      setActiveSection: (sectionId) => {
        const serviceId = get().activeServiceId;
        set((prev) => ({
          activeSectionByService: {
            ...prev.activeSectionByService,
            [serviceId]: sectionId,
          },
        }));
      },
    }),
    {
      name: "estimate-app",
      version: 1,
      partialize: (state) => ({
        activeServiceId: state.activeServiceId,
        activeSectionByService: state.activeSectionByService,
      }),
    },
  ),
);

/** Convenience selector for the current service's active section id. */
export function useActiveSectionId(): string | undefined {
  return useAppStore(
    (s) => s.activeSectionByService[s.activeServiceId],
  );
}
