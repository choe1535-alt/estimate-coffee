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
import { useCareCycles, useMachines } from "@/services/coffee/hooks";

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function ContractPanel() {
  const state = useQuoteStore();
  const machinesQ = useMachines();
  const careQ = useCareCycles();

  return (
    <FieldGroup title="계약 옵션" description="머신 / 약정 / 케어 주기를 선택합니다.">
      <Field label="머신" hint="추후 머신 카탈로그 API에서 조회됩니다.">
        <Select value={state.machineName} onValueChange={(v) => state.set("machineName", v)}>
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
            onChange={(e) =>
              state.set("machineQuantity", Math.max(1, Number(e.target.value) || 1))
            }
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
        <Select value={state.careCycle} onValueChange={(v) => state.set("careCycle", v)}>
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
          <p className="text-xs text-muted-foreground">
            머신 구매안 하단에 설치비 라인이 추가됩니다.
          </p>
        </div>
        <Switch
          checked={state.purchaseInstall}
          onCheckedChange={(v) => state.set("purchaseInstall", v)}
        />
      </div>
    </FieldGroup>
  );
}
