export type SocialPlatform =
  | "facebook"
  | "zalo"
  | "telegram"
  | "instagram"
  | "whatsapp"
  | "linkedin"
  | "github"
  | "youtube"
  | "tiktok"
  | "website"
  | "phone"
  | "email"
  | "custom";

export type ThemeName = "coral" | "ocean" | "forest" | "sunset";

export type BackgroundStyle = "aurora" | "grid" | "spotlight" | "minimal";

export type WorkDisplayLayout =
  | "timeline"
  | "media-left"
  | "media-right"
  | "media-top";

export type Social = {
  label: string;
  url: string;
  platform?: SocialPlatform;
};

export type Profile = {
  id: number;
  full_name: string;
  headline: string;
  bio: string;
  avatar_url: string | null;
  background_url: string | null;
  theme: ThemeName;
  background_style: BackgroundStyle;
  email: string | null;
  phone: string | null;
  location: string | null;
  socials: Social[];
  updated_at: string;
};

export type Education = {
  id: string;
  school: string;
  degree: string | null;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  sort_order: number;
};

export type WorkHistory = {
  id: string;
  company: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  display_layout: WorkDisplayLayout;
  sort_order: number;
};

export type Experience = {
  id: string;
  title: string;
  category: string | null;
  level: number | null;
  description: string | null;
  sort_order: number;
};

export type SalaryHistory = {
  id: string;
  position: string;
  company: string | null;
  amount: number | null;
  currency: string;
  period_start: string | null;
  period_end: string | null;
  note: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  tags: string[];
  sort_order: number;
};
