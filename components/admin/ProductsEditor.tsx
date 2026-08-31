"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { getMediaItems } from "@/lib/media";
import MediaEditor from "./MediaEditor";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function ProductsEditor() {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setItems((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [supabase]);

  function update(id: string, patch: Partial<Product>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function save(item: Product) {
    await supabase.from("products").update(item).eq("id", item.id);
  }

  async function addNew() {
    const { data } = await supabase
      .from("products")
      .insert({ name: "Sản phẩm mới", tags: [], sort_order: items.length })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data as Product]);
  }

  async function remove(id: string) {
    await supabase.from("products").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) return <p className="font-body text-sm text-muted">Đang tải...</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tên sản phẩm">
              <input
                className={inputClass}
                value={item.name}
                onChange={(e) => update(item.id, { name: e.target.value })}
              />
            </Field>
            <Field label="Link sản phẩm">
              <input
                className={inputClass}
                value={item.link_url ?? ""}
                placeholder="https://..."
                onChange={(e) => update(item.id, { link_url: e.target.value })}
              />
            </Field>
            <Field label="Tags (phân cách bằng dấu phẩy)">
              <input
                className={inputClass}
                value={item.tags?.join(", ") ?? ""}
                onChange={(e) =>
                  update(item.id, {
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
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
          <Field label="Mô tả">
            <textarea
              className={inputClass}
              rows={2}
              value={item.description ?? ""}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>

          <Field label="Ảnh và video sản phẩm">
            <MediaEditor
              value={getMediaItems(item.media, item.image_url, item.video_url)}
              folder={`products/${item.id}`}
              onChange={(media) =>
                update(item.id, { media, image_url: null, video_url: null })
              }
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
      <IconButton onClick={addNew}>+ Thêm sản phẩm</IconButton>
    </div>
  );
}
