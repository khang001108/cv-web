-- ============================================================
-- CV Online — Supabase schema
-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PROFILE (bản ghi duy nhất) ----------
create table if not exists profile (
  id int primary key default 1,
  full_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  avatar_url text,
  background_url text,
  theme text not null default 'coral',
  background_style text not null default 'aurora',
  page_layout text not null default 'classic',
  email text,
  phone text,
  location text,
  socials jsonb not null default '[]'::jsonb, -- [{ "label": "GitHub", "url": "https://..." }]
  updated_at timestamptz not null default now(),
  constraint profile_singleton check (id = 1)
);

-- Bổ sung cột khi nâng cấp một database đã tạo từ phiên bản cũ.
alter table profile add column if not exists background_url text;
alter table profile add column if not exists theme text not null default 'coral';
alter table profile add column if not exists background_style text not null default 'aurora';
alter table profile add column if not exists page_layout text not null default 'classic';

insert into profile (id, full_name, headline, bio)
values (1, 'Tên của bạn', 'Web Developer & Manufacturing Engineer', 'Viết mô tả bản thân ở đây.')
on conflict (id) do nothing;

-- ---------- EDUCATION (học lực) ----------
create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  school text not null,
  degree text,
  field text,
  start_date date,
  end_date date,
  description text,
  media jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- WORK HISTORY (công việc) ----------
create table if not exists work_history (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  position text not null,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  image_url text,
  video_url text,
  media jsonb not null default '[]'::jsonb,
  display_layout text not null default 'timeline',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Bổ sung cột media/bố trí khi nâng cấp database đã tạo từ phiên bản cũ.
alter table work_history add column if not exists image_url text;
alter table work_history add column if not exists video_url text;
alter table work_history add column if not exists media jsonb not null default '[]'::jsonb;
alter table work_history add column if not exists display_layout text not null default 'timeline';

-- ---------- EXPERIENCE / SKILLS (kinh nghiệm) ----------
create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  level int check (level between 1 and 5),
  description text,
  media jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- SALARY HISTORY (mức lương từng có) ----------
create table if not exists salary_history (
  id uuid primary key default gen_random_uuid(),
  position text not null,
  company text,
  amount numeric,
  currency text not null default 'VND',
  period_start date,
  period_end date,
  note text,
  media jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS (sản phẩm tự làm) ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  video_url text,
  media jsonb not null default '[]'::jsonb,
  link_url text,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Media dùng chung: mỗi mục có thể chứa nhiều ảnh và video.
alter table education add column if not exists media jsonb not null default '[]'::jsonb;
alter table experience add column if not exists media jsonb not null default '[]'::jsonb;
alter table salary_history add column if not exists media jsonb not null default '[]'::jsonb;
alter table products add column if not exists media jsonb not null default '[]'::jsonb;

-- Chuyển ảnh/video đơn từ phiên bản cũ sang danh sách media (chỉ chạy khi danh sách còn rỗng).
update work_history
set media =
  case
    when image_url is not null and image_url <> ''
      then jsonb_build_array(jsonb_build_object('id', gen_random_uuid()::text, 'type', 'image', 'url', image_url))
    else '[]'::jsonb
  end
  ||
  case
    when video_url is not null and video_url <> ''
      then jsonb_build_array(jsonb_build_object('id', gen_random_uuid()::text, 'type', 'video', 'url', video_url))
    else '[]'::jsonb
  end
where media = '[]'::jsonb
  and (coalesce(image_url, '') <> '' or coalesce(video_url, '') <> '');

update products
set media =
  case
    when image_url is not null and image_url <> ''
      then jsonb_build_array(jsonb_build_object('id', gen_random_uuid()::text, 'type', 'image', 'url', image_url))
    else '[]'::jsonb
  end
  ||
  case
    when video_url is not null and video_url <> ''
      then jsonb_build_array(jsonb_build_object('id', gen_random_uuid()::text, 'type', 'video', 'url', video_url))
    else '[]'::jsonb
  end
where media = '[]'::jsonb
  and (coalesce(image_url, '') <> '' or coalesce(video_url, '') <> '');

-- ---------- API GRANTS ----------
-- RLS policies only filter rows; the API roles also need table privileges.
-- Keep public visitors read-only and allow signed-in users to manage CV data.
grant usage on schema public to anon, authenticated;

revoke all on table
  profile,
  education,
  work_history,
  experience,
  salary_history,
  products
from anon, authenticated;

grant select on table
  profile,
  education,
  work_history,
  experience,
  salary_history,
  products
to anon;

grant select, insert, update, delete on table
  profile,
  education,
  work_history,
  experience,
  salary_history,
  products
to authenticated;

-- ============================================================
-- Row Level Security: ai cũng đọc được (public CV), chỉ tài
-- khoản đăng nhập (chính bạn) mới sửa được.
-- ============================================================
alter table profile enable row level security;
alter table education enable row level security;
alter table work_history enable row level security;
alter table experience enable row level security;
alter table salary_history enable row level security;
alter table products enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['profile','education','work_history','experience','salary_history','products']
  loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);

    execute format('drop policy if exists "auth write" on %I', t);
    execute format(
      'create policy "auth write" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t
    );
  end loop;
end $$;

-- ============================================================
-- Storage bucket cho ảnh & video (public đọc, chỉ đăng nhập upload)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('cv-media', 'cv-media', true)
on conflict (id) do nothing;

drop policy if exists "cv-media public read" on storage.objects;
create policy "cv-media public read"
  on storage.objects for select
  using (bucket_id = 'cv-media');

drop policy if exists "cv-media auth write" on storage.objects;
create policy "cv-media auth write"
  on storage.objects for insert
  with check (bucket_id = 'cv-media' and auth.role() = 'authenticated');

drop policy if exists "cv-media auth update" on storage.objects;
create policy "cv-media auth update"
  on storage.objects for update
  using (bucket_id = 'cv-media' and auth.role() = 'authenticated');

drop policy if exists "cv-media auth delete" on storage.objects;
create policy "cv-media auth delete"
  on storage.objects for delete
  using (bucket_id = 'cv-media' and auth.role() = 'authenticated');

-- Yêu cầu PostgREST nạp lại cấu trúc bảng ngay sau khi migration hoàn tất.
-- Tránh lỗi "Could not find ... column in the schema cache" trên ứng dụng.
notify pgrst, 'reload schema';
