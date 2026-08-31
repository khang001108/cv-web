"use client";

import { useRef, useState } from "react";
import { uploadToCvMedia } from "@/lib/upload";
import type { MediaItem } from "@/lib/types";
import { IconButton, inputClass } from "./ui";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function VideoTrimEditor({
  item,
  onApply,
  onClose,
}: {
  item: MediaItem;
  onApply: (item: MediaItem) => void;
  onClose: () => void;
}) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(Math.max(0, item.start_time ?? 0));
  const [end, setEnd] = useState(Math.max(0, item.end_time ?? 0));

  function loadDuration(video: HTMLVideoElement) {
    const total = Number.isFinite(video.duration) ? video.duration : 0;
    const safeStart = clamp(item.start_time ?? 0, 0, Math.max(0, total - 0.1));
    const safeEnd = clamp(item.end_time ?? total, safeStart + 0.1, total);
    setDuration(total);
    setStart(safeStart);
    setEnd(safeEnd);
    video.currentTime = safeStart;
  }

  function updateStart(value: number) {
    const next = clamp(value, 0, Math.max(0, end - 0.1));
    setStart(next);
    if (previewRef.current) previewRef.current.currentTime = next;
  }

  function updateEnd(value: number) {
    setEnd(clamp(value, start + 0.1, duration));
  }

  function preview() {
    const video = previewRef.current;
    if (!video) return;
    video.currentTime = start;
    void video.play();
  }

  function stopAtTrimEnd(video: HTMLVideoElement) {
    if (video.currentTime < start - 0.15) video.currentTime = start;
    if (end > 0 && video.currentTime >= end) {
      video.pause();
      video.currentTime = start;
    }
  }

  function apply() {
    if (duration <= 0) return;
    const roundedStart = Math.round(start * 10) / 10;
    const roundedEnd = Math.round(end * 10) / 10;
    onApply({
      ...item,
      start_time: roundedStart > 0 ? roundedStart : undefined,
      end_time: roundedEnd < duration - 0.05 ? roundedEnd : undefined,
    });
    onClose();
  }

  function removeTrim() {
    onApply({ id: item.id, type: item.type, url: item.url });
    onClose();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-teal/35 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-body text-sm font-semibold text-ink">Cắt đoạn video</p>
          <p className="font-body text-[11px] text-muted">
            Chọn thời điểm bắt đầu và kết thúc rồi bấm Áp dụng.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-ink/15 px-3 py-1 font-body text-xs"
        >
          Đóng
        </button>
      </div>

      <video
        ref={previewRef}
        src={item.url}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => loadDuration(event.currentTarget)}
        onTimeUpdate={(event) => stopAtTrimEnd(event.currentTarget)}
        onSeeking={(event) => stopAtTrimEnd(event.currentTarget)}
        className="max-h-80 w-full rounded-lg bg-ink object-contain"
      />

      {duration > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 font-body text-xs text-muted">
              <span>Bắt đầu: {formatTime(start)} ({start.toFixed(1)} giây)</span>
              <input
                type="range"
                min={0}
                max={Math.max(0, end - 0.1)}
                step={0.1}
                value={start}
                onChange={(event) => updateStart(Number(event.target.value))}
                className="accent-teal"
              />
              <input
                type="number"
                min={0}
                max={Math.max(0, end - 0.1)}
                step={0.1}
                value={start}
                onChange={(event) => updateStart(Number(event.target.value))}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2 font-body text-xs text-muted">
              <span>Kết thúc: {formatTime(end)} ({end.toFixed(1)} giây)</span>
              <input
                type="range"
                min={Math.min(duration, start + 0.1)}
                max={duration}
                step={0.1}
                value={end}
                onChange={(event) => updateEnd(Number(event.target.value))}
                className="accent-coral"
              />
              <input
                type="number"
                min={Math.min(duration, start + 0.1)}
                max={duration}
                step={0.1}
                value={end}
                onChange={(event) => updateEnd(Number(event.target.value))}
                className={inputClass}
              />
            </label>
          </div>

          <p className="font-body text-xs text-muted">
            Độ dài đoạn đã chọn: <strong className="text-ink">{formatTime(end - start)}</strong>
          </p>

          <div className="flex flex-wrap gap-2">
            <IconButton onClick={preview}>Phát thử đoạn cắt</IconButton>
            <IconButton onClick={apply} variant="primary">Áp dụng đoạn cắt</IconButton>
            {(item.start_time != null || item.end_time != null) && (
              <IconButton onClick={removeTrim} variant="danger">Bỏ cắt</IconButton>
            )}
          </div>
        </>
      ) : (
        <p className="font-body text-xs text-muted">Đang đọc độ dài video...</p>
      )}

      <p className="font-body text-[11px] text-muted">
        Thao tác này không làm mất video gốc; trang công khai chỉ phát đoạn đã chọn.
      </p>
    </div>
  );
}

