"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCvMedia } from "@/lib/upload";
import type { BackgroundStyle, Profile, Social, SocialPlatform, ThemeName } from "@/lib/types";
import {
  BACKGROUND_OPTIONS,
  inferSocialPlatform,
  SOCIAL_OPTIONS,
  socialHref,
  THEME_OPTIONS,
} from "@/lib/profile-options";
import { Field, inputClass, Card, IconButton } from "./ui";

export default function ProfileEditor() {
  const [supabase] = useState(() => createClient());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "background" | null>(null);

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

  function changeSocialPlatform(index: number, platform: SocialPlatform) {
    const defaultLabel =
      SOCIAL_OPTIONS.find((option) => option.value === platform)?.label ?? "Liên kết";
    updateSocial(index, { platform, label: defaultLabel });
  }

  function addSocial() {
    if (!profile) return;
    update({
      socials: [
        ...profile.socials,
        { platform: "facebook", label: "Facebook", url: "" },
      ],
    });
  }

  function removeSocial(index: number) {
    if (!profile) return;
    update({ socials: profile.socials.filter((_, i) => i !== index) });
  }

  async function handleImageUpload(
    kind: "avatar" | "background",
    file: File | undefined
  ) {
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadToCvMedia(
        file,
        kind === "avatar" ? "avatar" : "backgrounds"
      );
      update(kind === "avatar" ? { avatar_url: url } : { background_url: url });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      alert(`Tải ảnh thất bại: ${message}`);
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (!profile) return;
    const { error } = await supabase.from("profile").update(profile).eq("id", 1);
    if (error) {
      const schemaHint = error.message.includes("schema cache")
        ? "\nHãy chạy lại file supabase/schema.sql trong đúng project Supabase rồi tải lại trang."
        : "";
      alert(`Không thể lưu hồ sơ: ${error.message}${schemaHint}`);
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

  const selectedTheme = profile.theme ?? "coral";
  const selectedBackground = profile.background_style ?? "aurora";

  return (
    <Card>
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Ảnh hồ sơ</h2>
          <p className="font-body text-xs text-muted">Nên dùng ảnh vuông, rõ mặt.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-ink/5">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Ảnh hồ sơ"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-body text-xs text-muted">Chưa có ảnh</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload("avatar", e.target.files?.[0])}
              className="font-body text-xs"
            />
            {uploading === "avatar" && (
              <p className="font-body text-xs text-muted">Đang tải ảnh hồ sơ...</p>
            )}
          </div>
        </div>
      </section>

      <div className="h-px bg-ink/10" />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Ảnh nền và bối cảnh</h2>
          <p className="font-body text-xs text-muted">
            Ảnh nền là tùy chọn; bối cảnh vẫn hoạt động khi không có ảnh.
          </p>
        </div>

        <div className="relative h-36 overflow-hidden rounded-2xl bg-ink">
          {profile.background_url ? (
            <img
              src={profile.background_url}
              alt="Ảnh nền hiện tại"
              className="h-full w-full object-cover opacity-75"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-body text-sm text-paper/60">
              Chưa chọn ảnh nền
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload("background", e.target.files?.[0])}
            className="font-body text-xs"
          />
          {profile.background_url && (
            <IconButton onClick={() => update({ background_url: null })}>
              Bỏ ảnh nền
            </IconButton>
          )}
          {uploading === "background" && (
            <span className="font-body text-xs text-muted">Đang tải ảnh nền...</span>
          )}
        </div>

        <Field label="Kiểu bối cảnh">
          <select
            className={inputClass}
            value={selectedBackground}
            onChange={(e) =>
              update({ background_style: e.target.value as BackgroundStyle })
            }
          >
            {BACKGROUND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <div className="h-px bg-ink/10" />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Giao diện màu</h2>
          <p className="font-body text-xs text-muted">Chọn bảng màu cho toàn bộ trang CV.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.value}
              type="button"
              aria-pressed={selectedTheme === theme.value}
              onClick={() => update({ theme: theme.value as ThemeName })}
              className={`rounded-xl border p-3 text-left transition ${
                selectedTheme === theme.value
                  ? "border-coral bg-coral/5"
                  : "border-ink/10 hover:border-ink/25"
              }`}
            >
              <span className="mb-2 flex gap-1">
                {theme.colors.map((color) => (
                  <span
                    key={color}
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              <span className="font-body text-xs font-medium text-ink">{theme.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="h-px bg-ink/10" />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium text-ink">Thông tin cá nhân</h2>
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

        <Field label="Vai trò (cách nhau bằng dấu phẩy để xoay vòng trên đầu trang)">
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
      </section>

      <div className="h-px bg-ink/10" />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Mạng xã hội</h2>
          <p className="font-body text-xs text-muted">
            Có thể dán link đầy đủ, nhập @username hoặc số điện thoại. Zalo và WhatsApp
            sẽ tự tạo link từ số điện thoại.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {profile.socials.map((social, index) => {
            const platform = inferSocialPlatform(social);
            const previewHref = socialHref(social);
            return (
              <div
                key={index}
                className="grid gap-2 rounded-xl border border-ink/10 bg-ink/[0.02] p-3 sm:grid-cols-[10rem_9rem_1fr_auto]"
              >
                <select
                  aria-label="Mạng xã hội"
                  className={inputClass}
                  value={platform}
                  onChange={(e) =>
                    changeSocialPlatform(index, e.target.value as SocialPlatform)
                  }
                >
                  {SOCIAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Tên hiển thị"
                  className={inputClass}
                  placeholder="Tên hiển thị"
                  value={social.label}
                  onChange={(e) => updateSocial(index, { label: e.target.value })}
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <input
                    aria-label="Link, username hoặc số điện thoại"
                    className={inputClass}
                    placeholder="Link, @username hoặc số điện thoại"
                    value={social.url}
                    onChange={(e) => updateSocial(index, { url: e.target.value })}
                  />
                  {previewHref && (
                    <span className="truncate px-1 font-body text-[10px] text-muted">
                      Đích: {previewHref}
                    </span>
                  )}
                </div>
                <IconButton variant="danger" onClick={() => removeSocial(index)}>
                  Xóa
                </IconButton>
              </div>
            );
          })}
          <IconButton onClick={addSocial}>+ Thêm mạng xã hội</IconButton>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && <span className="font-body text-xs text-teal">Đã lưu ✓</span>}
        <IconButton variant="primary" onClick={save}>
          Lưu hồ sơ
        </IconButton>
      </div>
    </Card>
  );
}
