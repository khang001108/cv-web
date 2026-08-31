"use client";

import { useRef } from "react";
import type { Product } from "@/lib/types";

function ProductCard({ product }: { product: Product }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const content = (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/70 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10">
      <div className="relative aspect-video overflow-hidden bg-ink/5">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-300 ${
              product.video_url ? "group-hover:opacity-0" : ""
            }`}
          />
        )}
        {product.video_url && (
          <video
            ref={videoRef}
            src={product.video_url}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100"
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-medium text-ink">
          {product.name}
        </h3>
        {product.description && (
          <p className="font-body text-sm leading-relaxed text-muted">
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
          <span className="mt-auto pt-3 font-body text-sm font-medium text-coral">
            Xem sản phẩm ↗
          </span>
        )}
      </div>
    </div>
  );

  if (product.link_url) {
    return (
      <a href={product.link_url} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

export default function Products({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return <p className="font-body text-sm text-muted">Chưa có dữ liệu.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
