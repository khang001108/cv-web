export function formatMonthYear(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${mm}/${d.getFullYear()}`;
}

export function formatRange(
  start: string | null,
  end: string | null,
  isCurrent?: boolean
): string {
  const s = formatMonthYear(start);
  const e = isCurrent ? "Hiện tại" : end ? formatMonthYear(end) : "";
  if (!s && !e) return "";
  if (s && e) return `${s} — ${e}`;
  return s || e;
}

export function formatCurrency(amount: number | null, currency: string): string {
  if (amount === null || amount === undefined) return "";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("vi-VN")} ${currency}`;
  }
}
