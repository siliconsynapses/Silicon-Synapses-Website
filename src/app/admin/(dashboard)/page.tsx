import Link from "next/link";
import {
  CalendarDays,
  Ticket,
  QrCode,
  Boxes,
  Users,
  BookOpen,
  Inbox,
  ArrowRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/rbac";
import {
  getDashboardStats,
  recentOpenQueries,
  DB_UNAVAILABLE,
} from "@/lib/data/admin";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { StatusPill } from "@/app/admin/_components/page-header";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
  href,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-surface/40 p-5 transition-colors hover:border-accent/30 hover:bg-white/[0.03]"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-accent">
          {icon}
        </span>
        <ArrowRight
          size={16}
          className="text-slate-600 transition-colors group-hover:text-accent"
        />
      </div>
      <div className="mt-4 font-display text-3xl font-bold tabular-nums text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
      {sub ? <div className="mt-0.5 text-xs text-slate-500">{sub}</div> : null}
    </Link>
  );
}

const QUERY_TYPE_TONE = {
  QUERY: "cyan",
  SUGGESTION: "green",
  FEEDBACK: "amber",
} as const;

export default async function AdminDashboardPage() {
  const [user, stats, queries] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    recentOpenQueries(5),
  ]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Here&apos;s what&apos;s happening across Silicon Synapses.
        </p>
      </div>

      {stats === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Published events"
            value={stats.publishedEvents}
            sub={`${stats.totalEvents} total`}
            href="/admin/events"
            icon={<CalendarDays size={18} />}
          />
          <StatCard
            label="Registrations"
            value={stats.registrations}
            sub={`${stats.checkedIn} checked in`}
            href="/admin/registrations"
            icon={<Ticket size={18} />}
          />
          <StatCard
            label="Open queries"
            value={stats.openQueries}
            sub="Awaiting response"
            href="/admin/queries"
            icon={<Inbox size={18} />}
          />
          <StatCard
            label="Departments"
            value={stats.departments}
            href="/admin/departments"
            icon={<Boxes size={18} />}
          />
          <StatCard
            label="Team members"
            value={stats.teamMembers}
            href="/admin/team"
            icon={<Users size={18} />}
          />
          <StatCard
            label="Published resources"
            value={stats.publishedResources}
            href="/admin/learning"
            icon={<BookOpen size={18} />}
          />
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-surface/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">
              Recent queries
            </h2>
            <Link
              href="/admin/queries"
              className="text-sm text-slate-400 transition-colors hover:text-accent"
            >
              View all
            </Link>
          </div>
          <div className="mt-4">
            {queries === DB_UNAVAILABLE ? (
              <p className="py-6 text-center text-sm text-slate-500">
                Query inbox unavailable.
              </p>
            ) : queries.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No open queries. You&apos;re all caught up.
              </p>
            ) : (
              <ul className="space-y-2">
                {queries.map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/admin/queries/${q.id}`}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-accent/20 hover:bg-white/[0.04]"
                    >
                      <StatusPill tone={QUERY_TYPE_TONE[q.type]}>
                        {q.type.toLowerCase()}
                      </StatusPill>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-100">
                          {q.subject}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {q.name}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface/40 p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Quick actions
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <QuickLink href="/admin/events/new" icon={<CalendarDays size={16} />}>
              Create event
            </QuickLink>
            <QuickLink href="/admin/check-in" icon={<QrCode size={16} />}>
              Check-in scanner
            </QuickLink>
            <QuickLink href="/admin/departments/new" icon={<Boxes size={16} />}>
              Add department
            </QuickLink>
            <QuickLink href="/admin/learning" icon={<BookOpen size={16} />}>
              Manage resources
            </QuickLink>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-200 transition-colors hover:border-accent/30 hover:bg-accent/[0.06] hover:text-white"
    >
      <span className="text-accent">{icon}</span>
      {children}
    </Link>
  );
}
