import { formatMoney } from "@/lib/utils";
import type { QuoteLine } from "@/services/coffee/types";

export function PricingTable({
  lines,
  withDiscountColumn = true,
}: {
  lines: QuoteLine[];
  withDiscountColumn?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
    <table className="pricing-table">
      <thead>
        <tr>
          <th>유형</th>
          <th>제품명</th>
          <th>품목명</th>
          <th>약정</th>
          <th className="money">수량</th>
          <th>단위</th>
          <th className="money">정가</th>
          {withDiscountColumn && <th className="money">할인 단가</th>}
          <th className="money">금액</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line, i) => (
          <tr key={i}>
            <td className="whitespace-pre-line">{line.type}</td>
            <td className="whitespace-pre-line">{line.productName}</td>
            <td className="whitespace-pre-line">{line.itemName}</td>
            <td>{line.term}</td>
            <td className="money">{line.quantity}</td>
            <td>{line.unit}</td>
            <td className="money">{formatMoney(line.listPrice)}</td>
            {withDiscountColumn && (
              <td className="money">{formatMoney(line.discountPrice)}</td>
            )}
            <td className="money">{formatMoney(line.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
