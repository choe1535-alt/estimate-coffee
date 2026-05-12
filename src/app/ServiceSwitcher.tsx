import { Check, ChevronDown, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SERVICES, getService } from "@/services";
import { useAppStore } from "@/stores/appStore";

/**
 * Slack-workspace-style service picker.
 * Clicking the topbar logo opens a popover listing all registered
 * services. Selecting one switches the active service in the shell
 * store; the rest of the editor re-renders for that service.
 */
export function ServiceSwitcher() {
  const activeServiceId = useAppStore((s) => s.activeServiceId);
  const setActiveServiceId = useAppStore((s) => s.setActiveServiceId);
  const active = getService(activeServiceId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2.5 rounded-md border border-transparent px-1.5 py-1 outline-none transition hover:border-border hover:bg-accent/40 focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring"
          title={`${active.name} — 서비스 변경`}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-white"
            style={{
              background: `linear-gradient(135deg, ${active.accent[0]}, ${active.accent[1]})`,
            }}
          >
            {active.icon}
          </span>
          <span className="flex flex-col text-left leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {active.shortName}
            </span>
            <span className="font-display text-sm font-semibold">견적서 에디터</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-2" align="start" sideOffset={8}>
        <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          서비스 선택
        </p>
        <ul className="space-y-0.5">
          {SERVICES.map((s) => {
            const isActive = s.id === activeServiceId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveServiceId(s.id, s.defaultSectionId)}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition ${
                    isActive ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
                    style={{
                      background: `linear-gradient(135deg, ${s.accent[0]}, ${s.accent[1]})`,
                    }}
                  >
                    {s.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold leading-tight">{s.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{s.tagline}</span>
                  </span>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 border-t border-border pt-2">
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-muted-foreground/60"
            title="추후 다른 서비스(정수기, 스낵 등)가 추가될 자리"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border">
              <Plus className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm">새 견적 서비스 추가</span>
              <span className="block text-[11px]">추후 정수기 · 스낵 등 확장 예정</span>
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
