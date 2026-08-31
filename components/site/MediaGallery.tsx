"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createPortal } from "react-dom";
import type { MediaItem } from "@/lib/types";

type Point = { x: number; y: number };

export default function MediaGallery({
  items,
  variant = "grid",
}: {
  items: MediaItem[] | null | undefined;
  variant?: "grid" | "carousel" | "compact";
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const drag = useRef<
    | { pointerId: number; x: number; y: number; originX: number; originY: number }
    | null
  >(null);

  const mediaItems = items ?? [];
  const selected = selectedIndex === null ? null : mediaItems[selectedIndex];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (selectedIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        setSelectedIndex((current) => {
          if (current === null || mediaItems.length < 2) return current;
          return (current + direction + mediaItems.length) % mediaItems.length;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, mediaItems.length]);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    drag.current = null;
  }, [selectedIndex]);

  if (mediaItems.length === 0) return null;

  const containerClass = {
    grid: "grid grid-cols-1 gap-3 sm:grid-cols-2",
    carousel: "flex snap-x snap-mandatory gap-2 overflow-x-auto",
    compact: "grid grid-cols-2 gap-2 sm:grid-cols-3",
  }[variant];

  const itemClass =
    variant === "carousel"
      ? "aspect-video min-w-full snap-start"
      : "aspect-video w-full";

  function open(index: number) {
    setSelectedIndex(index);
  }

  function close() {
    setSelectedIndex(null);
  }

  function showRelative(direction: number) {
    setSelectedIndex((current) => {
      if (current === null || mediaItems.length < 2) return current;
      return (current + direction + mediaItems.length) % mediaItems.length;
    });
  }

  function changeZoom(nextZoom: number) {
    const clamped = Math.min(4, Math.max(1, nextZoom));
    setZoom(clamped);
    if (clamped === 1) setOffset({ x: 0, y: 0 });
  }

  function handleWheel(event: ReactWheelEvent<HTMLImageElement>) {
    event.preventDefault();
    changeZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLImageElement>) {
    if (zoom === 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLImageElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    setOffset({
      x: drag.current.originX + event.clientX - drag.current.x,
      y: drag.current.originY + event.clientY - drag.current.y,
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLImageElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const lightbox =
    mounted && selectedIndex !== null && selected
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 text-white sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={selected.type === "image" ? "Xem ảnh lớn" : "Xem video"}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="absolute left-3 top-3 z-20 rounded-full bg-black/55 px-3 py-2 font-body text-xs sm:left-6 sm:top-6">
              {selectedIndex + 1} / {mediaItems.length}
            </div>

            <button
              type="button"
              autoFocus
              onClick={close}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/15 p-2.5 text-white transition hover:bg-white/25 sm:right-6 sm:top-6"
              aria-label="Đóng"
            >
              <X className="h-6 w-6" />
            </button>

            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => showRelative(-1)}
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition hover:bg-white/20 sm:left-5 sm:p-3"
                  aria-label="Media trước"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => showRelative(1)}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition hover:bg-white/20 sm:right-5 sm:p-3"
                  aria-label="Media tiếp theo"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            <div
              className="flex h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] items-center justify-center overflow-hidden sm:h-[calc(100vh-8rem)] sm:w-[calc(100vw-8rem)]"
              onClick={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              {selected.type === "image" ? (
                <img
                  src={selected.url}
                  alt={`Ảnh ${selectedIndex + 1}`}
                  draggable={false}
                  onWheel={handleWheel}
                  onDoubleClick={() => changeZoom(zoom === 1 ? 2.5 : 1)}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`max-h-full max-w-full select-none object-contain ${
                    zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
                  }`}
                  style={{
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                    transition: drag.current ? "none" : "transform 150ms ease",
                    touchAction: "none",
                  }}
                />
              ) : (
                <video
                  key={selected.id}
                  src={selected.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full rounded-lg bg-black object-contain"
                />
              )}
            </div>

            {selected.type === "image" && (
              <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/65 p-1.5 shadow-xl backdrop-blur sm:bottom-5">
                <button
                  type="button"
                  onClick={() => changeZoom(zoom - 0.5)}
                  disabled={zoom === 1}
                  className="rounded-full p-2 transition hover:bg-white/15 disabled:opacity-35"
                  aria-label="Thu nhỏ"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="min-w-14 text-center font-body text-xs">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => changeZoom(zoom + 0.5)}
                  disabled={zoom === 4}
                  className="rounded-full p-2 transition hover:bg-white/15 disabled:opacity-35"
                  aria-label="Phóng to"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeZoom(1)}
                  className="rounded-full p-2 transition hover:bg-white/15"
                  aria-label="Đặt lại kích thước"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={containerClass}>
        {mediaItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => open(index)}
            className={`${itemClass} group relative overflow-hidden rounded-xl bg-ink/10 text-left`}
            aria-label={item.type === "image" ? "Mở ảnh lớn" : "Mở video"}
          >
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={`Ảnh ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <>
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="pointer-events-none h-full w-full bg-ink object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
                  <span className="rounded-full bg-white/90 p-3 text-black shadow-lg">
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                </span>
              </>
            )}
            {item.type === "image" && (
              <span className="absolute right-2 top-2 rounded-full bg-black/55 p-2 text-white opacity-0 transition group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </span>
            )}
          </button>
        ))}
      </div>
      {lightbox}
    </>
  );
}
