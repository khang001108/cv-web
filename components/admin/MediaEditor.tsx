"use client";

import { useState } from "react";
import { uploadToCvMedia } from "@/lib/upload";
import type { MediaItem } from "@/lib/types";
import { IconButton } from "./ui";

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
                <video
                  src={item.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video h-full w-full bg-ink object-cover"
                />
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
        Có thể chọn nhiều ảnh và video cùng lúc. Nhớ bấm Lưu sau khi tải xong.
      </p>
      {uploading && <p className="font-body text-xs text-teal">Đang tải media...</p>}
    </div>
  );
}
