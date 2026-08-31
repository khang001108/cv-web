import {
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MapPin,
  Package,
  Phone,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { inferSocialPlatform, socialHref, socialLabel } from "@/lib/profile-options";
import SocialIcon from "./SocialIcon";

type SectionKey = "work" | "education" | "skills" | "products" | "salary";

const NAV_ITEMS = {
  work: { label: "Công việc", Icon: Briefcase },
  education: { label: "Học lực", Icon: GraduationCap },
  skills: { label: "Kinh nghiệm", Icon: Sparkles },
  products: { label: "Sản phẩm", Icon: Package },
  salary: { label: "Mức lương", Icon: Wallet },
} satisfies Record<SectionKey, { label: string; Icon: typeof Briefcase }>;

export default function SiteSidebar({
  profile,
  sections,
}: {
  profile: Profile;
  sections: SectionKey[];
}) {
  const initial = profile.full_name.trim().charAt(0).toUpperCase() || "CV";

  return (
    <aside className="cv-sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{profile.full_name}</p>
          {profile.headline && (
            <p className="line-clamp-2 font-body text-xs opacity-65">{profile.headline}</p>
          )}
        </div>
      </div>

      <a href="#top" className="sidebar-nav-item sidebar-overview">
        <LayoutDashboard className="h-4 w-4" />
        <span>Tổng quan</span>
      </a>

      <nav className="sidebar-nav" aria-label="Điều hướng CV">
        {sections.map((section) => {
          const { label, Icon } = NAV_ITEMS[section];
          return (
            <a key={section} href={`#${section}`} className="sidebar-nav-item">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      {profile.bio && (
        <p className="sidebar-bio whitespace-pre-line font-body text-xs leading-relaxed opacity-70">
          {profile.bio}
        </p>
      )}

      <div className="sidebar-contact">
        {profile.email && (
          <a href={`mailto:${profile.email}`}>
            <Mail className="h-4 w-4" />
            <span>{profile.email}</span>
          </a>
        )}
        {profile.phone && (
          <a href={`tel:${profile.phone}`}>
            <Phone className="h-4 w-4" />
            <span>{profile.phone}</span>
          </a>
        )}
        {profile.location && (
          <span>
            <MapPin className="h-4 w-4" />
            <span>{profile.location}</span>
          </span>
        )}
      </div>

      {profile.socials?.length > 0 && (
        <div className="sidebar-socials">
          {profile.socials.map((social, index) => {
            const href = socialHref(social);
            if (!href) return null;
            const platform = inferSocialPlatform(social);
            return (
              <a
                key={`${platform}-${index}`}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={socialLabel(social)}
                title={socialLabel(social)}
              >
                <SocialIcon platform={platform} />
              </a>
            );
          })}
        </div>
      )}
    </aside>
  );
}