export default function MediaEditor({
  value,
  onChange,
  folder,
}: {
  value: MediaItem[] | null | undefined;
  onChange: (media: MediaItem[]) => void;
  folder: string;
}) {
  const media = value ?? [];
  const [uploading, setUploading] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  async function uploadFiles(files: FileList | null) {
    const selected = Array.from(files ?? []).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (selected.length === 0) return;

    setUploading(true);
    const added: MediaItem[] = [];
    const failed: string[] = [];

    for (const file of selected) {
      try {
        const type: MediaItem["type"] = file.type.startsWith("video/")
          ? "video"
          : "image";
        const url = await uploadToCvMedia(file, `${folder}/${type}`);
        added.push({ id: crypto.randomUUID(), type, url });
      } catch {
        failed.push(file.name);
      }
    }

    if (added.length > 0) onChange([...media, ...added]);
    if (failed.length > 0) {
      alert(`Không tải được: ${failed.join(", ")}`);
    }
    setUploading(false);
  }

  function remove(id: string) {
    onChange(media.filter((item) => item.id !== id));
    if (editingVideoId === id) setEditingVideoId(null);
  }

  function updateItem(updated: MediaItem) {
    onChange(media.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-ink/[0.02] p-3">
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {media.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-lg bg-ink/5">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt="Media đã tải"
                  className="aspect-video h-full w-full object-cover"
                />
              ) : (
                <>
                  <video
                    src={item.url}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      if (item.start_time) event.currentTarget.currentTime = item.start_time;
                    }}
                    className="aspect-video w-full bg-ink object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => setEditingVideoId(item.id)}
                      className="rounded-full bg-teal/20 px-3 py-1 font-body text-[11px] font-medium text-ink transition hover:bg-teal"
                    >
                      ✂ Cắt video
                    </button>
                    {(item.start_time != null || item.end_time != null) && (
                      <span className="font-body text-[10px] text-muted">
                        {formatTime(item.start_time ?? 0)}–{item.end_time != null ? formatTime(item.end_time) : "hết"}
                      </span>
                    )}
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Xóa media"
                className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-1 font-body text-[10px] text-paper transition hover:bg-coral"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}

      {editingVideoId && (() => {
        const item = media.find(
          (candidate) => candidate.id === editingVideoId && candidate.type === "video"
        );
        return item ? (
          <VideoTrimEditor
            key={item.id}
            item={item}
            onApply={updateItem}
            onClose={() => setEditingVideoId(null)}
          />
        ) : null;
      })()}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          disabled={uploading}
          onChange={(event) => {
            const files = event.currentTarget.files;
            void uploadFiles(files);
            event.currentTarget.value = "";
          }}
          className="min-w-0 flex-1 font-body text-xs"
        />
        {media.length > 0 && (
          <IconButton onClick={() => onChange([])}>Bỏ tất cả</IconButton>
        )}
      </div>
      <p className="font-body text-[11px] text-muted">
        Có thể chọn nhiều ảnh và video cùng lúc. Video có thể cắt đoạn sau khi tải.
        Nhớ bấm Lưu sau khi hoàn tất.
      </p>
      {uploading && <p className="font-body text-xs text-teal">Đang tải media...</p>}
    </div>
  );
}
