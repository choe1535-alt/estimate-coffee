import type {
  Bean,
  ComputedQuote,
  Constants,
  Machine,
  MachinePrice,
  QuoteLine,
  SalesRep,
  CareCycle,
} from "@/services/coffee/types";
import type { QuoteState } from "@/services/coffee/store";

export type CoffeeData = {
  machines: Machine[];
  machinePrices: MachinePrice[];
  careCycles: CareCycle[];
  beans: Bean[];
  salesReps: SalesRep[];
  constants: Constants;
};

export type ResolvedState = QuoteState & {
  machine: Machine | undefined;
  salesRep: SalesRep | undefined;
  careExtraUnit: number;
};

export function resolveState(state: QuoteState, data: CoffeeData): ResolvedState {
  const machine = data.machines.find((m) => m.name === state.machineName) ?? data.machines[0];
  const salesRep = data.salesReps.find((r) => r.name === state.salesRepName) ?? data.salesReps[0];
  const careExtraUnit = data.careCycles.find((c) => c.cycle === state.careCycle)?.extra ?? 0;
  return { ...state, machine, salesRep, careExtraUnit };
}

function priceFor(
  prices: MachinePrice[],
  machine: string,
  term: number,
  beansIncluded: "O" | "X",
): number | null {
  const row = prices.find(
    (p) => p.machine === machine && Number(p.term) === Number(term) && p.beansIncluded === beansIncluded,
  );
  return row?.price ?? null;
}

function line(input: {
  type: string;
  productName: string;
  itemName: string;
  term: string;
  quantity: number;
  unit: string;
  listPrice: number | null;
  discountPrice: number | null;
}): QuoteLine {
  const { quantity, discountPrice } = input;
  const amount = discountPrice == null ? null : discountPrice * quantity;
  return { ...input, amount };
}

/**
 * Mirrors template-Excel logic:
 *   원두포함여부 = beansEnabled ? "O" : "X"
 *   - 원두포함여부 = "X" → only "머신 단독 렌탈" section renders
 *   - 원두포함여부 = "O" → only "머신렌탈 & 원두구독" section renders
 * "머신 구매" is always rendered as a comparison option.
 */
