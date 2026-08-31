import type { Experience } from "@/lib/types";
import MediaGallery from "./MediaGallery";

export default function Skills({ items }: { items: Experience[] }) {
  if (items.length === 0) {
    return <p className="font-body text-sm text-muted">Chưa có dữ liệu.</p>;
  }

  const groups = items.reduce<Record<string, Experience[]>>((acc, item) => {
    const key = item.category || "Khác";
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(groups).map(([category, list]) => (
        <div key={category}>
          <h3 className="mb-3 font-body text-sm font-semibold text-muted">
            {category}
          </h3>
          <div className="flex flex-col gap-3">
            {list.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-ink/5 p-3">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="w-40 shrink-0 font-body text-sm font-medium text-ink sm:w-48">
                    {item.title}
                  </span>
                  {item.level && (
                    <span className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-2 w-5 rounded-full"
                          style={{
                            background:
                              i < item.level!
                                ? "linear-gradient(90deg, rgb(var(--color-accent)), rgb(var(--color-secondary)))"
                                : "rgb(var(--color-ink) / 0.1)",
                          }}
                        />
                      ))}
                    </span>
                  )}
                  {item.description && (
                    <span className="whitespace-pre-line font-body text-xs text-muted">
                      {item.description}
                    </span>
                  )}
                </div>
                <MediaGallery items={item.media} variant="compact" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
