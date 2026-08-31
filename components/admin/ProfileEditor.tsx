"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCvMedia } from "@/lib/upload";
import type { Profile, Social } from "@/lib/types";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function ProfileEditor() {
  const [supabase] = useState(() => createClient());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setLoadError(error.message);
      } else if (!data) {
        setLoadError(
          "Không tìm thấy hồ sơ. Hãy chạy lại file supabase/schema.sql trong Supabase SQL Editor."
        );
      } else {
        setProfile(data as Profile);
      }

      setLoading(false);
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function update(patch: Partial<Profile>) {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    setSaved(false);
  }

  function updateSocial(index: number, patch: Partial<Social>) {
    if (!profile) return;
    const socials = [...profile.socials];
    socials[index] = { ...socials[index], ...patch };
    update({ socials });
  }

  function addSocial() {
    if (!profile) return;
    update({ socials: [...profile.socials, { label: "", url: "" }] });
  }

  function removeSocial(index: number) {
    if (!profile) return;
    update({ socials: profile.socials.filter((_, i) => i !== index) });
  }

  async function handleAvatarUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCvMedia(file, "avatar");
      update({ avatar_url: url });
    } catch {
      alert("Tải ảnh thất bại. Kiểm tra bucket 'cv-media' đã được tạo chưa.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!profile) return;
    const { error } = await supabase.from("profile").update(profile).eq("id", 1);
    if (error) {
      alert(`Không thể lưu hồ sơ: ${error.message}`);
      return;
    }
    setSaved(true);
  }

  if (loading)
    return <p className="font-body text-sm text-muted">Đang tải...</p>;

  if (loadError || !profile)
    return (
      <div className="rounded-xl border border-coral/30 bg-coral/5 p-4 font-body text-sm text-ink">
        <p className="font-medium">Không thể tải hồ sơ từ Supabase.</p>
        <p className="mt-1 text-muted">{loadError}</p>
      </div>
    );

  return (
    <Card>
      <div className="flex items-center gap-4">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover"
          />
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
            className="font-body text-xs"
          />
          {uploading && <p className="font-body text-xs text-muted">Đang tải lên...</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Họ tên">
          <input
            className={inputClass}
            value={profile.full_name}
            onChange={(e) => update({ full_name: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputClass}
            value={profile.email ?? ""}
            onChange={(e) => update({ email: e.target.value })}
          />
        </Field>
        <Field label="Điện thoại">
          <input
            className={inputClass}
            value={profile.phone ?? ""}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </Field>
        <Field label="Địa điểm">
          <input
            className={inputClass}
            value={profile.location ?? ""}
            onChange={(e) => update({ location: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Vai trò (cách nhau bằng dấu phẩy để xoay vòng trên hero)">
        <input
          className={inputClass}
          value={profile.headline}
          placeholder="Manufacturing Engineer, Web Developer, Game Maker"
          onChange={(e) => update({ headline: e.target.value })}
        />
      </Field>

      <Field label="Mô tả bản thân">
        <textarea
          className={inputClass}
          rows={4}
          value={profile.bio}
          onChange={(e) => update({ bio: e.target.value })}
        />
      </Field>

      <div>
        <p className="mb-2 font-body text-xs font-medium text-muted">
          Liên kết mạng xã hội / portfolio
        </p>
        <div className="flex flex-col gap-2">
          {profile.socials.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={inputClass + " w-32"}
                placeholder="Tên (GitHub)"
                value={s.label}
                onChange={(e) => updateSocial(i, { label: e.target.value })}
              />
              <input
                className={inputClass + " flex-1"}
                placeholder="https://..."
                value={s.url}
                onChange={(e) => updateSocial(i, { url: e.target.value })}
              />
              <IconButton variant="danger" onClick={() => removeSocial(i)}>
                Xóa
              </IconButton>
            </div>
          ))}
          <IconButton onClick={addSocial}>+ Thêm liên kết</IconButton>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="font-body text-xs text-teal">Đã lưu ✓</span>}
        <IconButton variant="primary" onClick={save}>
          Lưu hồ sơ
        </IconButton>
      </div>
    </Card>
  );
}
