import { useAppStore } from "@/stores/appStore";
import { getService } from "@/services";

/**
 * Generic shell container for the active service's summary panel.
 * Hidden below `xl` so the canvas keeps its full A4 width.
 */
export function RightSidebar() {
  const activeServiceId = useAppStore((s) => s.activeServiceId);
  const service = getService(activeServiceId);
  const Summary = service.SummaryPanel;
  if (!Summary) return null;

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background px-4 py-4 no-print xl:flex scrollthin">
      <Summary />
    </aside>
  );
}
