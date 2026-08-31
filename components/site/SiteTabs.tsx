"use client";

import { useState } from "react";

type SectionKey = "top" | "work" | "education" | "skills" | "products" | "salary";

const LABELS: Record<SectionKey, string> = {
  top: "Hồ sơ",
  work: "Công việc",
  education: "Học lực",
  skills: "Kinh nghiệm",
  products: "Sản phẩm",
  salary: "Mức lương",
};

export default function SiteTabs({ sections }: { sections: SectionKey[] }) {
  const [active, setActive] = useState<SectionKey>("top");

  function select(section: SectionKey) {
    setActive(section);
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  if (sections.length === 0) return null;

  return (
    <nav className="site-tabs" aria-label="Các mục CV">
      {sections.map((section) => (
        <button
          key={section}
          type="button"
          aria-pressed={active === section}
          onClick={() => select(section)}
          className={active === section ? "is-active" : ""}
        >
          {LABELS[section]}
        </button>
      ))}
    </nav>
  );
}
