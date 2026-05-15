import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle } from "lucide-react";
import { useCoffeeBundle } from "@/services/coffee/hooks";
import { useQuoteStore } from "@/services/coffee/store";
import { computeQuote } from "@/services/coffee/lib/quote";
import { formatDate, formatMoney } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

const MM_TO_PX = 3.7795;
/** Inter-section gap, must match `.quote-page-inner { gap: ... }` in CSS. */
const SECTION_GAP_PX = 16;

type SectionDef = { id: string; node: ReactNode };

/**
 * Quote document with **content-aware auto pagination**.
 *
 * Sections are rendered into a hidden measurement stage to capture
 * their actual heights, then bin-packed into A4-sized pages based on
 * the current padding/orientation. Changing padding, orientation, or
 * any section's content causes the document to re-paginate so sections
 * move up to fill freed space (or push down when more space is needed).
 */
export function QuoteDocument() {
  const state = useQuoteStore();
  const bundle = useCoffeeBundle();

  // ─── Page metrics → CSS vars + dynamic @page ───
  useLayoutEffect(() => {
    const root = document.documentElement;
    const landscape = state.orientation === "landscape";
    root.style.setProperty("--page-width", landscape ? "297mm" : "210mm");
    root.style.setProperty("--page-height", landscape ? "210mm" : "297mm");
    root.style.setProperty("--page-padding-x", `${state.pagePaddingX}mm`);
    root.style.setProperty("--page-padding-y", `${state.pagePaddingY}mm`);
  }, [state.orientation, state.pagePaddingX, state.pagePaddingY]);

  useEffect(() => {
    const id = "dynamic-print-page";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    const sz = state.orientation === "landscape" ? "A4 landscape" : "A4";
    el.textContent = `@media print { @page { size: ${sz}; margin: 0; } }`;
  }, [state.orientation]);

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
  const machine =
    data.machines.find((m) => m.name === state.machineName) ?? data.machines[0];
  const salesRep =
    data.salesReps.find((r) => r.name === state.salesRepName) ?? data.salesReps[0];
  const quoteDate = new Date(`${state.quoteDate}T00:00:00`);

  let recommendedTitle = state.beansEnabled ? "머신렌탈 & 원두구독" : "머신 단독 렌탈";
  let recommendedTotal = state.beansEnabled
    ? quote.totals.bundleVatIncluded
    : quote.totals.rentalOnlyVatIncluded;

  if (!state.showBundle && state.showRental) {
    recommendedTitle = "머신 단독 렌탈";
    recommendedTotal = quote.totals.rentalOnlyVatIncluded;
  } else if (!state.showBundle && !state.showRental && state.showPurchase) {
    recommendedTitle = "머신 구매";
    recommendedTotal = quote.totals.purchaseVatIncluded;
  }

  const renderedNotes = [
    ...state.commonNotes.filter((n) => n.trim().length > 0),
    `케어주기 선택: ${state.careCycle}`,
    state.beansEnabled
      ? quote.shippingIncluded
        ? "원두 금액이 5만원(VAT 포함) 미만이어서 택배비 3,500원(VAT 포함)이 반영되었습니다."
        : "원두 금액이 5만원(VAT 포함) 이상이어서 택배비는 무료입니다."
      : "원두 미포함 옵션 — 머신 단독 렌탈 단가가 적용됩니다.",
  ];

  // Build the flat section list. Each section is one atomic block
  // that the paginator will keep together on a single page.
  const sections: (SectionDef | boolean | null | undefined)[] = [
    {
      id: "header",
      node: (
        <header className="grid grid-cols-[1fr_auto] items-start gap-6 border-b border-[hsl(var(--rule))] pb-5">
          <div className="space-y-1.5">
            <p className="eyebrow">Coffee24 Estimate</p>
            <h1 className="text-[28px] leading-[1.1]">커피머신 정기구독 서비스 견적서</h1>
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
      ),
    },
    {
      id: "meta",
      node: (
        <section className="grid grid-cols-[1.45fr_1fr] gap-3">
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
      ),
    },
    {
      id: "recommended",
      node: (
        <div
          className="flex items-center justify-between gap-3 rounded-lg px-4 py-3"
          style={{
            background: "linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-2)))",
            color: "hsl(var(--paper))",
          }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">추천안</p>
            <p className="font-display text-[18px] font-semibold leading-tight">
              {recommendedTitle}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
              VAT 포함 월 납부금액
            </p>
            <p className="font-display text-[22px] font-semibold leading-tight">
              {formatMoney(recommendedTotal)}
            </p>
          </div>
        </div>
      ),
    },
    state.showPurchase && {
      id: "purchase",
      node: (
        <SectionCard
          title="Option · Purchase"
          subtitle="머신 구매"
          total={quote.totals.purchaseVatIncluded}
          lines={quote.purchaseLines}
          emptyMessage="정리본에 구매 단가가 없는 머신은 ‘문의’로 표시됩니다."
          withDiscountColumn={false}
        />
      ),
    },
    state.showRental && {
      id: "rental",
      node: (
        <SectionCard
          title="Option · Rental"
          subtitle="머신 단독 렌탈"
          total={quote.totals.rentalOnlyVatIncluded}
          lines={quote.rentalOnlyLines}
          emptyMessage="해당 약정 조건의 단독 렌탈 단가가 없습니다."
          withDiscountColumn={false}
        />
      ),
    },
    state.showBundle && {
      id: "bundle",
      node: (
        <SectionCard
          title="Option · Subscription"
          subtitle="머신렌탈 & 원두구독"
          total={quote.totals.bundleVatIncluded}
          lines={quote.bundleLines}
          emptyMessage="원두 라인을 추가하면 이 섹션이 계산됩니다."
        />
      ),
    },
    {
      id: "extras",
      node: (
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
      ),
    },
    {
      id: "noticeSpec",
      node: (
        <section className="grid grid-cols-[1.3fr_1fr] gap-3">
          <div className="rounded-lg border border-[hsl(var(--rule))] bg-[hsl(var(--paper))] p-4">
            <p className="eyebrow">Notice</p>
            <h3 className="mt-0.5 text-[15px]">공통 안내</h3>
            <ul className="mt-2.5 space-y-1.5 text-[12px] leading-relaxed text-[hsl(var(--ink))]/80">
              {renderedNotes.map((note, i) => (
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
            <div className="mt-2.5 overflow-hidden rounded-md border border-[hsl(var(--rule))] bg-[hsl(var(--paper))]">
              {machine?.imageUrl ? (
                <img
                  src={machine.imageUrl}
                  alt={machine.name}
                  className="block aspect-square w-full object-contain"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center text-[10px] uppercase tracking-widest text-[hsl(var(--ink))]/30">
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
      ),
    },
    {
      id: "footer",
      node: (
        <footer className="flex justify-end border-t border-[hsl(var(--rule))] pt-3 text-right text-[11px] text-[hsl(var(--ink))]/60">
          대표번호 1644-4624 · 대표메일 coffee24@snack24h.com
        </footer>
      ),
    },
  ];

  return (
    <PaginatedDocument
      sections={sections.filter((section): section is SectionDef => Boolean(section))}
      theme={state.theme}
    />
  );
}

/**
 * Measures sections via a hidden stage and bin-packs them into pages
 * sized to the current `--page-height` / `--page-padding-y` CSS vars.
 */
function PaginatedDocument({
  sections,
  theme,
}: {
  sections: SectionDef[];
  theme: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pageGroups, setPageGroups] = useState<SectionDef[][]>(() => [sections]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const repaginate = () => {
      // Resolve page capacity from current CSS vars so changes to
      // padding/orientation immediately reflect.
      const rootCs = getComputedStyle(document.documentElement);
      const pageHeightMm = parseFloat(rootCs.getPropertyValue("--page-height")) || 297;
      const padYMm = parseFloat(rootCs.getPropertyValue("--page-padding-y")) || 14;
      const capacityPx = (pageHeightMm - 2 * padYMm) * MM_TO_PX;

      const heights: number[] = sections.map((s) => {
        const el = stage.querySelector(
          `[data-section-id="${s.id}"]`,
        ) as HTMLElement | null;
        return el?.offsetHeight ?? 0;
      });

      const groups: SectionDef[][] = [];
      let current: SectionDef[] = [];
      let currentH = 0;

      sections.forEach((s, i) => {
        const h = heights[i];
        const gap = current.length > 0 ? SECTION_GAP_PX : 0;
        if (currentH + gap + h > capacityPx && current.length > 0) {
          groups.push(current);
          current = [];
          currentH = 0;
        }
        current.push(s);
        currentH += (current.length > 1 ? SECTION_GAP_PX : 0) + h;
      });
      if (current.length > 0) groups.push(current);

      setPageGroups(groups);
    };

    repaginate();

    // Re-paginate whenever any measured section changes size, or when
    // the root CSS vars change (orientation/padding propagation).
    const ro = new ResizeObserver(repaginate);
    Array.from(stage.children).forEach((c) => ro.observe(c as Element));
    const rootMo = new MutationObserver(repaginate);
    rootMo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      ro.disconnect();
      rootMo.disconnect();
    };
  }, [sections]);

  return (
    <div className="quote-document">
      <OverflowWatcher />
      {/* Hidden measurement stage. Width matches a single page's
          inner content area so wrapping behaves exactly like the
          visible page. */}
      <div
        ref={stageRef}
        className="quote-measure-stage"
        data-theme={theme}
        aria-hidden
      >
        {sections.map((s) => (
          <div key={s.id} data-section-id={s.id}>
            {s.node}
          </div>
        ))}
      </div>

      {pageGroups.map((page, i) => (
        <article
          key={`page-${i}`}
          className="quote-page"
          data-theme={theme}
        >
          <div className="quote-page-inner">
            {page.map((s) => (
              <Fragment key={s.id}>{s.node}</Fragment>
            ))}
          </div>
          <PageNumber n={i + 1} total={pageGroups.length} />
        </article>
      ))}
    </div>
  );
}

/**
 * Watches every `.quote-page` and renders a sticky red banner inside
 * the canvas when any page overflows its A4 area. (Auto-pagination
 * usually prevents this; the banner is a guardrail for the case where
 * a single section is taller than one page.)
 */
function OverflowWatcher() {
  const [overflowing, setOverflowing] = useState<number[]>([]);

  useEffect(() => {
    const check = () => {
      const pages = Array.from(document.querySelectorAll<HTMLElement>(".quote-page"));
      const next: number[] = [];
      pages.forEach((el, idx) => {
        const minHeight = parseFloat(getComputedStyle(el).minHeight);
        const overflows = el.scrollHeight > minHeight + 2;
        el.dataset.overflow = overflows ? "true" : "false";
        if (overflows) next.push(idx + 1);
      });
      setOverflowing(next);
    };

    const ro = new ResizeObserver(check);
    const mo = new MutationObserver(() => {
      // Observe new pages as they appear/disappear
      ro.disconnect();
      document
        .querySelectorAll<HTMLElement>(".quote-page")
        .forEach((el) => ro.observe(el));
      check();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    document
      .querySelectorAll<HTMLElement>(".quote-page")
      .forEach((el) => ro.observe(el));
    check();
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  if (overflowing.length === 0) return null;
  return (
    <div className="no-print sticky top-0 z-20 -mb-2 flex w-full max-w-[90%] items-start gap-2 self-center rounded-md border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-700 shadow-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">
          {overflowing.join(", ")}페이지의 단일 섹션이 종이 영역보다 큽니다.
        </p>
        <p className="opacity-80">
          페이지 패딩을 줄이거나, 좌측 패널에서 원두 라인을 분리해보세요.
        </p>
      </div>
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
    <div
      className={`flex items-baseline gap-2.5 border-r border-[hsl(var(--rule))] px-3 py-2 ${border} [&:nth-child(2n)]:border-r-0`}
    >
      <dt className="w-[78px] shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--ink))]/60">
        {k}
      </dt>
      <dd className={`flex-1 text-[12px] leading-snug ${breakAll ? "break-all" : ""}`}>
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

// Exposed for Canvas: returns current natural page width in px.
export function useCoffeePageWidthPx(): number {
  const orientation = useQuoteStore((s) => s.orientation);
  return (orientation === "landscape" ? 297 : 210) * MM_TO_PX;
}
