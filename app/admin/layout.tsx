"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const manualSignOut = useRef(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    const supabase = createClient();
    let active = true;

    async function validateSession() {
      const { error } = await supabase.auth.getUser();
      if (!active || !error) return;

      await supabase.auth.signOut({ scope: "local" });
      router.replace("/admin/login?expired=1");
      router.refresh();
    }

    void validateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && active && !manualSignOut.current) {
        router.replace("/admin/login?expired=1");
        router.refresh();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  async function signOut() {
    manualSignOut.current = true;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-ink/10 bg-white/70 px-6 py-4">
        <div>
          <p className="font-display text-lg font-medium text-ink">Quản trị CV</p>
          <a href="/" target="_blank" className="font-body text-xs text-muted hover:underline">
            Xem trang công khai ↗
          </a>
        </div>
        <button
          onClick={signOut}
          className="rounded-full border border-ink/15 px-4 py-2 font-body text-sm text-ink transition hover:bg-ink hover:text-paper"
        >
          Đăng xuất
        </button>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  );
}
