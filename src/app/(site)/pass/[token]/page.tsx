import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { Container } from "@/components/ui/container";
import { getPassByToken } from "@/lib/data/passes";
import { passQrSvg } from "@/lib/qr";
import { absoluteUrl } from "@/lib/site-url";
import { formatEventWhen } from "@/lib/format";
import { formatDateTime } from "@/lib/datetime";
import { getCurrentUser, hasRole } from "@/lib/rbac";
import { StaffCheckIn } from "./staff-check-in";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your event pass",
  // A pass is a private capability URL — keep it out of search indexes.
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ token: string }> };

const STATUS_META = {
  CONFIRMED: {
    label: "Confirmed",
    cls: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  },
  WAITLISTED: {
    label: "Waitlisted",
    cls: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  },
  CANCELLED: {
    label: "Cancelled",
    cls: "border-rose-400/30 bg-rose-500/10 text-rose-300",
  },
} as const;

export default async function PassPage({ params }: PageProps) {
  const { token } = await params;
  const pass = await getPassByToken(token);
  if (!pass) notFound();

  const passUrl = await absoluteUrl(`/pass/${token}`);
  const qrSvg = pass.status === "CANCELLED" ? null : await passQrSvg(passUrl);
  const statusMeta = STATUS_META[pass.status] ?? STATUS_META.CONFIRMED;

  // Signed-in staff viewing this pass (e.g. after scanning its QR) can record
  // the check-in in one tap. The action re-verifies STAFF server-side.
  const viewer = await getCurrentUser();
  const isStaff = viewer ? hasRole(viewer.role, "STAFF") : false;

  return (
    <div className="py-16">
      <Container>
        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-white/10 bg-surface/60 shadow-[0_0_60px_-20px_rgba(34,211,238,0.35)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-linear-to-r from-accent/15 to-accent-3/10 px-6 py-4">
            <span className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-accent">
              <Ticket size={16} /> Digital Pass
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusMeta.cls}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <div className="px-6 py-6">
            <h1 className="font-display text-xl font-bold text-white">
              {pass.event.title}
            </h1>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex gap-2.5 text-slate-300">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-accent" />
                <dd>{formatEventWhen(pass.event.startsAt, pass.event.endsAt)}</dd>
              </div>
              <div className="flex gap-2.5 text-slate-300">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                <dd>{pass.event.venue}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Attendee
              </p>
              <p className="mt-1 text-base font-medium text-white">
                {pass.participantName}
              </p>
            </div>

            {pass.checkedInAt ? (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <ShieldCheck size={17} className="shrink-0" />
                Checked in · {formatDateTime(pass.checkedInAt)}
              </div>
            ) : pass.status === "CANCELLED" ? (
              <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-5 text-center text-sm text-rose-200">
                This registration was cancelled.
              </div>
            ) : qrSvg ? (
              <div className="mt-6 flex flex-col items-center">
                <div
                  className="rounded-2xl bg-white p-3 [&>svg]:h-52 [&>svg]:w-52"
                  // qrSvg is generated server-side by the qrcode library from an
                  // absolute pass URL we control — not user input.
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="mt-3 text-center text-xs text-slate-400">
                  Show this QR at the door to check in.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5 text-center">
                <p className="text-xs text-slate-400">
                  Show this code at the door:
                </p>
                <p className="mt-2 break-all font-mono text-sm text-accent">
                  {token}
                </p>
              </div>
            )}

            {isStaff && pass.status !== "CANCELLED" ? (
              <StaffCheckIn token={token} checkedIn={!!pass.checkedInAt} />
            ) : null}

            <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
              This pass is personal to you. Your contact details are never shown
              here or encoded in the QR — only an opaque token.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
