import type { MediaItem } from "@/lib/types";

export default function MediaGallery({
  items,
  variant = "grid",
}: {
  items: MediaItem[] | null | undefined;
  variant?: "grid" | "carousel" | "compact";
}) {
  if (!items?.length) return null;

  const containerClass = {
    grid: "grid grid-cols-1 gap-3 sm:grid-cols-2",
    carousel: "flex snap-x snap-mandatory gap-2 overflow-x-auto",
    compact: "grid grid-cols-2 gap-2 sm:grid-cols-3",
  }[variant];

  const itemClass =
    variant === "carousel"
      ? "aspect-video min-w-full snap-start"
      : "aspect-video w-full";

  return (
    <div className={containerClass}>
      {items.map((item) =>
        item.type === "image" ? (
          <img
            key={item.id}
            src={item.url}
            alt=""
            loading="lazy"
            className={`${itemClass} rounded-xl object-cover`}
          />
        ) : (
          <video
            key={item.id}
            src={item.url}
            controls
            playsInline
            preload="metadata"
            className={`${itemClass} rounded-xl bg-ink object-cover`}
          />
        )
      )}
    </div>
  );
}
