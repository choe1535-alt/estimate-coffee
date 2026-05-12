import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { getService } from "@/services";

const A4_PORTRAIT_WIDTH_PX = 794; // 210mm at 96dpi
const HORIZONTAL_PADDING_PX = 48;

/**
 * Generic canvas. Auto-fits whatever QuoteDocument the active
 * service exposes — the shell knows nothing about its content.
 */
export function Canvas() {
  const ref = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);
  const activeServiceId = useAppStore((s) => s.activeServiceId);
  const service = getService(activeServiceId);
  const QuoteDocument = service.QuoteDocument;
  // Service-provided natural page width (e.g. portrait vs landscape A4).
  const naturalWidthPx = service.useNaturalPageWidthPx
    ? service.useNaturalPageWidthPx()
    : A4_PORTRAIT_WIDTH_PX;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth - HORIZONTAL_PADDING_PX;
      const next = Math.max(0.35, Math.min(1, w / naturalWidthPx));
      setScale(Number(next.toFixed(3)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidthPx]);

  return (
    <main
      ref={ref}
      className="editor-canvas editor-canvas-bg relative flex-1 overflow-auto scrollthin px-6 py-8"
    >
      <div className="quote-scale" style={{ zoom: scale }}>
        <QuoteDocument />
      </div>
    </main>
  );
}
