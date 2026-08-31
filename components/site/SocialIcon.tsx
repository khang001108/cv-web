import {
  AtSign,
  Globe2,
  Mail,
  MessageCircle,
  Music2,
  Phone,
  Send,
} from "lucide-react";
import type { SocialPlatform } from "@/lib/types";

const iconClass = "h-4 w-4";

export default function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "instagram") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={iconClass} fill="none">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={iconClass} fill="none">
        <rect x="2.5" y="5" width="19" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="m10 9 5 3-5 3V9Z" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "facebook" || platform === "zalo" || platform === "linkedin" || platform === "github") {
    const text = {
      facebook: "f",
      zalo: "Z",
      linkedin: "in",
      github: "GH",
    }[platform];
    return (
      <span
        aria-hidden
        className="flex h-4 min-w-4 items-center justify-center text-[10px] font-bold leading-none"
      >
        {text}
      </span>
    );
  }

  const Icon = {
    telegram: Send,
    whatsapp: MessageCircle,
    tiktok: Music2,
    website: Globe2,
    phone: Phone,
    email: Mail,
    custom: AtSign,
  }[platform];

  return <Icon aria-hidden className={iconClass} strokeWidth={2} />;
}
