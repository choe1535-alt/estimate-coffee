import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceSwitcher } from "./ServiceSwitcher";

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-3 py-2 backdrop-blur no-print">
      <ServiceSwitcher />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5"
        >
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
