import type {
  BackgroundStyle,
  PageLayout,
  Social,
  SocialPlatform,
  ThemeName,
} from "@/lib/types";

export const SOCIAL_OPTIONS: Array<{
  value: SocialPlatform;
  label: string;
}> = [
  { value: "facebook", label: "Facebook" },
  { value: "zalo", label: "Zalo" },
  { value: "telegram", label: "Telegram" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Điện thoại" },
  { value: "email", label: "Email" },
  { value: "custom", label: "Liên kết khác" },
];

export const THEME_OPTIONS: Array<{
  value: ThemeName;
  label: string;
  colors: [string, string, string];
}> = [
  { value: "coral", label: "Đêm san hô", colors: ["#12131A", "#FF4D6D", "#14C7A5"] },
  { value: "ocean", label: "Đại dương", colors: ["#071A2B", "#38BDF8", "#2DD4BF"] },
  { value: "forest", label: "Rừng xanh", colors: ["#102019", "#4ADE80", "#FACC15"] },
  { value: "sunset", label: "Hoàng hôn", colors: ["#29162B", "#FB7185", "#FBBF24"] },
];

export const BACKGROUND_OPTIONS: Array<{
  value: BackgroundStyle;
  label: string;
}> = [
  { value: "aurora", label: "Aurora chuyển động" },
  { value: "grid", label: "Lưới hiện đại" },
  { value: "spotlight", label: "Đốm sáng" },
  { value: "minimal", label: "Tối giản" },
];

export const PAGE_LAYOUT_OPTIONS: Array<{
  value: PageLayout;
  label: string;
  description: string;
}> = [
  { value: "classic", label: "Cổ điển", description: "Nội dung gọn, khoảng cách thoáng" },
  { value: "wide", label: "Toàn cảnh", description: "Khung rộng, hợp với nhiều media" },
  { value: "compact", label: "Gọn gàng", description: "Thu hẹp khoảng cách giữa các mục" },
  { value: "cards", label: "Thẻ nổi", description: "Mỗi mục nằm trong một thẻ riêng" },
  { value: "dashboard", label: "Dashboard", description: "Sidebar cố định và nội dung dạng lưới" },
  { value: "resume", label: "CV hai cột", description: "Hồ sơ bên trái, nội dung bên phải" },
];

const LABEL_TO_PLATFORM: Record<string, SocialPlatform> = {
  facebook: "facebook",
  fb: "facebook",
  zalo: "zalo",
  telegram: "telegram",
  tele: "telegram",
  instagram: "instagram",
  insta: "instagram",
  whatsapp: "whatsapp",
  linkedin: "linkedin",
  github: "github",
  youtube: "youtube",
  tiktok: "tiktok",
  website: "website",
  phone: "phone",
  "điện thoại": "phone",
  email: "email",
};

export function inferSocialPlatform(social: Social): SocialPlatform {
  if (social.platform) return social.platform;

  const label = social.label.trim().toLowerCase();
  if (LABEL_TO_PLATFORM[label]) return LABEL_TO_PLATFORM[label];

  const value = social.url.toLowerCase();
  if (value.includes("facebook.com")) return "facebook";
  if (value.includes("zalo.me")) return "zalo";
  if (value.includes("t.me") || value.startsWith("tg:")) return "telegram";
  if (value.includes("instagram.com")) return "instagram";
  if (value.includes("wa.me") || value.includes("whatsapp.com")) return "whatsapp";
  if (value.includes("linkedin.com")) return "linkedin";
  if (value.includes("github.com")) return "github";
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube";
  if (value.includes("tiktok.com")) return "tiktok";
  if (value.startsWith("tel:")) return "phone";
  if (value.startsWith("mailto:")) return "email";
  if (/^https?:\/\//i.test(value)) return "website";
  return "custom";
}

function looksLikePhone(value: string) {
  return /^\+?[\d\s().-]{8,}$/.test(value);
}

function phoneDigits(value: string) {
  const hasPlus = value.trim().startsWith("+");
  const digits = value.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function socialHref(social: Social): string | null {
  const raw = social.url.trim();
  if (!raw) return null;
  if (/^(https?:\/\/|mailto:|tel:|tg:)/i.test(raw)) return raw;

  const platform = inferSocialPlatform(social);
  const username = raw.replace(/^@/, "");

  if (looksLikePhone(raw)) {
    const phone = phoneDigits(raw);
    const webPhone = phone.replace(/^\+/, "");
    if (platform === "zalo") return `https://zalo.me/${webPhone}`;
    if (platform === "whatsapp") return `https://wa.me/${webPhone}`;
    if (platform === "telegram") return `tg://resolve?phone=${webPhone}`;
    return `tel:${phone}`;
  }

  const encoded = encodeURIComponent(username);
  switch (platform) {
    case "facebook":
      return `https://facebook.com/${encoded}`;
    case "zalo":
      return `https://zalo.me/${encoded}`;
    case "telegram":
      return `https://t.me/${encoded}`;
    case "instagram":
      return `https://instagram.com/${encoded}`;
    case "whatsapp":
      return `https://wa.me/${encoded}`;
    case "linkedin":
      return `https://linkedin.com/in/${encoded}`;
    case "github":
      return `https://github.com/${encoded}`;
    case "youtube":
      return `https://youtube.com/@${encoded}`;
    case "tiktok":
      return `https://tiktok.com/@${encoded}`;
    case "phone":
      return `tel:${raw}`;
    case "email":
      return `mailto:${raw}`;
    case "website":
    case "custom":
      return raw.includes(".") ? `https://${raw}` : null;
  }
}

export function socialLabel(social: Social) {
  if (social.label.trim()) return social.label.trim();
  return (
    SOCIAL_OPTIONS.find((option) => option.value === inferSocialPlatform(social))
      ?.label ?? "Liên kết"
  );
}
