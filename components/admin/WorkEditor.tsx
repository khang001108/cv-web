"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkDisplayLayout, WorkHistory } from "@/lib/types";
import { getMediaItems } from "@/lib/media";
import MediaEditor from "./MediaEditor";
import { Field, inputClass, Card, IconButton } from "./ui";

const WORK_LAYOUTS: Array<{ value: WorkDisplayLayout; label: string }> = [
  { value: "timeline", label: "Dòng thời gian" },
  { value: "media-left", label: "Ảnh/video bên trái" },
  { value: "media-right", label: "Ảnh/video bên phải" },
  { value: "media-top", label: "Ảnh/video phía trên" },
];

export default function WorkEditor() {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<WorkHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWork() {
      const { data, error } = await supabase
        .from("work_history")
        .select("*")
        .order("sort_order");

      if (cancelled) return;
      if (error) setLoadError(error.message);
      else setItems((data as WorkHistory[]) ?? []);
      setLoading(false);
    }

    void loadWork();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function update(id: string, patch: Partial<WorkHistory>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setSavedId((current) => (current === id ? null : current));
  }

  async function save(item: WorkHistory) {
    const { error } = await supabase.from("work_history").update(item).eq("id", item.id);
    if (error) {
      alert(`Không thể lưu công việc: ${error.message}`);
      return;
    }
    setSavedId(item.id);
  }

  async function addNew() {
    const { data, error } = await supabase
      .from("work_history")
      .insert({
        company: "Công ty mới",
        position: "Vị trí",
        display_layout: "timeline",
        sort_order: items.length,
      })
      .select()
      .single();

    if (error) {
      alert(`Không thể thêm công việc: ${error.message}`);
      return;
    }
    if (data) setItems((prev) => [...prev, data as WorkHistory]);
  }

  async function remove(id: string) {
    if (!window.confirm("Xóa công việc này?")) return;
    const { error } = await supabase.from("work_history").delete().eq("id", id);
    if (error) {
      alert(`Không thể xóa công việc: ${error.message}`);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (loading) return <p className="font-body text-sm text-muted">Đang tải...</p>;

  if (loadError)
    return (
      <div className="rounded-xl border border-coral/30 bg-coral/5 p-4 font-body text-sm text-ink">
        <p className="font-medium">Không thể tải danh sách công việc.</p>
        <p className="mt-1 text-muted">{loadError}</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <Card key={item.id}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-ink">
              Công việc {index + 1}
            </h2>
            {savedId === item.id && (
              <span className="font-body text-xs text-teal">Đã lưu ✓</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Công ty">
              <input
                className={inputClass}
                value={item.company}
                onChange={(e) => update(item.id, { company: e.target.value })}
              />
            </Field>
            <Field label="Vị trí / Công việc">
              <input
                className={inputClass}
                value={item.position}
                onChange={(e) => update(item.id, { position: e.target.value })}
              />
            </Field>
            <Field label="Bắt đầu">
              <input
                type="date"
                className={inputClass}
                value={item.start_date ?? ""}
                onChange={(e) => update(item.id, { start_date: e.target.value })}
              />
            </Field>
            <Field label="Kết thúc">
              <input
                type="date"
                className={inputClass}
                disabled={item.is_current}
                value={item.end_date ?? ""}
                onChange={(e) => update(item.id, { end_date: e.target.value })}
              />
            </Field>
            <Field label="Thứ tự hiển thị">
              <input
                type="number"
                className={inputClass}
                value={item.sort_order}
                onChange={(e) => update(item.id, { sort_order: Number(e.target.value) })}
              />
            </Field>
            <Field label="Bố trí hiển thị">
              <select
                className={inputClass}
                value={item.display_layout ?? "timeline"}
                onChange={(e) =>
                  update(item.id, {
                    display_layout: e.target.value as WorkDisplayLayout,
                  })
                }
              >
                {WORK_LAYOUTS.map((layout) => (
                  <option key={layout.value} value={layout.value}>
                    {layout.label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={item.is_current}
                onChange={(e) =>
                  update(item.id, {
                    is_current: e.target.checked,
                    end_date: e.target.checked ? null : item.end_date,
                  })
                }
              />
              <span className="font-body text-sm text-ink">Đang làm việc</span>
            </label>
          </div>

          <Field label="Mô tả công việc">
            <textarea
              className={inputClass}
              rows={5}
              value={item.description ?? ""}
              placeholder="Mỗi ý có thể nằm trên một dòng riêng..."
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
            <span className="font-body text-[11px] text-muted">
              Nhấn Enter hoặc Shift + Enter để xuống dòng; trang CV sẽ giữ nguyên cách xuống dòng.
            </span>
          </Field>

          <Field label="Ảnh và video công việc">
            <MediaEditor
              value={getMediaItems(item.media, item.image_url, item.video_url)}
              folder={`work/${item.id}`}
              onChange={(media) =>
                update(item.id, { media, image_url: null, video_url: null })
              }
            />
          </Field>

          <p className="font-body text-[11px] text-muted">
            Sau khi tải ảnh/video hoặc đổi bố trí, bấm Lưu để cập nhật trang CV.
          </p>

          <div className="flex justify-end gap-2">
            <IconButton variant="danger" onClick={() => remove(item.id)}>
              Xóa
            </IconButton>
            <IconButton variant="primary" onClick={() => save(item)}>
              Lưu
            </IconButton>
          </div>
        </Card>
      ))}
      <IconButton onClick={addNew}>+ Thêm công việc</IconButton>
    </div>
  );
}
