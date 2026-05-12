import { Building2, Cog, Leaf, Palette, StickyNote } from "lucide-react";
import { useQuoteStore, type ActiveSection } from "@/stores/quoteStore";

const ITEMS: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
  { id: "style", label: "스타일", icon: <Palette className="h-4 w-4" /> },
  { id: "customer", label: "고객", icon: <Building2 className="h-4 w-4" /> },
  { id: "contract", label: "계약", icon: <Cog className="h-4 w-4" /> },
  { id: "beans", label: "원두", icon: <Leaf className="h-4 w-4" /> },
  { id: "notes", label: "안내", icon: <StickyNote className="h-4 w-4" /> },
];

export function SectionTabs() {
  const active = useQuoteStore((s) => s.activeSection);
  const setActive = useQuoteStore((s) => s.setActiveSection);
  return (
    <nav className="flex w-12 flex-col items-center gap-1 border-r border-border bg-background px-1 py-3 no-print">
      {ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            title={item.label}
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
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
