import { Coffee, Download, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuoteStore } from "@/stores/quoteStore";

const THEMES = [
  { id: "warm", label: "Warm Brown", swatch: ["#6f4b35", "#eadbca"] },
  { id: "blue", label: "Modern Blue", swatch: ["#354b6f", "#caeadb"] },
  { id: "noir", label: "Noir Espresso", swatch: ["#1c1612", "#d8b482"] },
  { id: "aurora", label: "Aurora Cream", swatch: ["#a4365a", "#f3d6bb"] },
  { id: "brutal", label: "Brutalist Mono", swatch: ["#0c0c0c", "#ff5a1f"] },
] as const;

export function TopBar() {
  const theme = useQuoteStore((s) => s.theme);
  const set = useQuoteStore((s) => s.set);
  const reset = useQuoteStore((s) => s.reset);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-2 backdrop-blur no-print">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Coffee className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Coffee24 Studio
          </span>
          <span className="font-display text-base font-semibold">견적서 에디터</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1 rounded-md border border-border bg-card p-1 md:flex">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => set("theme", t.id)}
                title={t.label}
                className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs transition ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative inline-flex h-4 w-4 overflow-hidden rounded-full ring-1 ring-border">
                  <span
                    style={{ background: t.swatch[0] }}
                    className="absolute inset-y-0 left-0 w-1/2"
                  />
                  <span
                    style={{ background: t.swatch[1] }}
                    className="absolute inset-y-0 right-0 w-1/2"
                  />
                </span>
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        <Separator orientation="vertical" className="hidden h-6 md:block" />
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          초기화
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
          <Printer className="h-3.5 w-3.5" />
          인쇄
        </Button>
        <Button size="sm" onClick={() => window.print()} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          PDF 저장
        </Button>
      </div>
    </header>
  );
}
