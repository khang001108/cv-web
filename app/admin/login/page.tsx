"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setExpired(new URLSearchParams(window.location.search).get("expired") === "1");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Sai email hoặc mật khẩu.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-paper/10 bg-paper/5 p-8"
      >
        <h1 className="mb-6 font-display text-2xl font-medium text-paper">
          Đăng nhập Admin
        </h1>
        {expired && (
          <p className="mb-4 rounded-lg border border-coral/30 bg-coral/10 p-3 font-body text-sm text-paper/80">
            Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
          </p>
        )}
        <div className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-paper/20 bg-transparent px-4 py-2.5 font-body text-paper placeholder:text-paper/40 focus:border-coral focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-paper/20 bg-transparent px-4 py-2.5 font-body text-paper placeholder:text-paper/40 focus:border-coral focus:outline-none"
          />
          {error && <p className="font-body text-sm text-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-coral px-5 py-2.5 font-body text-sm font-medium text-ink transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </form>
    </main>
  );
}
