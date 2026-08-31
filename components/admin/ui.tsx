export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-body text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "rounded-lg border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink focus:border-coral focus:outline-none";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/70 p-5">
      {children}
    </div>
  );
}

export function IconButton({
  onClick,
  children,
  variant = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger" | "primary";
}) {
  const styles = {
    default: "border border-ink/15 text-ink hover:bg-ink hover:text-paper",
    danger: "border border-coral/40 text-coral hover:bg-coral hover:text-paper",
    primary: "bg-teal text-ink hover:brightness-110",
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition ${styles}`}
    >
      {children}
    </button>
  );
}
