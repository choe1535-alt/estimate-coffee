export type Machine = {
  name: string;
  description: string;
  spec: string;
  productName: string;
  rentalItemName: string;
  purchasePrice: number | null;
  purchaseLabel: string;
  /**
   * Public URL of the machine product photo.
   * Null until the photo is uploaded; the quote renders a "사진 자리"
   * placeholder in that case. Reserved here so the eventual DB schema
   * can drop in `image_url` without a client-side refactor.
   */
  imageUrl: string | null;
};

export type MachinePrice = {
  machine: string;
  term: 24 | 36 | number;
  beansIncluded: "O" | "X";
  price: number;
};

export type CareCycle = {
  cycle: string;
  extra: number;
};

export type Bean = {
  name: string;
  price: number;
  brand: string;
  /**
   * Same convention as Machine.imageUrl — reserved for future bean
   * product photography uploads.
   */
  imageUrl: string | null;
};

export type SalesRep = {
  name: string;
  phone: string;
  email: string;
};

export type Constants = {
  quoteValidDays: number;
  vatRate: number;
  shippingFeeVatIncluded: number;
  freeShippingThresholdVatIncluded: number;
  purchaseInstallFee: number;
  setupVisitFee: number;
  plumbInstallFee: number;
  plumbKitFee: number;
  ownershipTransferMonths: number;
};

export type ThemeId = "warm" | "blue" | "aurora" | "brutal";
export type Orientation = "portrait" | "landscape";

export type BeanLineInput = {
  id: string;
  beanName: string;
  quantity: number;
};

export type QuoteLine = {
  type: string;
  productName: string;
  itemName: string;
  term: string;
  quantity: number;
  unit: string;
  listPrice: number | null;
  discountPrice: number | null;
  amount: number | null;
};

export type ComputedQuote = {
  validUntil: Date;
  purchaseLines: QuoteLine[];
  rentalOnlyLines: QuoteLine[];
  bundleLines: QuoteLine[];
  beanSubtotalVatIncluded: number;
  shippingIncluded: boolean;
  totals: {
    purchaseVatIncluded: number | null;
    rentalOnlyVatIncluded: number | null;
    bundleVatIncluded: number | null;
  };
};
