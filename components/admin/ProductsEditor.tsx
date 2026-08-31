"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCvMedia } from "@/lib/upload";
import type { Product } from "@/lib/types";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function ProductsEditor() {
  const supabase = createClient();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setItems((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

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

  async function handleUpload(
    id: string,
    field: "image_url" | "video_url",
    file: File | undefined
  ) {
    if (!file) return;
    setUploading(id + field);
    try {
      const url = await uploadToCvMedia(file, field === "image_url" ? "images" : "videos");
      update(id, { [field]: url } as Partial<Product>);
    } catch {
      alert("Tải lên thất bại. Kiểm tra bucket 'cv-media' đã được tạo chưa.");
    } finally {
      setUploading(null);
    }
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ảnh sản phẩm">
              <div className="flex items-center gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(item.id, "image_url", e.target.files?.[0])}
                  className="font-body text-xs"
                />
              </div>
              {uploading === item.id + "image_url" && (
                <span className="font-body text-xs text-muted">Đang tải lên...</span>
              )}
            </Field>
            <Field label="Video ngắn (giới thiệu)">
              <div className="flex items-center gap-3">
                {item.video_url && (
                  <video src={item.video_url} className="h-14 w-20 rounded-lg object-cover" muted />
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleUpload(item.id, "video_url", e.target.files?.[0])}
                  className="font-body text-xs"
                />
              </div>
              {uploading === item.id + "video_url" && (
                <span className="font-body text-xs text-muted">Đang tải lên...</span>
              )}
            </Field>
          </div>

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
