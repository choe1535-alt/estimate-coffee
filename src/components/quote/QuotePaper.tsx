import { useCoffeeBundle } from "@/hooks/useCoffeeData";
import { useQuoteStore } from "@/stores/quoteStore";
import { computeQuote } from "@/lib/quote";
import { formatDate, formatMoney } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

/**
 * Renders the quote as a stack of fixed-size A4 sheets (`.quote-page`),
 * matching the printed PDF exactly. Layouts inside a page use fixed
 * grids so they render identically in preview and in print.
 */
export function QuotePaper() {
  const state = useQuoteStore();
  const bundle = useCoffeeBundle();

  if (bundle.isLoading || !bundle.data) {
    return (
      <div className="quote-document">
        <article className="quote-page" data-theme={state.theme}>
          <p className="text-sm text-[hsl(var(--ink))]/60">데이터를 불러오는 중…</p>
        </article>
      </div>
    );
  }

  const data = bundle.data;
  const quote = computeQuote(state, data);
  const machine = data.machines.find((m) => m.name === state.machineName) ?? data.machines[0];
  const salesRep = data.salesReps.find((r) => r.name === state.salesRepName) ?? data.salesReps[0];
  const quoteDate = new Date(`${state.quoteDate}T00:00:00`);

  const commonNotes = [
    `${data.constants.ownershipTransferMonths}개월 이상 이용 시 커피머신 소유권이 이전됩니다.`,
    "1년 무상 A/S 가능합니다. 단, 소비자 과실은 유상 청구될 수 있습니다.",
    "커피24 원두 미사용 또는 장기 미청소로 인한 고장은 유상 청구될 수 있습니다.",
    `케어주기 선택: ${state.careCycle}`,
    state.beansEnabled
      ? quote.shippingIncluded
        ? "원두 금액이 5만원(VAT 포함) 미만이어서 택배비 3,500원(VAT 포함)이 반영되었습니다."
        : "원두 금액이 5만원(VAT 포함) 이상이어서 택배비는 무료입니다."
      : "원두 미포함 옵션 — 머신 단독 렌탈 단가가 적용됩니다.",
  ];

  const totalPages = 2;

  return (
    <div className="quote-document">
      {/* ─────────────────────────────────────────────── PAGE 1 */}
      <article className="quote-page" data-theme={state.theme}>
        {/* HEADER */}
        <header className="grid grid-cols-[1fr_auto] items-start gap-6 border-b border-[hsl(var(--rule))] pb-5">
          <div className="space-y-1.5">
            <p className="eyebrow">Coffee24 Estimate</p>
            <h1 className="text-[28px] leading-[1.1]">
              커피머신 정기구독 서비스 견적서
            </h1>
            <p className="text-[12px] leading-relaxed text-[hsl(var(--ink))]/60">
              템플릿 엑셀 ‘커피24 견적서 AX TF.xlsx’의 변수/단가 구조를 그대로 따른 인쇄용 견적서입니다.
            </p>
          </div>
          <div
            className="w-[200px] rounded-xl p-3.5 text-[12px] leading-relaxed"
            style={{
              background: "linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-2)))",
              color: "hsl(var(--paper))",
            }}
          >
            <p className="font-display text-[15px] font-semibold">주식회사 위펀</p>
            <p className="mt-1 opacity-90">
              대표자 김 헌
              <br />
              대표번호 1644-4624
              <br />
              coffee24@snack24h.com
            </p>
          </div>
        </header>

        {/* META + SELECTION SUMMARY */}
        <section className="mt-5 grid grid-cols-[1.45fr_1fr] gap-3">
          <div className="overflow-hidden rounded-lg border border-[hsl(var(--rule))]">
            <dl className="grid grid-cols-2">
              <MetaItem k="견적일" v={formatDate(quoteDate)} />
              <MetaItem k="견적 유효일" v={formatDate(quote.validUntil)} />
              <MetaItem k="고객사명" v={state.companyName || "—"} />
              <MetaItem k="담당자" v={state.contactName || "—"} />
              <MetaItem k="연락처" v={state.contactPhone || "—"} />
              <MetaItem k="이메일" v={state.contactEmail || "—"} breakAll />
              <MetaItem k="영업담당자" v={salesRep?.name ?? "-"} />
              <MetaItem k="담당자 연락처" v={salesRep?.phone ?? "-"} />
              <MetaItem k="담당자 이메일" v={salesRep?.email ?? "-"} breakAll />
              <MetaItem
                k="약정 / 수량"
                v={`${state.contractTerm}개월 / ${state.machineQuantity}대`}
                last
              />
            </dl>
          </div>

          <aside
            className="rounded-lg border border-[hsl(var(--rule))] p-3.5 text-[12px]"
            style={{ background: "hsl(var(--paper-strong))" }}
          >
            <p className="eyebrow">선택 요약</p>
            <p className="mt-1.5 inline-flex rounded-full border border-[hsl(var(--rule))] bg-[hsl(var(--paper))] px-2.5 py-1 text-[11px] font-semibold">
              {machine?.name}
            </p>
            <dl className="mt-2.5 space-y-1.5">
              <SummaryRow k="케어주기" v={state.careCycle} />
              <SummaryRow k="원두 포함" v={state.beansEnabled ? "포함" : "미포함"} />
              <SummaryRow
                k="할인율"
                v={`머신 ${state.machineDiscount}% / 원두 ${state.beanDiscount}%`}
              />
            </dl>
          </aside>
        </section>

        {/* RECOMMENDED STRIP */}
        <div
          className="mt-5 flex items-center justify-between gap-3 rounded-lg px-4 py-3"
          style={{
            background: "linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-2)))",
            color: "hsl(var(--paper))",
          }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">추천안</p>
            <p className="font-display text-[18px] font-semibold leading-tight">
              {state.beansEnabled ? "머신렌탈 & 원두구독" : "머신 단독 렌탈"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
              VAT 포함 월 납부금액
            </p>
            <p className="font-display text-[22px] font-semibold leading-tight">
              {formatMoney(
                state.beansEnabled
                  ? quote.totals.bundleVatIncluded
                  : quote.totals.rentalOnlyVatIncluded,
              )}
            </p>
          </div>
        </div>

        {/* 머신 구매 */}
        <div className="mt-5">
          <SectionCard
            title="Option · Purchase"
            subtitle="머신 구매"
            total={quote.totals.purchaseVatIncluded}
            lines={quote.purchaseLines}
            emptyMessage="정리본에 구매 단가가 없는 머신은 ‘문의’로 표시됩니다."
            withDiscountColumn={false}
          />
        </div>

        {/* 렌탈 OR 정기구독 — 원두 여부에 따라 하나만 */}
        <div className="mt-3">
          {!state.beansEnabled ? (
            <SectionCard
              title="Option · Rental"
              subtitle="머신 단독 렌탈"
              total={quote.totals.rentalOnlyVatIncluded}
              lines={quote.rentalOnlyLines}
              emptyMessage="해당 약정 조건의 단독 렌탈 단가가 없습니다."
              withDiscountColumn={false}
            />
          ) : (
            <SectionCard
              title="Option · Subscription"
              subtitle="머신렌탈 & 원두구독"
              total={quote.totals.bundleVatIncluded}
              lines={quote.bundleLines}
              emptyMessage="원두 라인을 추가하면 이 섹션이 계산됩니다."
            />
          )}
        </div>

        <PageNumber n={1} total={totalPages} />
      </article>

      {/* ─────────────────────────────────────────────── PAGE 2 */}
      <article className="quote-page" data-theme={state.theme}>
        {/* 추가구매옵션 / 무상제공 */}
        <section className="overflow-hidden rounded-lg border border-[hsl(var(--rule))] bg-[hsl(var(--paper))]">
          <header className="border-b border-[hsl(var(--rule))] bg-[hsl(var(--paper-strong))] px-4 py-2.5">
            <p className="eyebrow">Free of charge</p>
            <h3 className="mt-0.5 text-[15px]">추가 구매 옵션 · 무상 제공</h3>
          </header>
          <table className="pricing-table">
            <thead>
              <tr>
                <th>유형</th>
                <th>품목</th>
                <th>품목명</th>
                <th>조건</th>
                <th className="money">정가</th>
                <th className="money">월 부담금</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>무상제공</td>
                <td>설치비</td>
                <td>머신 설치 출장비</td>
                <td>머신당 1EA</td>
                <td className="money">{formatMoney(data.constants.setupVisitFee)}</td>
                <td className="money">0원</td>
              </tr>
              <tr>
                <td>무상제공</td>
                <td>설치비</td>
                <td>머신 직수 설치비</td>
                <td>필요시</td>
                <td className="money">{formatMoney(data.constants.plumbInstallFee)}</td>
                <td className="money">0원</td>
              </tr>
              <tr>
                <td>무상제공</td>
                <td>부품</td>
                <td>직수연결키트 (필터)</td>
                <td>필요시</td>
                <td className="money">{formatMoney(data.constants.plumbKitFee)}</td>
                <td className="money">0원</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 공통 안내 + 머신 스펙 (+ 사진 자리) */}
        <section className="mt-4 grid grid-cols-[1.3fr_1fr] gap-3">
          <div className="rounded-lg border border-[hsl(var(--rule))] bg-[hsl(var(--paper))] p-4">
            <p className="eyebrow">Notice</p>
            <h3 className="mt-0.5 text-[15px]">공통 안내</h3>
            <ul className="mt-2.5 space-y-1.5 text-[12px] leading-relaxed text-[hsl(var(--ink))]/80">
              {commonNotes.map((note, i) => (
                <li key={`note-${i}`}>· {note}</li>
              ))}
              {(machine?.description ?? "")
                .split("\n")
                .filter(Boolean)
                .map((line, i) => (
                  <li key={`mn-${i}`}>· {line.replace(/^\*\s*/, "")}</li>
                ))}
            </ul>
          </div>

          <div
            className="rounded-lg border border-[hsl(var(--rule))] p-4"
            style={{ background: "hsl(var(--paper-strong))" }}
          >
            <p className="eyebrow">Spec</p>
            <h3 className="mt-0.5 text-[15px]">머신 스펙</h3>

            {/* Machine image — wired to schema's Machine.imageUrl.
                Falls back to a subtle placeholder until photos are uploaded. */}
            <div className="mt-2.5 overflow-hidden rounded-md border border-[hsl(var(--rule))] bg-[hsl(var(--paper))]">
              {machine?.imageUrl ? (
                <img
                  src={machine.imageUrl}
                  alt={machine.name}
                  className="block h-[110px] w-full object-contain"
                />
              ) : (
                <div className="flex h-[110px] w-full items-center justify-center text-[10px] uppercase tracking-widest text-[hsl(var(--ink))]/30">
                  머신 사진 (추후 DB 업로드)
                </div>
              )}
            </div>

            <ul className="mt-2.5 space-y-1.5 text-[12px] leading-relaxed text-[hsl(var(--ink))]/80">
              {(machine?.spec ?? "")
                .split("\n")
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i}>· {line}</li>
                ))}
            </ul>
          </div>
        </section>

        <footer className="mt-6 flex justify-end border-t border-[hsl(var(--rule))] pt-3 text-right text-[11px] text-[hsl(var(--ink))]/60">
          대표번호 1644-4624 · 대표메일 coffee24@snack24h.com
        </footer>

        <PageNumber n={2} total={totalPages} />
      </article>
    </div>
  );
}

function MetaItem({
  k,
  v,
  breakAll,
  last,
}: {
  k: string;
  v: string;
  breakAll?: boolean;
  last?: boolean;
}) {
  const border = last ? "" : "border-b border-[hsl(var(--rule))]";
  return (
    <div className={`flex items-baseline gap-2.5 border-r border-[hsl(var(--rule))] px-3 py-2 ${border} [&:nth-child(2n)]:border-r-0`}>
      <dt className="w-[78px] shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--ink))]/60">
        {k}
      </dt>
      <dd
        className={`flex-1 text-[12px] leading-snug ${breakAll ? "break-all" : ""}`}
      >
        {v}
      </dd>
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--ink))]/55">{k}</span>
      <span className="text-right text-[12px]">{v}</span>
    </div>
  );
}

function PageNumber({ n, total }: { n: number; total: number }) {
  return (
    <div className="quote-page-number">
      Page {n.toString().padStart(2, "0")} / {total.toString().padStart(2, "0")}
    </div>
  );
}
