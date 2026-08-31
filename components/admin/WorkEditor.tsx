"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkHistory } from "@/lib/types";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function WorkEditor() {
  const supabase = createClient();
  const [items, setItems] = useState<WorkHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("work_history")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setItems((data as WorkHistory[]) ?? []);
        setLoading(false);
      });
  }, []);

  function update(id: string, patch: Partial<WorkHistory>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function save(item: WorkHistory) {
    await supabase.from("work_history").update(item).eq("id", item.id);
  }

  async function addNew() {
    const { data } = await supabase
      .from("work_history")
      .insert({ company: "Công ty mới", position: "Vị trí", sort_order: items.length })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data as WorkHistory]);
  }

  async function remove(id: string) {
    await supabase.from("work_history").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) return <p className="font-body text-sm text-muted">Đang tải...</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Công ty">
              <input
                className={inputClass}
                value={item.company}
                onChange={(e) => update(item.id, { company: e.target.value })}
              />
            </Field>
            <Field label="Vị trí / Nghề">
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
                onChange={(e) =>
                  update(item.id, { sort_order: Number(e.target.value) })
                }
              />
            </Field>
            <label className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                checked={item.is_current}
                onChange={(e) => update(item.id, { is_current: e.target.checked })}
              />
              <span className="font-body text-sm text-ink">Đang làm việc</span>
            </label>
          </div>
          <Field label="Mô tả công việc">
            <textarea
              className={inputClass}
              rows={2}
              value={item.description ?? ""}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>
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
