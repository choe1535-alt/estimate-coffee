import { formatMoney } from "@/lib/utils";
import { PricingTable } from "./PricingTable";
import type { QuoteLine } from "@/types/domain";

export function SectionCard({
  title,
  subtitle,
  total,
  lines,
  emptyMessage,
  totalLabel = "총 월 납부금액 (VAT 포함)",
  withDiscountColumn = true,
}: {
  title: string;
  subtitle: string;
  total: number | null;
  lines: QuoteLine[];
  emptyMessage: string;
  totalLabel?: string;
  withDiscountColumn?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[hsl(var(--rule))] bg-[hsl(var(--paper))]">
      <header className="flex items-start justify-between gap-3 border-b border-[hsl(var(--rule))] bg-[hsl(var(--paper-strong))] px-4 py-3">
        <div>
          <p className="eyebrow">{title}</p>
          <h3 className="mt-0.5 text-base">{subtitle}</h3>
        </div>
        <div className="section-total-pill rounded-md px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {totalLabel}
          </p>
          <p className="mt-0.5 font-display text-base font-semibold">
            {formatMoney(total)}
          </p>
        </div>
      </header>

      {lines.length === 0 ? (
        <div className="px-4 py-6 text-xs text-[hsl(var(--ink))]/60">{emptyMessage}</div>
      ) : (
        <PricingTable lines={lines} withDiscountColumn={withDiscountColumn} />
      )}
    </section>
  );
}
