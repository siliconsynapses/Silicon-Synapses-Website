import Link from "next/link";
import { ChevronRight, Ticket } from "lucide-react";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  AdminEmptyState,
  DbUnavailableNotice,
} from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/datetime";
import { listEventsWithRegistrationStats, DB_UNAVAILABLE } from "./data";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  DRAFT: "slate",
  PUBLISHED: "green",
  CANCELLED: "red",
  COMPLETED: "cyan",
} as const;

const STATUS_LABEL = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
} as const;

/**
 * Registrations landing — one row per event with live registration + check-in
 * counts. Drilling into an event shows its participant list (STAFF-only;
 * participant contact details never leave the admin console). STAFF-gated.
 */
export default async function RegistrationsPage() {
  await requirePage("STAFF");
  const rows = await listEventsWithRegistrationStats();

  return (
    <div>
      <AdminPageHeader
        title="Registrations"
        description="Every event with its registration and check-in totals. Open an event to see its participant list and manage attendees."
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No events yet"
          description="Create and publish an event to start collecting registrations."
          icon={<Ticket size={22} />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 text-right font-medium">Confirmed</th>
                <th className="hidden px-5 py-3 text-right font-medium sm:table-cell">
                  Waitlist
                </th>
                <th className="px-5 py-3 text-right font-medium">Checked in</th>
                <th className="px-5 py-3 text-right font-medium">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((e) => {
                const tone =
                  STATUS_TONE[e.status as keyof typeof STATUS_TONE] ?? "slate";
                const label =
                  STATUS_LABEL[e.status as keyof typeof STATUS_LABEL] ??
                  e.status;
                return (
                  <tr
                    key={e.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/registrations/${e.id}`}
                        className="font-medium text-white hover:text-accent"
                      >
                        {e.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <StatusPill tone={tone}>{label}</StatusPill>
                        <span>{formatDateTime(e.startsAt)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-200">
                      {e.confirmed}
                      {e.capacity ? (
                        <span className="text-slate-500">/{e.capacity}</span>
                      ) : null}
                    </td>
                    <td className="hidden px-5 py-3.5 text-right tabular-nums text-slate-400 sm:table-cell">
                      {e.waitlisted || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-200">
                      {e.checkedIn}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/registrations/${e.id}`}
                        aria-label={`Open registrations for ${e.title}`}
                        className="inline-grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <ChevronRight size={16} />
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
