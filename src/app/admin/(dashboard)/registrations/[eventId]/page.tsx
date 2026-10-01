import { notFound } from "next/navigation";
import { ExternalLink, Users } from "lucide-react";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  AdminEmptyState,
  DbUnavailableNotice,
} from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/datetime";
import { getEventRegistrations, DB_UNAVAILABLE } from "../data";
import { RegistrationActions } from "../_components/registration-actions";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ eventId: string }> };

const REG_TONE = {
  CONFIRMED: "green",
  WAITLISTED: "amber",
  CANCELLED: "red",
} as const;

const REG_LABEL = {
  CONFIRMED: "Confirmed",
  WAITLISTED: "Waitlisted",
  CANCELLED: "Cancelled",
} as const;

/**
 * Single-event participant list. STAFF-gated. Participant contact details are
 * shown here for attendance management only — they are never exposed on the
 * public site, in a pass URL, or in a QR code.
 */
export default async function EventRegistrationsPage({ params }: PageProps) {
  await requirePage("STAFF");
  const { eventId } = await params;
  const data = await getEventRegistrations(eventId);

  if (data === DB_UNAVAILABLE) {
    return (
      <div>
        <AdminPageHeader
          title="Registrations"
          backHref="/admin/registrations"
          backLabel="All events"
        />
        <DbUnavailableNotice />
      </div>
    );
  }
  if (!data) notFound();

  const { event, registrations } = data;
  const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
  const checkedIn = registrations.filter((r) => r.checkedInAt).length;

  return (
    <div>
      <AdminPageHeader
        title={event.title}
        description={`${formatDateTime(event.startsAt)} · ${confirmed} confirmed${
          event.capacity ? ` / ${event.capacity}` : ""
        } · ${checkedIn} checked in`}
        backHref="/admin/registrations"
        backLabel="All events"
      />

      {registrations.length === 0 ? (
        <AdminEmptyState
          title="No registrations yet"
          description="When people register for this event, they'll appear here with their pass and check-in status."
          icon={<Users size={22} />}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Attendee</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">
                    Registered
                  </th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Check-in</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {registrations.map((r) => (
                  <tr
                    key={r.id}
                    className="align-top transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">
                        {r.participantName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.participantEmail}
                        {r.participantPhone ? ` · ${r.participantPhone}` : ""}
                      </div>
                      <a
                        href={`/pass/${r.passToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-accent"
                      >
                        View pass <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="hidden px-5 py-3.5 text-slate-400 md:table-cell">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={REG_TONE[r.status]}>
                        {REG_LABEL[r.status]}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {r.checkedInAt ? (
                        <span className="text-emerald-300">
                          {formatDateTime(r.checkedInAt)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <RegistrationActions
                        id={r.id}
                        checkedIn={!!r.checkedInAt}
                        status={r.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Participant contact details are visible to staff for attendance
            management only. They are never shown on the public site or encoded
            in a pass QR.
          </p>
        </>
      )}
    </div>
  );
}
