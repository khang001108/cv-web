"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";

export default function Hero({ profile }: { profile: Profile }) {
  const roles = profile.headline
    .split(/[,•|]/)
    .map((r) => r.trim())
    .filter(Boolean);
  const words = roles.length > 0 ? roles : [profile.headline];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #FF4D6D 0%, #FF4D6D00 70%)",
        }}
        animate={{ rotate: [0, 30, -10, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-[-10rem] h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #14C7A5 0%, #14C7A500 70%)",
        }}
        animate={{ rotate: [0, -20, 15, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col gap-8 px-6 py-24 sm:py-32">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-paper/20"
          />
        )}

        <div>
          <p className="font-body text-sm text-paper/60">Xin chào, tôi là</p>
          <h1 className="mt-2 font-display text-5xl font-medium leading-[1.05] sm:text-6xl">
            {profile.full_name}
          </h1>

          <div className="mt-5 h-10 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-display text-xl text-coral sm:text-2xl"
              >
                {words[index]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {profile.bio && (
          <p className="max-w-xl font-body text-base leading-relaxed text-paper/75">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full bg-coral px-5 py-2.5 font-body text-sm font-medium text-ink transition hover:brightness-110"
            >
              Liên hệ tôi
            </a>
          )}
          {profile.socials?.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="font-body text-sm text-paper/70 underline-offset-4 transition hover:text-paper hover:underline"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
