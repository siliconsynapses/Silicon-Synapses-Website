import type { ReactNode } from "react";
import { DatabaseZap, Inbox } from "lucide-react";

/**
 * Shown when an admin list query fails (DB unreachable). Mirrors the public
 * site's safe-fallback behavior so the console never hard-crashes on a cold or
 * unconfigured database.
 */
export function DbUnavailableNotice() {
  return (
    <div className="rounded-2xl border border-dashed border-amber-400/30 bg-amber-500/[0.06] px-6 py-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
        <DatabaseZap size={22} />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-white">
        Database not reachable
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">
        The admin console couldn&apos;t load this data. Once the database
        connection (DATABASE_URL / DIRECT_URL) is live and migrated, this list
        will populate automatically.
      </p>
    </div>
  );
}

/** Generic "nothing here yet" panel with an optional call to action. */
export function AdminEmptyState({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.01] px-6 py-14 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
        {icon ?? <Inbox size={22} />}
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-white">
        {title}
      </h3>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
