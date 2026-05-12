import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup } from "@/app/Field";
import { useQuoteStore } from "@/services/coffee/store";
import { useSalesReps } from "@/services/coffee/hooks";

export function CustomerPanel() {
  const state = useQuoteStore();
  const repsQ = useSalesReps();

  return (
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
        <Select value={state.salesRepName} onValueChange={(v) => state.set("salesRepName", v)}>
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
  );
}
