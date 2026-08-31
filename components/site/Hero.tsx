"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { inferSocialPlatform, socialHref, socialLabel } from "@/lib/profile-options";
import SocialIcon from "./SocialIcon";

export default function Hero({ profile }: { profile: Profile }) {
  const roles = profile.headline
    .split(/[,•|]/)
    .map((r) => r.trim())
    .filter(Boolean);
  const words = roles.length > 0 ? roles : [profile.headline];
  const [index, setIndex] = useState(0);
  const backgroundStyle = profile.background_style ?? "aurora";

  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <section
      className="relative overflow-hidden bg-ink bg-cover bg-center text-paper"
      style={
        profile.background_url
          ? { backgroundImage: `url(${JSON.stringify(profile.background_url)})` }
          : undefined
      }
    >
      {profile.background_url && (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/75" />
      )}

      {backgroundStyle === "aurora" && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgb(var(--color-accent)) 0%, transparent 70%)",
            }}
            animate={{ rotate: [0, 30, -10, 0], scale: [1, 1.15, 0.95, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-[-10rem] h-[26rem] w-[26rem] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, rgb(var(--color-secondary)) 0%, transparent 70%)",
            }}
            animate={{ rotate: [0, -20, 15, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {backgroundStyle === "grid" && (
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
      )}

      {backgroundStyle === "spotlight" && (
        <div aria-hidden className="hero-spotlight pointer-events-none absolute inset-0" />
      )}

      <div className="hero-inner relative mx-auto flex max-w-3xl flex-col gap-8 px-6 py-24 sm:py-32">
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
          {profile.socials?.map((social, socialIndex) => {
            const href = socialHref(social);
            if (!href) return null;
            const platform = inferSocialPlatform(social);
            const label = socialLabel(social);
            const opensNewTab = href.startsWith("http");

            return (
              <a
                key={`${platform}-${social.url}-${socialIndex}`}
                href={href}
                target={opensNewTab ? "_blank" : undefined}
                rel={opensNewTab ? "noreferrer" : undefined}
                aria-label={label}
                className="flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-3.5 py-2 font-body text-sm text-paper/75 transition hover:border-paper/35 hover:bg-paper/10 hover:text-paper"
              >
                <SocialIcon platform={platform} />
                <span>{label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
