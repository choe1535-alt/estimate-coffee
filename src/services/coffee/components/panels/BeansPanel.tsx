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
import { Field, FieldGroup } from "@/app/Field";
import { useQuoteStore } from "@/services/coffee/store";
import { useBeans } from "@/services/coffee/hooks";

export function BeansPanel() {
  const state = useQuoteStore();
  const beansQ = useBeans();

  return (
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
              onValueChange={(v) =>
                state.set("shippingMode", v as typeof state.shippingMode)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  자동 — 5만원(VAT포함) 미만일 때만 추가
                </SelectItem>
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
  );
}
