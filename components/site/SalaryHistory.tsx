import type { SalaryHistory } from "@/lib/types";
import { formatCurrency, formatRange } from "@/lib/format";
import MediaGallery from "./MediaGallery";

export default function SalaryHistoryList({ items }: { items: SalaryHistory[] }) {
  if (items.length === 0) {
    return <p className="font-body text-sm text-muted">Chưa có dữ liệu.</p>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`flex flex-col gap-3 px-5 py-4 ${
            i % 2 === 0 ? "bg-white/60" : "bg-transparent"
          }`}
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-body text-sm font-medium text-ink">
                {item.position}
                {item.company && (
                  <span className="text-muted"> · {item.company}</span>
                )}
              </p>
              <p className="whitespace-pre-line font-body text-xs text-muted">
                {formatRange(item.period_start, item.period_end, false)}
                {item.note ? ` · ${item.note}` : ""}
              </p>
            </div>
            {item.amount !== null && (
              <span className="font-display text-lg font-medium text-teal">
                {formatCurrency(item.amount, item.currency)}
              </span>
            )}
          </div>
          <MediaGallery items={item.media} variant="compact" />
        </div>
      ))}
    </div>
  );
}
