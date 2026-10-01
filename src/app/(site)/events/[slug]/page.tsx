import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Info,
  MapPin,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getEventBySlug } from "@/lib/data/events";
import { formatEventDate, formatEventTime } from "@/lib/format";
import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.summary };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const isCancelled = event.status === "CANCELLED";
  const hasEnded =
    event.status === "COMPLETED" ||
    (event.endsAt ?? event.startsAt).getTime() < Date.now();
  const capacityLabel =
    event.capacity != null
      ? `${event.registrationCount} / ${event.capacity} registered`
      : null;

  // Registration window — the public view; the server action re-checks all of
  // this before writing, so it's the source of truth, not this.
  const now = Date.now();
  const isFull =
    event.capacity != null && event.registrationCount >= event.capacity;
  const notYetOpen =
    event.registrationOpensAt != null &&
    now < event.registrationOpensAt.getTime();
  const registrationClosed =
    event.registrationClosesAt != null &&
    now > event.registrationClosesAt.getTime();

  return (
    <article className="pb-24">
      {/* Banner */}
      <div className="relative h-[38vh] min-h-64 w-full overflow-hidden bg-linear-to-br from-accent/15 via-ink to-accent-3/10">
        {event.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-transparent"
        />
      </div>

      <Container className="relative -mt-24">
        <ButtonLink
          href="/events"
          variant="ghost"
          size="sm"
          className="mb-5 -ml-2 text-slate-400"
        >
          <ArrowLeft size={15} /> All events
        </ButtonLink>

        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          {/* Main */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {event.departmentName ? (
                <Badge>{event.departmentName}</Badge>
              ) : null}
              {isCancelled ? (
                <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300">
                  Cancelled
                </span>
              ) : hasEnded ? (
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
                  Past event
                </span>
              ) : (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Upcoming
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {event.title}
            </h1>
            <p className="mt-3 text-lg text-slate-300">{event.summary}</p>

            <div className="mt-8 max-w-none whitespace-pre-line text-pretty leading-relaxed text-slate-300">
              {event.description}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400">
                Details
              </h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <CalendarDays size={17} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-slate-500">Date</dt>
                    <dd className="text-slate-200">
                      {formatEventDate(event.startsAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock size={17} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-slate-500">Time</dt>
                    <dd className="text-slate-200">
                      {formatEventTime(event.startsAt)}
                      {event.endsAt
                        ? ` – ${formatEventTime(event.endsAt)}`
                        : ""}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-slate-500">Venue</dt>
                    <dd className="text-slate-200">{event.venue}</dd>
                  </div>
                </div>
                {capacityLabel ? (
                  <div className="flex gap-3">
                    <Users size={17} className="mt-0.5 shrink-0 text-accent" />
                    <div>
                      <dt className="text-slate-500">Capacity</dt>
                      <dd className="text-slate-200">{capacityLabel}</dd>
                    </div>
                  </div>
                ) : null}
              </dl>
            </div>

            {/* Registration — live for open events (digital pass + QR check-in),
                with honest messaging for cancelled / past / not-yet-open /
                closed states. The server action re-verifies all of this. */}
            <div className="rounded-2xl border border-white/10 bg-surface/40 p-6">
              <div className="flex items-center gap-2 text-accent">
                <Info size={16} />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider">
                  Registration
                </h2>
              </div>
              {isCancelled ? (
                <p className="mt-3 text-sm text-slate-400">
                  This event has been cancelled. Watch this space for future
                  sessions.
                </p>
              ) : hasEnded ? (
                <p className="mt-3 text-sm text-slate-400">
                  This event has already taken place. Browse upcoming events to
                  join the next one.
                </p>
              ) : notYetOpen ? (
                <p className="mt-3 text-sm text-slate-400">
                  Registration opens on{" "}
                  <span className="text-slate-200">
                    {formatEventDate(event.registrationOpensAt!)}
                  </span>
                  . Check back then to claim your digital pass.
                </p>
              ) : registrationClosed ? (
                <p className="mt-3 text-sm text-slate-400">
                  Registration for this event has closed. If you&apos;d still
                  like to attend, reach out and we&apos;ll try to help.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm text-slate-400">
                    Register to get your digital entry pass — a QR code you show
                    at the door for check-in.
                  </p>
                  <RegistrationForm eventSlug={slug} isFull={isFull} />
                </>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
