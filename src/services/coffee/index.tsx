import { Building2, Coffee, Cog, Leaf, Palette, StickyNote } from "lucide-react";
import type { Service } from "@/services/types";
import { QuoteDocument, useCoffeePageWidthPx } from "./components/QuoteDocument";
import { SummaryPanel } from "./components/SummaryPanel";
import { StylePanel } from "./components/panels/StylePanel";
import { CustomerPanel } from "./components/panels/CustomerPanel";
import { ContractPanel } from "./components/panels/ContractPanel";
import { BeansPanel } from "./components/panels/BeansPanel";
import { NotesPanel } from "./components/panels/NotesPanel";

export const coffeeService: Service = {
  id: "coffee",
  name: "Coffee24 견적서",
  shortName: "Coffee24",
  tagline: "커피머신·원두 정기구독 견적",
  icon: <Coffee className="h-4 w-4" />,
  accent: ["#6f4b35", "#b98e70"],

  sections: [
    { id: "style", label: "스타일", icon: <Palette className="h-4 w-4" />, Panel: StylePanel },
    { id: "customer", label: "고객", icon: <Building2 className="h-4 w-4" />, Panel: CustomerPanel },
    { id: "contract", label: "계약", icon: <Cog className="h-4 w-4" />, Panel: ContractPanel },
    { id: "beans", label: "원두", icon: <Leaf className="h-4 w-4" />, Panel: BeansPanel },
    { id: "notes", label: "안내", icon: <StickyNote className="h-4 w-4" />, Panel: NotesPanel },
  ],
  defaultSectionId: "customer",

  QuoteDocument,
  SummaryPanel,
  useNaturalPageWidthPx: useCoffeePageWidthPx,
};
