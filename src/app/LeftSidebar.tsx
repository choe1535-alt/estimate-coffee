import { useAppStore, useActiveSectionId } from "@/stores/appStore";
import { getService } from "@/services";

/**
 * Generic shell sidebar. Looks up the active service + section
 * and renders that section's Panel component. The shell never
 * knows about service-specific forms or schemas.
 */
export function LeftSidebar() {
  const activeServiceId = useAppStore((s) => s.activeServiceId);
  const activeSectionId = useActiveSectionId();
  const service = getService(activeServiceId);
  const section =
    service.sections.find((s) => s.id === activeSectionId) ?? service.sections[0];
  const Panel = section?.Panel;

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-border bg-background no-print">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Inspector
        </p>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {section?.label ?? "—"}
        </h2>
      </div>

      <div className="scrollthin flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {Panel ? <Panel /> : null}
      </div>
    </aside>
  );
}
