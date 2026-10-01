import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Admin page header with optional back link and right-aligned actions. */
export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-accent"
        >
          <ArrowLeft size={15} />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

/** Small status pill used across admin tables. */
export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "amber" | "slate" | "red" | "cyan";
  children: ReactNode;
}) {
  const tones: Record<typeof tone, string> = {
    green: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-300",
    slate: "border-white/15 bg-white/[0.04] text-slate-300",
    red: "border-rose-400/30 bg-rose-500/10 text-rose-300",
    cyan: "border-accent/30 bg-accent/10 text-accent",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
