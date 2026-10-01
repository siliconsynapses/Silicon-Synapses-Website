import Link from "next/link";
import { Inbox, ArrowRight } from "lucide-react";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { formatDate } from "@/lib/datetime";
import { QUERY_TYPE_LABELS } from "@/lib/validations/query";
import { listAdminQueries } from "./data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  OPEN: "amber",
  IN_PROGRESS: "cyan",
  RESOLVED: "green",
  CLOSED: "slate",
} as const;

const STATUS_LABEL = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
} as const;

const TYPE_TONE = {
  QUERY: "cyan",
  SUGGESTION: "green",
  FEEDBACK: "amber",
} as const;

export default async function QueriesPage() {
  await requirePage("STAFF");
  const rows = await listAdminQueries();

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Questions, suggestions, and feedback submitted from the public site."
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No messages yet"
          description="Queries and suggestions from the contact form will appear here."
          icon={<Inbox size={22} />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">
                  Received
                </th>
                <th className="px-5 py-3 text-right font-medium">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((q) => {
                const statusKey = q.status as keyof typeof STATUS_TONE;
                const typeKey = q.type as keyof typeof TYPE_TONE;
                return (
                  <tr
                    key={q.id}
                    className="group transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/queries/${q.id}`}
                        className="block font-medium text-white transition-colors group-hover:text-accent"
                      >
                        {q.subject}
                      </Link>
                      <div className="text-xs text-slate-500">from {q.name}</div>
                    </td>
                    <td className="hidden px-5 py-3.5 sm:table-cell">
                      <StatusPill tone={TYPE_TONE[typeKey] ?? "slate"}>
                        {QUERY_TYPE_LABELS[
                          q.type as keyof typeof QUERY_TYPE_LABELS
                        ] ?? q.type}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={STATUS_TONE[statusKey] ?? "slate"}>
                        {STATUS_LABEL[statusKey] ?? q.status}
                      </StatusPill>
                    </td>
                    <td className="hidden px-5 py-3.5 text-slate-400 md:table-cell">
                      {formatDate(q.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/queries/${q.id}`}
                        aria-label={`View "${q.subject}"`}
                        className="inline-grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
