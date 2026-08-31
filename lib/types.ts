export type Social = { label: string; url: string };

export type Profile = {
  id: number;
  full_name: string;
  headline: string;
  bio: string;
  avatar_url: string | null;
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
