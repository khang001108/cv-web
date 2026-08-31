# CV Online

Trang CV cá nhân: Next.js 14 + Supabase, deploy bằng Vercel. Có trang admin
đăng nhập để tự cập nhật mô tả bản thân, học lực, công việc, kinh nghiệm,
mức lương, và sản phẩm tự làm (kèm ảnh, video ngắn, link).

## 1. Tạo dự án Supabase

1. Vào https://supabase.com → **New project**.
2. Vào **SQL Editor** → dán toàn bộ nội dung file `supabase/schema.sql` → **Run**.
   Việc này tạo các bảng (`profile`, `education`, `work_history`, `experience`,
   `salary_history`, `products`), bật Row Level Security (ai cũng đọc được,
   chỉ tài khoản đăng nhập mới sửa), cấp quyền API cần thiết, và tạo storage
   bucket `cv-media` cho ảnh/video. Có thể chạy lại file này an toàn nếu schema
   đã được tạo từ trước.
3. Vào **Authentication → Users → Add user** để tạo tài khoản admin cho
   chính bạn (email + mật khẩu). Đây là tài khoản bạn sẽ dùng để đăng nhập
   trang `/admin`.
4. Vào **Project Settings → API**, lấy 2 giá trị:
   - `Project URL`
   - `anon public` key

## 2. Cấu hình biến môi trường

Copy `.env.example` thành `.env.local` và điền:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

## 3. Chạy thử ở máy local

```bash
npm install
npm run dev
```

- Trang CV công khai: http://localhost:3000
- Trang quản trị: http://localhost:3000/admin (đăng nhập bằng tài khoản đã
  tạo ở bước 1.3)

Vào `/admin` để nhập nội dung: hồ sơ, ảnh đại diện, ảnh nền, bảng màu, bối cảnh,
mạng xã hội, học lực, công việc (ảnh, video, bố trí hiển thị), kinh nghiệm,
sản phẩm (upload ảnh + video ngắn cho từng sản phẩm, gắn link), mức lương từng có.

## 4. Deploy lên Vercel

1. Đẩy code lên GitHub.
2. Vào https://vercel.com/new → import repo.
3. Ở phần **Environment Variables**, thêm `NEXT_PUBLIC_SUPABASE_URL` và
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (giống `.env.local`).
4. Deploy. Xong — mỗi lần bạn sửa nội dung trong trang `/admin`, trang chủ
   sẽ tự cập nhật (dữ liệu lấy trực tiếp từ Supabase, không cần build lại).

## Cấu trúc dữ liệu

| Bảng | Ứng với |
|---|---|
| `profile` | Mô tả bản thân, avatar, liên hệ, mạng xã hội |
| `education` | Học lực |
| `work_history` | Công việc, mô tả, ảnh/video và bố trí hiển thị |
| `experience` | Kinh nghiệm / kỹ năng |
| `salary_history` | Mức lương từng có |
| `products` | Sản phẩm tự làm (ảnh, video, link, tag) |

Storage bucket `cv-media` chứa ảnh/video upload từ trang admin, public read.

## Ghi chú bảo mật

- RLS đã bật cho toàn bộ bảng: chỉ tài khoản Supabase Auth đã đăng nhập mới
  ghi/sửa/xóa được, ai cũng xem được (đúng bản chất một trang CV công khai).
- Trang `/admin/*` được bảo vệ bởi `middleware.ts` — chưa đăng nhập sẽ tự
  chuyển hướng về `/admin/login`.
- Mức lương là dữ liệu bạn chủ động công khai trên CV của mình — chỉ thêm
  nếu bạn thực sự muốn hiển thị công khai.
