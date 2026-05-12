import { useEffect, useRef, useState } from "react";
import { QuotePaper } from "@/components/quote/QuotePaper";

// A4 width in CSS px at 96dpi (210mm)
const A4_WIDTH_PX = 794;
// Outer breathing room (left+right combined) we'd like around the paper
const HORIZONTAL_PADDING_PX = 48;

export function Canvas() {
  const ref = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale the A4 document so it always fits the canvas width.
  // We use CSS `zoom` (not transform: scale) so layout dimensions
  // shrink along with the visual — keeping the document centered and
  // the canvas free of dead scroll space.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth - HORIZONTAL_PADDING_PX;
      const next = Math.max(0.45, Math.min(1, w / A4_WIDTH_PX));
      setScale(Number(next.toFixed(3)));
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <main
      ref={ref}
      className="editor-canvas editor-canvas-bg relative flex-1 overflow-auto scrollthin px-6 py-8"
    >
      <div className="quote-scale" style={{ zoom: scale }}>
        <QuotePaper />
      </div>
    </main>
  );
}
