import type {
  Bean,
  CareCycle,
  Constants,
  Machine,
  MachinePrice,
  SalesRep,
} from "@/services/coffee/types";

const SPREADSHEET_ID =
  import.meta.env.VITE_COFFEE_SHEET_ID ?? "1VOOcyurvIl9TD47KnJWls6NpPz3dlw8g6s4gFAzfy2c";

const DEFAULT_CONSTANTS: Constants = {
  quoteValidDays: 15,
  vatRate: 0.1,
  shippingFeeVatIncluded: 3500,
  freeShippingThresholdVatIncluded: 50000,
  purchaseInstallFee: 70000,
  setupVisitFee: 60000,
  plumbInstallFee: 50000,
  plumbKitFee: 25000,
  ownershipTransferMonths: 36,
};

type SheetRow = Record<string, string>;

function csvUrl(sheetName: string) {
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: sheetName,
  });
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params.toString()}`;
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim().length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim().length > 0)) rows.push(row);
  return rows;
}

async function readSheet(sheetName: string): Promise<SheetRow[]> {
  const response = await fetch(csvUrl(sheetName), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${sheetName} 시트 데이터를 불러오지 못했습니다.`);
  }

  const rows = parseCsv(await response.text());
  const headers = rows[0]?.map((header) => header.trim()) ?? [];

  return rows.slice(1).map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, (values[index] ?? "").trim()]),
    ),
  );
}

function numberValue(value: string | undefined): number {
  const normalized = (value ?? "").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value: string | undefined): number | null {
  const normalized = (value ?? "").replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableText(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export async function fetchMachines(): Promise<Machine[]> {
  const rows = await readSheet("머신정보");
  return rows
    .filter((row) => row["머신 이름"])
    .map((row) => {
      const name = row["머신 이름"];
      return {
        name,
        description: row["머신 설명"] ?? "",
        spec: row["제원"] ?? "",
        productName: row["머신 제품명"] || name,
        rentalItemName: row["머신 품목명"] || "머신 단독 렌탈",
        purchasePrice: nullableNumber(row["구매가"]),
        purchaseLabel: row["구매 표시명"] || row["머신 제품명"] || name,
        imageUrl: nullableText(row["이미지 URL"]),
      };
    });
}

export async function fetchMachinePrices(): Promise<MachinePrice[]> {
  const rows = await readSheet("머신단가");
  return rows
    .filter((row) => row["머신종류"] && row["약정기간"] && row["원두포함여부"])
    .map((row) => ({
      machine: row["머신종류"],
      term: numberValue(row["약정기간"]),
      beansIncluded: row["원두포함여부"] === "O" ? "O" : "X",
      price: numberValue(row["단가"]),
    }));
}

export async function fetchCareCycles(): Promise<CareCycle[]> {
  const rows = await readSheet("케어주기");
  return rows
    .filter((row) => row["케어주기"])
    .map((row) => ({
      cycle: row["케어주기"],
      extra: numberValue(row["추가비용"]),
    }));
}

export async function fetchBeans(): Promise<Bean[]> {
  const rows = await readSheet("원두정보");
  return rows
    .filter((row) => row["원두종류"])
    .map((row) => ({
      name: row["원두종류"],
      price: numberValue(row["원두단가"]),
      brand: row["원두브랜드"] ?? "",
      imageUrl: nullableText(row["이미지 URL"]),
    }));
}

export async function fetchSalesReps(): Promise<SalesRep[]> {
  const rows = await readSheet("영업담당자");
  return rows
    .filter((row) => row["담당자"])
    .map((row) => ({
      name: row["담당자"],
      phone: row["담당자 연락처"] ?? "",
      email: row["담당자 이메일"] ?? "",
    }));
}

export async function fetchConstants(): Promise<Constants> {
  return DEFAULT_CONSTANTS;
}
