"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Experience } from "@/lib/types";
import MediaEditor from "./MediaEditor";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function ExperienceEditor() {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("experience")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setItems((data as Experience[]) ?? []);
        setLoading(false);
      });
  }, [supabase]);

  function update(id: string, patch: Partial<Experience>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function save(item: Experience) {
    await supabase.from("experience").update(item).eq("id", item.id);
  }

  async function addNew() {
    const { data } = await supabase
      .from("experience")
      .insert({ title: "Kỹ năng mới", category: "Khác", level: 3, sort_order: items.length })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data as Experience]);
  }

  async function remove(id: string) {
    await supabase.from("experience").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) return <p className="font-body text-sm text-muted">Đang tải...</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tên kỹ năng / kinh nghiệm">
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) => update(item.id, { title: e.target.value })}
              />
            </Field>
            <Field label="Nhóm (VD: Công cụ, Kỹ năng mềm)">
              <input
                className={inputClass}
                value={item.category ?? ""}
                onChange={(e) => update(item.id, { category: e.target.value })}
              />
            </Field>
            <Field label="Mức độ (1-5)">
              <input
                type="number"
                min={1}
                max={5}
                className={inputClass}
                value={item.level ?? ""}
                onChange={(e) => update(item.id, { level: Number(e.target.value) })}
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
          </div>
          <Field label="Ghi chú">
            <input
              className={inputClass}
              value={item.description ?? ""}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>
          <Field label="Ảnh và video">
            <MediaEditor
              value={item.media}
              folder={`experience/${item.id}`}
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
      <IconButton onClick={addNew}>+ Thêm kỹ năng</IconButton>
    </div>
  );
}
