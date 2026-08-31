import type { WorkHistory, WorkDisplayLayout } from "@/lib/types";
import { formatRange } from "@/lib/format";
import { getMediaItems } from "@/lib/media";
import MediaGallery from "./MediaGallery";

function WorkMedia({ item }: { item: WorkHistory }) {
  return (
    <MediaGallery
      items={getMediaItems(item.media, item.image_url, item.video_url)}
      variant="grid"
    />
  );
}

function WorkContent({ item }: { item: WorkHistory }) {
  const range = formatRange(item.start_date, item.end_date, item.is_current);
  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h3 className="font-display text-xl font-medium text-ink">{item.position}</h3>
        {range && <span className="shrink-0 font-body text-sm text-muted">{range}</span>}
      </div>
      <p className="font-body text-sm font-medium text-coral">{item.company}</p>
      {item.description && (
        <p className="mt-3 whitespace-pre-line font-body text-sm leading-relaxed text-muted">
          {item.description}
        </p>
      )}
    </div>
  );
}

function layoutOf(item: WorkHistory): WorkDisplayLayout {
  return item.display_layout ?? "timeline";
}

export default function WorkHistoryList({ items }: { items: WorkHistory[] }) {
  return (
    <div className="flex flex-col gap-8">
      {items.map((item) => {
        const layout = layoutOf(item);
        const hasMedia = getMediaItems(item.media, item.image_url, item.video_url).length > 0;

        if (layout === "timeline" || !hasMedia) {
          return (
            <article key={item.id} className="relative border-l-2 border-ink/10 pb-2 pl-7">
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-coral" />
              <WorkContent item={item} />
              {hasMedia && (
                <div className="mt-4">
                  <WorkMedia item={item} />
                </div>
              )}
            </article>
          );
        }

        if (layout === "media-top") {
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-white/60 shadow-sm"
            >
              <WorkMedia item={item} />
              <div className="p-5 sm:p-6">
                <WorkContent item={item} />
              </div>
            </article>
          );
        }

        const mediaFirst = layout === "media-left";
        return (
          <article
            key={item.id}
            className="grid items-center gap-5 rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-sm md:grid-cols-2 md:p-6"
          >
            <div className={mediaFirst ? "md:order-1" : "md:order-2"}>
              <WorkMedia item={item} />
            </div>
            <div className={mediaFirst ? "md:order-2" : "md:order-1"}>
              <WorkContent item={item} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
