import type { Product } from "@/lib/types";
import { getMediaItems } from "@/lib/media";
import MediaGallery from "./MediaGallery";

function ProductCard({ product }: { product: Product }) {
  const media = getMediaItems(product.media, product.image_url, product.video_url);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/70 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10">
      {media.length > 0 && (
        <div className="bg-ink/5">
          <MediaGallery items={media} variant="carousel" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-medium text-ink">{product.name}</h3>
        {product.description && (
          <p className="whitespace-pre-line font-body text-sm leading-relaxed text-muted">
            {product.description}
          </p>
        )}
        {product.tags?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber/20 px-2.5 py-1 font-body text-xs font-medium text-ink/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {product.link_url && (
          <a
            href={product.link_url}
            target="_blank"
            rel="noreferrer"
            className="mt-auto pt-3 font-body text-sm font-medium text-coral hover:underline"
          >
            Xem sản phẩm ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function Products({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return <p className="font-body text-sm text-muted">Chưa có dữ liệu.</p>;
  }
  return (
    <div className="products-grid grid grid-cols-1 gap-6 sm:grid-cols-2">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
