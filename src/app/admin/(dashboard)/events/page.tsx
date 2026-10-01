import Link from "next/link";
import { CalendarDays, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/datetime";
import { listAdminEvents } from "@/app/admin/(dashboard)/events/data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteEvent } from "./actions";

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

export default async function EventsPage() {
  await requirePage("STAFF");
  const rows = await listAdminEvents();

  return (
    <div>
      <AdminPageHeader
        title="Events"
        description="Workshops, talks, and competitions. Only Published events are visible on the public site and open for registration."
        actions={
          <ButtonLink href="/admin/events/new" size="sm">
            <Plus size={16} />
            New event
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No events yet"
          description="Create your first event to open registration and QR attendance."
          icon={<CalendarDays size={22} />}
        >
          <ButtonLink href="/admin/events/new" size="sm">
            <Plus size={16} />
            New event
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">
                  When
                </th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Registrations
                </th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
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
                      <div className="font-medium text-white">{e.title}</div>
                      <div className="text-xs text-slate-500">
                        /{e.slug}
                        {e.departmentName ? ` · ${e.departmentName}` : ""}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 text-slate-400 md:table-cell">
                      {formatDateTime(e.startsAt)}
                    </td>
                    <td className="hidden px-5 py-3.5 tabular-nums text-slate-400 sm:table-cell">
                      {e.registrationCount}
                      {e.capacity ? ` / ${e.capacity}` : ""}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={tone}>{label}</StatusPill>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/events/${e.id}/edit`}
                          aria-label={`Edit ${e.title}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                        >
                          <Pencil size={15} />
                        </Link>
                        <DeleteButton
                          action={deleteEvent.bind(null, e.id)}
                          variant="icon"
                          label={`Delete ${e.title}`}
                          confirmMessage={`Delete "${e.title}"? All ${e.registrationCount} registration(s) for this event will also be permanently deleted. This cannot be undone.`}
                          onDeleted="/admin/events"
                        />
                      </div>
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
