import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/site/Hero";
import Section from "@/components/site/Section";
import { Timeline, formatRange } from "@/components/site/Timeline";
import Skills from "@/components/site/Skills";
import SalaryHistoryList from "@/components/site/SalaryHistory";
import Products from "@/components/site/Products";
import WorkHistoryList from "@/components/site/WorkHistoryList";
import type {
  Profile,
  Education,
  WorkHistory,
  Experience,
  SalaryHistory,
  Product,
} from "@/lib/types";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  const [profileRes, educationRes, workRes, experienceRes, salaryRes, productsRes] =
    await Promise.all([
      supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("education").select("*").order("sort_order"),
      supabase.from("work_history").select("*").order("sort_order"),
      supabase.from("experience").select("*").order("sort_order"),
      supabase.from("salary_history").select("*").order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
    ]);

  const profile = (profileRes.data as Profile) ?? {
    id: 1,
    full_name: "Chưa đặt tên",
    headline: "",
    bio: "",
    avatar_url: null,
    background_url: null,
    theme: "coral",
    background_style: "aurora",
    email: null,
    phone: null,
    location: null,
    socials: [],
    updated_at: "",
  };
  const education = (educationRes.data as Education[]) ?? [];
  const work = (workRes.data as WorkHistory[]) ?? [];
  const experience = (experienceRes.data as Experience[]) ?? [];
  const salary = (salaryRes.data as SalaryHistory[]) ?? [];
  const products = (productsRes.data as Product[]) ?? [];

  return (
    <main data-theme={profile.theme ?? "coral"} className="bg-paper">
      <Hero profile={profile} />

      {work.length > 0 && (
        <Section id="work" title="Công việc" kicker="Hành trình sự nghiệp">
          <WorkHistoryList items={work} />
        </Section>
      )}

      {education.length > 0 && (
        <Section id="education" title="Học lực" kicker="Nền tảng">
          <Timeline
            entries={education.map((e) => ({
              id: e.id,
              title: [e.degree, e.field].filter(Boolean).join(" · ") || e.school,
              subtitle: e.school,
              range: formatRange(e.start_date, e.end_date),
              description: e.description,
            }))}
          />
        </Section>
      )}

      {experience.length > 0 && (
        <Section id="skills" title="Kinh nghiệm" kicker="Kỹ năng & chuyên môn">
          <Skills items={experience} />
        </Section>
      )}

      {products.length > 0 && (
        <Section id="products" title="Sản phẩm tự làm" kicker="Đã xây dựng">
          <Products items={products} />
        </Section>
      )}

      {salary.length > 0 && (
        <Section id="salary" title="Mức lương từng có" kicker="Minh bạch">
          <SalaryHistoryList items={salary} />
        </Section>
      )}

      <footer className="border-t border-ink/10 px-6 py-10 text-center font-body text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {profile.full_name}
          {profile.location ? ` · ${profile.location}` : ""}
        </p>
      </footer>
    </main>
  );
}
