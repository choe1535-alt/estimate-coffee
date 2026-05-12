import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/utils";
import { useCoffeeBundle } from "@/services/coffee/hooks";
import { useQuoteStore } from "@/services/coffee/store";
import { computeQuote } from "@/services/coffee/lib/quote";

export function SummaryPanel() {
  const state = useQuoteStore();
  const bundle = useCoffeeBundle();

  if (!bundle.data) return <Skeleton />;

  const machine = bundle.data.machines.find((m) => m.name === state.machineName);
  const quote = computeQuote(state, bundle.data);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Summary
        </p>
        <h2 className="font-display text-lg font-semibold tracking-tight">선택 요약</h2>
      </header>

      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          추천안
        </p>
        <p className="mt-0.5 text-sm font-semibold">
          {state.beansEnabled ? "머신렌탈 & 원두구독" : "머신 단독 렌탈"}
        </p>
        <Separator className="my-3" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          VAT 포함 월 납부금액
        </p>
        <p className="mt-0.5 font-display text-2xl font-semibold tracking-tight">
          {formatMoney(
            state.beansEnabled
              ? quote.totals.bundleVatIncluded
              : quote.totals.rentalOnlyVatIncluded,
          )}
        </p>
      </div>

      <div className="space-y-2 rounded-md border border-border bg-card p-3 text-xs">
        <Row k="머신" v={machine?.name ?? "-"} />
        <Row k="약정 / 수량" v={`${state.contractTerm}개월 / ${state.machineQuantity}대`} />
        <Row k="케어주기" v={state.careCycle} />
        <Row
          k="원두 / 택배"
          v={
            state.beansEnabled
              ? `${state.beanLines.filter((b) => b.quantity > 0).length}종 · ${
                  quote.shippingIncluded ? "택배비 포함" : "택배비 제외"
                }`
              : "원두 미포함"
          }
        />
        <Row k="할인율" v={`머신 ${state.machineDiscount}% / 원두 ${state.beanDiscount}%`} />
      </div>

      {machine && (
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            머신 스펙
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
            {machine.spec
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <li key={i}>· {line}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-right text-xs font-medium">{v}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded bg-muted" />
    </div>
  );
}
