"use client";

import { useState } from "react";
import ProfileEditor from "@/components/admin/ProfileEditor";
import EducationEditor from "@/components/admin/EducationEditor";
import WorkEditor from "@/components/admin/WorkEditor";
import ExperienceEditor from "@/components/admin/ExperienceEditor";
import SalaryEditor from "@/components/admin/SalaryEditor";
import ProductsEditor from "@/components/admin/ProductsEditor";

const TABS = [
  { key: "profile", label: "Hồ sơ", Component: ProfileEditor },
  { key: "work", label: "Công việc", Component: WorkEditor },
  { key: "education", label: "Học lực", Component: EducationEditor },
  { key: "experience", label: "Kinh nghiệm", Component: ExperienceEditor },
  { key: "products", label: "Sản phẩm", Component: ProductsEditor },
  { key: "salary", label: "Mức lương", Component: SalaryEditor },
] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("profile");
  const Active = TABS.find((t) => t.key === tab)!.Component;

  return (
    <div>
      <nav className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 font-body text-sm font-medium transition ${
              tab === t.key
                ? "bg-ink text-paper"
                : "border border-ink/15 text-ink hover:bg-ink/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <Active />
    </div>
  );
}