export function computeQuote(state: QuoteState, data: CoffeeData): ComputedQuote {
  const { constants, machinePrices, beans, machines } = data;
  const machine = machines.find((m) => m.name === state.machineName) ?? machines[0];
  const machineDiscount = (state.machineDiscount ?? 0) / 100;
  const beanDiscount = (state.beanDiscount ?? 0) / 100;
  const vatRate = constants.vatRate;
  const beanMap = new Map(beans.map((b) => [b.name, b]));

  const validUntil = new Date(`${state.quoteDate}T00:00:00`);
  validUntil.setDate(validUntil.getDate() + constants.quoteValidDays);

  // ---- 머신 구매 (always) ----
  const purchaseLines: QuoteLine[] = [];
  if (machine.purchasePrice != null) {
    const discounted = Math.round(machine.purchasePrice * (1 - machineDiscount));
    purchaseLines.push(
      line({
        type: "머신 구매",
        productName: machine.purchaseLabel,
        itemName: "머신 구매(AS/케어서비스 없음)",
        term: "-",
        quantity: state.machineQuantity,
        unit: "EA",
        listPrice: machine.purchasePrice,
        discountPrice: discounted,
      }),
    );
  } else {
    purchaseLines.push(
      line({
        type: "머신 구매",
        productName: machine.purchaseLabel,
        itemName: "머신 구매(AS/케어서비스 없음)",
        term: "-",
        quantity: state.machineQuantity,
        unit: "EA",
        listPrice: null,
        discountPrice: null,
      }),
    );
  }
  if (state.purchaseInstall) {
    purchaseLines.push(
      line({
        type: "설치비",
        productName: "설치 출장비",
        itemName: "머신 구매시 설치비 청구",
        term: "-",
        quantity: state.machineQuantity,
        unit: "EA",
        listPrice: constants.purchaseInstallFee,
        discountPrice: constants.purchaseInstallFee,
      }),
    );
  }

  // ---- 머신 단독 렌탈 — only when beans disabled ----
  let rentalOnlyLines: QuoteLine[] = [];
  if (!state.beansEnabled) {
    const unit = priceFor(machinePrices, machine.name, state.contractTerm, "X");
    const discounted = unit == null ? null : Math.round(unit * (1 - machineDiscount));
    rentalOnlyLines = [
      line({
        type: "커피머신 단독",
        productName: machine.productName,
        itemName: machine.rentalItemName,
        term: `${state.contractTerm}개월`,
        quantity: state.machineQuantity,
        unit: "EA",
        listPrice: unit,
        discountPrice: discounted,
      }),
    ];
  }

  // ---- 머신렌탈 & 원두구독 — only when beans enabled ----
  let bundleLines: QuoteLine[] = [];
  let shippingIncluded = false;
  let beanSubtotalVatIncluded = 0;

  if (state.beansEnabled) {
    const bundleUnit = priceFor(machinePrices, machine.name, state.contractTerm, "O");
    const rentalUnit = priceFor(machinePrices, machine.name, state.contractTerm, "X");
    const discountedBundle = bundleUnit == null ? null : Math.round(bundleUnit * (1 - machineDiscount));

    const machineLine = line({
      type: "커피머신 정기구독",
      productName: machine.productName,
      itemName: `${state.careCycle} 정기케어`,
      term: `${state.contractTerm}개월`,
      quantity: state.machineQuantity,
      unit: "EA",
      listPrice: rentalUnit ?? bundleUnit,
      discountPrice: discountedBundle,
    });

    const beanLineItems: QuoteLine[] = state.beanLines
      .filter((b) => b.quantity > 0)
      .map((entry) => {
        const bean = beanMap.get(entry.beanName);
        if (!bean) {
          return line({
            type: "원두 정기구독",
            productName: "Best 원두",
            itemName: entry.beanName,
            term: `${state.contractTerm}개월`,
            quantity: entry.quantity,
            unit: "KG",
            listPrice: null,
            discountPrice: null,
          });
        }
        const discounted = Math.round(bean.price * (1 - beanDiscount));
        return line({
          type: "원두 정기구독",
          productName: `${bean.brand} 원두`,
          itemName: bean.name,
          term: `${state.contractTerm}개월`,
          quantity: entry.quantity,
          unit: "KG",
          listPrice: bean.price,
          discountPrice: discounted,
        });
      });

    const beanSubtotalVatExcluded = beanLineItems.reduce(
      (sum, b) => sum + (b.amount ?? 0),
      0,
    );
    beanSubtotalVatIncluded = beanSubtotalVatExcluded * (1 + vatRate);

    const careExtra = data.careCycles.find((c) => c.cycle === state.careCycle)?.extra ?? 0;
    const careLine = careExtra > 0
      ? line({
          type: "케어서비스",
          productName: "머신 케어",
          itemName: `${state.careCycle} 머신 케어 추가`,
          term: `${state.contractTerm}개월`,
          quantity: state.machineQuantity,
          unit: "회",
          listPrice: careExtra,
          discountPrice: careExtra,
        })
      : null;

    if (state.shippingMode === "yes") {
      shippingIncluded = true;
    } else if (state.shippingMode === "auto") {
      shippingIncluded =
        beanLineItems.length > 0 &&
        beanSubtotalVatIncluded < constants.freeShippingThresholdVatIncluded;
    }

    const shippingLine = shippingIncluded
      ? line({
          type: "배송비",
          productName: "택배비",
          itemName: "택배비",
          term: `${state.contractTerm}개월`,
          quantity: 1,
          unit: "EA",
          listPrice: 0,
          discountPrice: constants.shippingFeeVatIncluded / (1 + vatRate),
        })
      : null;

    bundleLines = [
      machineLine,
      ...beanLineItems,
      ...(careLine ? [careLine] : []),
      ...(shippingLine ? [shippingLine] : []),
    ];
  }

  const sum = (lines: QuoteLine[]) => lines.reduce((acc, l) => acc + (l.amount ?? 0), 0);
  const allNumeric = (lines: QuoteLine[]) =>
    lines.length > 0 && lines.every((l) => l.amount != null);

  return {
    validUntil,
    purchaseLines,
    rentalOnlyLines,
    bundleLines,
    beanSubtotalVatIncluded,
    shippingIncluded,
    totals: {
      purchaseVatIncluded: allNumeric(purchaseLines) ? sum(purchaseLines) * (1 + vatRate) : null,
      rentalOnlyVatIncluded: allNumeric(rentalOnlyLines) ? sum(rentalOnlyLines) * (1 + vatRate) : null,
      bundleVatIncluded: allNumeric(bundleLines) ? sum(bundleLines) * (1 + vatRate) : null,
    },
  };
}
