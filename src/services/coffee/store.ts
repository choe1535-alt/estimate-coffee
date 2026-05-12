import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayInputValue, uid } from "@/lib/utils";
import type { BeanLineInput, Orientation, ThemeId } from "@/services/coffee/types";

export type ShippingMode = "auto" | "yes" | "no";
export type ContractTerm = 24 | 36;

export type QuoteState = {
  theme: ThemeId;

  /** Editor & print paper orientation. */
  orientation: Orientation;
  /** Left/right page padding in mm. */
  pagePaddingX: number;
  /** Top/bottom page padding in mm. */
  pagePaddingY: number;

  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  quoteDate: string; // yyyy-mm-dd

  salesRepName: string;
  machineName: string;
  machineQuantity: number;
  contractTerm: ContractTerm;
  careCycle: string;
  machineDiscount: number; // 0..100
  beanDiscount: number; // 0..100
  purchaseInstall: boolean;

  beansEnabled: boolean;
  shippingMode: ShippingMode;
  beanLines: BeanLineInput[];

  /** User-editable common-notice lines printed under "공통 안내". */
  commonNotes: string[];

  set: <K extends keyof QuoteState>(key: K, value: QuoteState[K]) => void;
  patch: (patch: Partial<QuoteState>) => void;

  addBeanLine: (beanName: string) => void;
  updateBeanLine: (id: string, patch: Partial<BeanLineInput>) => void;
  removeBeanLine: (id: string) => void;

  addNote: (text?: string) => void;
  updateNote: (index: number, text: string) => void;
  removeNote: (index: number) => void;
  resetNotes: () => void;

  reset: () => void;
};

const DEFAULT_NOTES = [
  "36개월 이상 이용 시 커피머신 소유권이 이전됩니다.",
  "1년 무상 A/S 가능합니다. 단, 소비자 과실은 유상 청구될 수 있습니다.",
  "커피24 원두 미사용 또는 장기 미청소로 인한 고장은 유상 청구될 수 있습니다.",
  "케어주기는 상단 계약 옵션에서 변경할 수 있습니다.",
];

const initialBeans: BeanLineInput[] = [
  { id: uid(), beanName: "브라운스타", quantity: 1 },
];

const baseDefaults = {
  theme: "warm" as ThemeId,

  orientation: "portrait" as Orientation,
  pagePaddingX: 16,
  pagePaddingY: 14,

  companyName: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  quoteDate: todayInputValue(),

  salesRepName: "김서영",
  machineName: "TE-201U",
  machineQuantity: 1,
  contractTerm: 36 as ContractTerm,
  careCycle: "4개월 1회",
  machineDiscount: 0,
  beanDiscount: 0,
  purchaseInstall: true,

  beansEnabled: true,
  shippingMode: "auto" as ShippingMode,
  beanLines: initialBeans,

  commonNotes: [...DEFAULT_NOTES],
};

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      ...baseDefaults,

      set: (key, value) => set((prev) => ({ ...prev, [key]: value })),
      patch: (patch) => set((prev) => ({ ...prev, ...patch })),

      addBeanLine: (beanName) =>
        set((prev) => ({
          beanLines: [...prev.beanLines, { id: uid(), beanName, quantity: 1 }],
        })),
      updateBeanLine: (id, patch) =>
        set((prev) => ({
          beanLines: prev.beanLines.map((line) =>
            line.id === id ? { ...line, ...patch } : line,
          ),
        })),
      removeBeanLine: (id) =>
        set((prev) => ({
          beanLines: prev.beanLines.filter((line) => line.id !== id),
        })),

      addNote: (text = "") =>
        set((prev) => ({ commonNotes: [...prev.commonNotes, text] })),
      updateNote: (index, text) =>
        set((prev) => ({
          commonNotes: prev.commonNotes.map((n, i) => (i === index ? text : n)),
        })),
      removeNote: (index) =>
        set((prev) => ({
          commonNotes: prev.commonNotes.filter((_, i) => i !== index),
        })),
      resetNotes: () => set({ commonNotes: [...DEFAULT_NOTES] }),

      reset: () =>
        set({
          ...baseDefaults,
          beanLines: [{ id: uid(), beanName: "브라운스타", quantity: 1 }],
          commonNotes: [...DEFAULT_NOTES],
        }),
    }),
    {
      name: "coffee24-quote",
      version: 5,
      migrate: (persisted: unknown, from) => {
        if (!persisted || typeof persisted !== "object") return persisted as Partial<QuoteState>;
        const obj = persisted as Record<string, unknown>;
        // v3 → drop activeSection (moved to shell appStore in v4)
        if (from < 4) delete obj.activeSection;
        // v4 → ensure new fields exist with defaults
        if (from < 5) {
          if (obj.orientation == null) obj.orientation = "portrait";
          if (typeof obj.pagePaddingX !== "number") obj.pagePaddingX = 16;
          if (typeof obj.pagePaddingY !== "number") obj.pagePaddingY = 14;
          if (!Array.isArray(obj.commonNotes)) obj.commonNotes = [...DEFAULT_NOTES];
        }
        return obj as Partial<QuoteState>;
      },
      partialize: (state) => {
        const {
          set,
          patch,
          addBeanLine,
          updateBeanLine,
          removeBeanLine,
          addNote,
          updateNote,
          removeNote,
          resetNotes,
          reset,
          ...rest
        } = state;
        void set;
        void patch;
        void addBeanLine;
        void updateBeanLine;
        void removeBeanLine;
        void addNote;
        void updateNote;
        void removeNote;
        void resetNotes;
        void reset;
        return rest;
      },
    },
  ),
);
