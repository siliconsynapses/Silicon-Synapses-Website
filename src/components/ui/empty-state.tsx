import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Honest empty state for DB-driven sections that have no content yet. Used
 * across the public site so unseeded areas read as intentional rather than
 * broken — never populated with fabricated content.
 */
export function EmptyState({
  icon,
  title,
  description,
  className,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.01] px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
