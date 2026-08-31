export default function Section({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8">
        {kicker && (
          <p className="font-body text-sm text-muted">{kicker}</p>
        )}
        <h2 className="font-display text-3xl font-medium text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
