import { formatRange } from "@/lib/format";

export type TimelineEntry = {
  id: string;
  title: string;
  subtitle: string;
  range: string;
  description?: string | null;
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="font-body text-sm text-muted">Chưa có dữ liệu.</p>;
  }
  return (
    <ol className="rail flex flex-col gap-10 pl-8">
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-8 top-1.5 h-3 w-3 rounded-full bg-coral" />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="font-display text-lg font-medium text-ink">
              {e.title}
            </h3>
            {e.range && (
              <span className="font-body text-sm text-muted">{e.range}</span>
            )}
          </div>
          <p className="font-body text-sm font-medium text-coral">
            {e.subtitle}
          </p>
          {e.description && (
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-muted">
              {e.description}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export { formatRange };
