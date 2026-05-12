import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuoteStore } from "@/stores/quoteStore";
import { useBeans, useCareCycles, useMachines, useSalesReps } from "@/hooks/useCoffeeData";
import { Field, FieldGroup } from "./Field";

export function LeftSidebar() {
  const state = useQuoteStore();
  const machinesQ = useMachines();
  const careQ = useCareCycles();
  const beansQ = useBeans();
  const repsQ = useSalesReps();

  const active = state.activeSection;

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-border bg-background no-print">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Inspector
        </p>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {labelFor(active)}
        </h2>
      </div>

      <div className="scrollthin flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {active === "style" && <StyleSection />}

        {active === "customer" && (
          <FieldGroup title="고객 정보" description="견적서 상단에 표시될 정보입니다.">
            <Field label="고객사명">
              <Input
                value={state.companyName}
                placeholder="예: (주)예시컴퍼니"
                onChange={(e) => state.set("companyName", e.target.value)}
              />
            </Field>
            <Field label="담당자 성함">
              <Input
                value={state.contactName}
                placeholder="예: 홍길동 책임"
                onChange={(e) => state.set("contactName", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="연락처">
                <Input
                  value={state.contactPhone}
                  placeholder="010-0000-0000"
                  onChange={(e) => state.set("contactPhone", e.target.value)}
                />
              </Field>
              <Field label="이메일">
                <Input
                  type="email"
                  value={state.contactEmail}
                  placeholder="name@example.com"
                  onChange={(e) => state.set("contactEmail", e.target.value)}
                />
              </Field>
            </div>
            <Field label="견적일">
              <Input
                type="date"
                value={state.quoteDate}
                onChange={(e) => state.set("quoteDate", e.target.value)}
              />
            </Field>
            <Field label="영업담당자" hint="추후 사내 DB와 동기화될 항목입니다.">
              <Select
                value={state.salesRepName}
                onValueChange={(v) => state.set("salesRepName", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="담당자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(repsQ.data ?? []).map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        )}

        {active === "contract" && (
          <FieldGroup title="계약 옵션" description="머신 / 약정 / 케어 주기를 선택합니다.">
            <Field label="머신" hint="추후 머신 카탈로그 API에서 조회됩니다.">
              <Select
                value={state.machineName}
                onValueChange={(v) => state.set("machineName", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="머신 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(machinesQ.data ?? []).map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="수량">
                <Input
                  type="number"
                  min={1}
                  value={state.machineQuantity}
                  onChange={(e) => state.set("machineQuantity", Math.max(1, Number(e.target.value) || 1))}
                />
              </Field>
              <Field label="약정">
                <Select
                  value={String(state.contractTerm)}
                  onValueChange={(v) => state.set("contractTerm", Number(v) as 24 | 36)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="36">36개월</SelectItem>
                    <SelectItem value="24">24개월</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="케어주기">
              <Select
                value={state.careCycle}
                onValueChange={(v) => state.set("careCycle", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="케어주기" />
                </SelectTrigger>
                <SelectContent>
                  {(careQ.data ?? []).map((c) => (
                    <SelectItem key={c.cycle} value={c.cycle}>
                      {c.cycle}
                      {c.extra > 0 ? ` (+${c.extra.toLocaleString()}원)` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="머신 할인 %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={state.machineDiscount}
                  onChange={(e) => state.set("machineDiscount", clamp(Number(e.target.value) || 0))}
                />
              </Field>
              <Field label="원두 할인 %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={state.beanDiscount}
                  onChange={(e) => state.set("beanDiscount", clamp(Number(e.target.value) || 0))}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-card p-2.5">
              <div>
                <p className="text-sm font-medium">구매시 설치비 포함</p>
                <p className="text-xs text-muted-foreground">머신 구매안 하단에 설치비 라인이 추가됩니다.</p>
              </div>
              <Switch
                checked={state.purchaseInstall}
                onCheckedChange={(v) => state.set("purchaseInstall", v)}
              />
            </div>
          </FieldGroup>
        )}

        {active === "beans" && (
          <FieldGroup
            title="원두 구성"
            description="원두 포함 여부에 따라 '머신 단독 렌탈' 또는 '머신렌탈 & 원두구독' 섹션만 노출됩니다."
          >
            <div className="flex items-center justify-between rounded-md border border-border bg-card p-2.5">
              <div>
                <p className="text-sm font-medium">원두 구독 포함</p>
                <p className="text-xs text-muted-foreground">
                  {state.beansEnabled
                    ? "머신렌탈 & 원두구독 섹션이 활성화됩니다."
                    : "머신 단독 렌탈 섹션이 활성화됩니다."}
                </p>
              </div>
              <Switch
                checked={state.beansEnabled}
                onCheckedChange={(v) => state.set("beansEnabled", v)}
              />
            </div>

            {state.beansEnabled && (
              <>
                <Field label="택배비 처리">
                  <Select
                    value={state.shippingMode}
                    onValueChange={(v) => state.set("shippingMode", v as typeof state.shippingMode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">자동 — 5만원(VAT포함) 미만일 때만 추가</SelectItem>
                      <SelectItem value="yes">항상 추가</SelectItem>
                      <SelectItem value="no">항상 제외</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="space-y-2 rounded-md border border-border bg-card p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">원두 라인</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => state.addBeanLine(beansQ.data?.[0]?.name ?? "브라운스타")}
                    >
                      <Plus className="h-3 w-3" />
                      추가
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {state.beanLines.length === 0 && (
                      <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                        원두 라인이 비어 있습니다.
                      </p>
                    )}
                    {state.beanLines.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-[minmax(0,1fr)_64px_28px] items-center gap-1.5"
                      >
                        <Select
                          value={line.beanName}
                          onValueChange={(v) => state.updateBeanLine(line.id, { beanName: v })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(beansQ.data ?? []).map((b) => (
                              <SelectItem key={b.name} value={b.name}>
                                {b.name} · {b.brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className="h-8 text-xs"
                          value={line.quantity}
                          onChange={(e) =>
                            state.updateBeanLine(line.id, {
                              quantity: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => state.removeBeanLine(line.id)}
                          title="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </FieldGroup>
        )}

        {active === "notes" && <NotesPanel />}
      </div>
    </aside>
  );
}

function labelFor(active: string) {
  switch (active) {
    case "style": return "스타일";
    case "customer": return "고객 정보";
    case "contract": return "계약 옵션";
    case "beans": return "원두 구성";
    case "notes": return "안내";
    default: return "Inspector";
  }
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

function NotesPanel() {
  return (
    <FieldGroup title="안내 사항" description="견적서 하단에 자동 삽입되는 공통 안내문입니다.">
      <ul className="space-y-2 rounded-md border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
        <li>· 36개월 이상 이용 시 커피머신 소유권이 이전됩니다.</li>
        <li>· 1년 무상 A/S 가능합니다. 소비자 과실은 유상 청구될 수 있습니다.</li>
        <li>· 커피24 원두 미사용 또는 장기 미청소로 인한 고장은 유상 청구될 수 있습니다.</li>
        <li>· 케어주기는 상단 계약 옵션에서 변경할 수 있습니다.</li>
      </ul>
    </FieldGroup>
  );
}

function StyleSection() {
  const theme = useQuoteStore((s) => s.theme);
  const set = useQuoteStore((s) => s.set);
  const themes = [
    { id: "warm" as const, label: "Warm Brown", caption: "기본 — 부드러운 크림과 에스프레소 톤" },
    { id: "blue" as const, label: "Modern Blue", caption: "비즈니스 — 인디고 & 슬레이트" },
    { id: "noir" as const, label: "Noir Espresso", caption: "프리미엄 — 어두운 배경 + 골드 잉크" },
    { id: "aurora" as const, label: "Aurora Cream", caption: "에디토리얼 — 피치 & 세이지 파스텔" },
    { id: "brutal" as const, label: "Brutalist Mono", caption: "타이포 중심 — 잉크 + 액센트 오렌지" },
  ];

  return (
    <FieldGroup title="템플릿" description="우측 견적서 미리보기에 즉시 반영됩니다.">
      <div className="space-y-1.5">
        {themes.map((t) => {
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
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-border`}
                data-theme={t.id}
                style={{
                  background: "hsl(var(--paper))",
                  color: "hsl(var(--brand))",
                }}
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
  );
}
