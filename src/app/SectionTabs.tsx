import { useEffect } from "react";
import { useAppStore, useActiveSectionId } from "@/stores/appStore";
import { getService } from "@/services";

export function SectionTabs() {
  const activeServiceId = useAppStore((s) => s.activeServiceId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setActiveServiceId = useAppStore((s) => s.setActiveServiceId);
  const activeSectionId = useActiveSectionId();
  const service = getService(activeServiceId);

  // Ensure a default section is set for first-time visits or for
  // services that have changed their section list.
  useEffect(() => {
    const valid = service.sections.some((s) => s.id === activeSectionId);
    if (!valid) setActiveServiceId(service.id, service.defaultSectionId);
  }, [service, activeSectionId, setActiveServiceId]);

  return (
    <nav className="flex w-12 flex-col items-center gap-1 border-r border-border bg-background px-1 py-3 no-print">
      {service.sections.map((s) => {
        const isActive = s.id === activeSectionId;
        return (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            title={s.label}
            className={`group flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-semibold transition ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                isActive ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70"
              }`}
            >
              {s.icon}
            </span>
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
