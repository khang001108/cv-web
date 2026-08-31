"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Education } from "@/lib/types";
import MediaEditor from "./MediaEditor";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function EducationEditor() {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("education")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setItems((data as Education[]) ?? []);
        setLoading(false);
      });
  }, [supabase]);

  function update(id: string, patch: Partial<Education>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function save(item: Education) {
    await supabase.from("education").update(item).eq("id", item.id);
  }

  async function addNew() {
    const { data } = await supabase
      .from("education")
      .insert({
        school: "Trường mới",
        sort_order: items.length,
      })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data as Education]);
  }

  async function remove(id: string) {
    await supabase.from("education").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) return <p className="font-body text-sm text-muted">Đang tải...</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Trường / Tổ chức">
              <input
                className={inputClass}
                value={item.school}
                onChange={(e) => update(item.id, { school: e.target.value })}
              />
            </Field>
            <Field label="Bằng cấp">
              <input
                className={inputClass}
                value={item.degree ?? ""}
                onChange={(e) => update(item.id, { degree: e.target.value })}
              />
            </Field>
            <Field label="Chuyên ngành">
              <input
                className={inputClass}
                value={item.field ?? ""}
                onChange={(e) => update(item.id, { field: e.target.value })}
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
                value={item.end_date ?? ""}
                onChange={(e) => update(item.id, { end_date: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Mô tả">
            <textarea
              className={inputClass}
              rows={2}
              value={item.description ?? ""}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>
          <Field label="Ảnh và video">
            <MediaEditor
              value={item.media}
              folder={`education/${item.id}`}
              onChange={(media) => update(item.id, { media })}
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
      <IconButton onClick={addNew}>+ Thêm học vấn</IconButton>
    </div>
  );
}
