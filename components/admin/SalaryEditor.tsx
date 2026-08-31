"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SalaryHistory } from "@/lib/types";
import MediaEditor from "./MediaEditor";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function SalaryEditor() {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<SalaryHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("salary_history")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setItems((data as SalaryHistory[]) ?? []);
        setLoading(false);
      });
  }, [supabase]);

  function update(id: string, patch: Partial<SalaryHistory>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function save(item: SalaryHistory) {
    await supabase.from("salary_history").update(item).eq("id", item.id);
  }

  async function addNew() {
    const { data } = await supabase
      .from("salary_history")
      .insert({ position: "Vị trí", currency: "VND", sort_order: items.length })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data as SalaryHistory]);
  }

  async function remove(id: string) {
    await supabase.from("salary_history").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) return <p className="font-body text-sm text-muted">Đang tải...</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Vị trí">
              <input
                className={inputClass}
                value={item.position}
                onChange={(e) => update(item.id, { position: e.target.value })}
              />
            </Field>
            <Field label="Công ty">
              <input
                className={inputClass}
                value={item.company ?? ""}
                onChange={(e) => update(item.id, { company: e.target.value })}
              />
            </Field>
            <Field label="Mức lương">
              <input
                type="number"
                className={inputClass}
                value={item.amount ?? ""}
                onChange={(e) => update(item.id, { amount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Đơn vị tiền tệ">
              <input
                className={inputClass}
                value={item.currency}
                onChange={(e) => update(item.id, { currency: e.target.value })}
              />
            </Field>
            <Field label="Từ">
              <input
                type="date"
                className={inputClass}
                value={item.period_start ?? ""}
                onChange={(e) => update(item.id, { period_start: e.target.value })}
              />
            </Field>
            <Field label="Đến">
              <input
                type="date"
                className={inputClass}
                value={item.period_end ?? ""}
                onChange={(e) => update(item.id, { period_end: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Ghi chú">
            <input
              className={inputClass}
              value={item.note ?? ""}
              onChange={(e) => update(item.id, { note: e.target.value })}
            />
          </Field>
          <Field label="Ảnh và video">
            <MediaEditor
              value={item.media}
              folder={`salary/${item.id}`}
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
      <IconButton onClick={addNew}>+ Thêm mức lương</IconButton>
    </div>
  );
}
