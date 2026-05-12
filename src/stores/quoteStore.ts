import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayInputValue, uid } from "@/lib/utils";
import type { BeanLineInput, ThemeId } from "@/types/domain";

export type ShippingMode = "auto" | "yes" | "no";
export type ContractTerm = 24 | 36;
export type ActiveSection = "style" | "customer" | "contract" | "beans" | "notes";

export type QuoteState = {
  theme: ThemeId;
  activeSection: ActiveSection;

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

  set: <K extends keyof QuoteState>(key: K, value: QuoteState[K]) => void;
  patch: (patch: Partial<QuoteState>) => void;
  setActiveSection: (s: ActiveSection) => void;

  addBeanLine: (beanName: string) => void;
  updateBeanLine: (id: string, patch: Partial<BeanLineInput>) => void;
  removeBeanLine: (id: string) => void;

  reset: () => void;
};

const initialBeans: BeanLineInput[] = [
  { id: uid(), beanName: "브라운스타", quantity: 1 },
];

const baseDefaults = {
  theme: "warm" as ThemeId,
  activeSection: "customer" as ActiveSection,

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
};

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      ...baseDefaults,

      set: (key, value) => set((prev) => ({ ...prev, [key]: value })),
      patch: (patch) => set((prev) => ({ ...prev, ...patch })),
      setActiveSection: (s) => set({ activeSection: s }),

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

      reset: () => set({ ...baseDefaults, beanLines: [{ id: uid(), beanName: "브라운스타", quantity: 1 }] }),
    }),
    {
      name: "coffee24-quote",
      version: 3,
      partialize: (state) => {
        const { set, patch, addBeanLine, updateBeanLine, removeBeanLine, reset, setActiveSection, ...rest } = state;
        void set; void patch; void addBeanLine; void updateBeanLine; void removeBeanLine; void reset; void setActiveSection;
        return rest;
      },
    },
  ),
);
