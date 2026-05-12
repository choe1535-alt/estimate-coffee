import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuoteStore } from "@/services/coffee/store";
import { Field, FieldGroup } from "@/app/Field";

const THEMES = [
  { id: "warm" as const, label: "Warm Brown", caption: "기본 — 부드러운 크림과 에스프레소 톤" },
  { id: "blue" as const, label: "Modern Blue", caption: "비즈니스 — 인디고 & 슬레이트" },
  { id: "aurora" as const, label: "Aurora Cream", caption: "에디토리얼 — 피치 & 세이지 파스텔" },
  { id: "brutal" as const, label: "Brutalist Mono", caption: "타이포 중심 — 잉크 + 액센트 오렌지" },
];

const PADDING_MIN = 4;
const PADDING_MAX = 30;
const clampPad = (v: number) => Math.max(PADDING_MIN, Math.min(PADDING_MAX, v));

export function StylePanel() {
  const theme = useQuoteStore((s) => s.theme);
  const orientation = useQuoteStore((s) => s.orientation);
  const pagePaddingX = useQuoteStore((s) => s.pagePaddingX);
  const pagePaddingY = useQuoteStore((s) => s.pagePaddingY);
  const set = useQuoteStore((s) => s.set);

  return (
    <div className="space-y-6">
      <FieldGroup title="템플릿" description="견적서 미리보기에만 적용됩니다.">
        <div className="space-y-1.5">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => set("theme", t.id)}
                className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition ${
                  active
                    ? "border-primary bg-accent/40"
                    : "border-border hover:border-primary/40 hover:bg-accent/20"
                }`}
              >
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-border"
                  data-theme={t.id}
                  style={{ background: "hsl(var(--paper))", color: "hsl(var(--brand))" }}
                >
                  <span className="text-[10px] font-bold tracking-widest">Aa</span>
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.caption}</span>
                </span>
                {active && (
                  <span className="mt-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    선택됨
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <FieldGroup
        title="페이지 방향"
        description="A4 세로/가로 — 미리보기와 인쇄에 즉시 반영됩니다."
      >
        <div className="grid grid-cols-2 gap-2">
          <OrientationButton
            active={orientation === "portrait"}
            onClick={() => set("orientation", "portrait")}
            label="세로 (A4)"
            ratio={[26, 36]}
          />
          <OrientationButton
            active={orientation === "landscape"}
            onClick={() => set("orientation", "landscape")}
            label="가로 (A4)"
            ratio={[36, 26]}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="페이지 패딩"
        description="견적서 내부 여백을 mm 단위로 조정합니다 (4~30mm)."
      >
        <div className="grid grid-cols-2 gap-2">
          <Field label="좌·우 (mm)">
            <Input
              type="number"
              min={PADDING_MIN}
              max={PADDING_MAX}
              value={pagePaddingX}
              onChange={(e) => set("pagePaddingX", clampPad(Number(e.target.value) || 0))}
            />
          </Field>
          <Field label="상·하 (mm)">
            <Input
              type="number"
              min={PADDING_MIN}
              max={PADDING_MAX}
              value={pagePaddingY}
              onChange={(e) => set("pagePaddingY", clampPad(Number(e.target.value) || 0))}
            />
          </Field>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            set("pagePaddingX", 16);
            set("pagePaddingY", 14);
          }}
        >
          <RotateCcw className="h-3 w-3" />
          기본값(14·16mm)
        </Button>
      </FieldGroup>
    </div>
  );
}

function OrientationButton({
  active,
  onClick,
  label,
  ratio,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ratio: [number, number];
}) {
  const [w, h] = ratio;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-md border px-3 py-3 transition ${
        active ? "border-primary bg-accent/40" : "border-border hover:bg-accent/20"
      }`}
    >
      <span
        className="flex items-center justify-center rounded-sm border border-border bg-card"
        style={{ width: w, height: h }}
      />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
