import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { EventListItem } from "@/lib/data/events";
import { dateChip, formatEventWhen } from "@/lib/format";

export function EventCard({ event }: { event: EventListItem }) {
  const { day, month } = dateChip(event.startsAt);
  const isPast =
    event.status === "COMPLETED" ||
    (event.endsAt ?? event.startsAt).getTime() < Date.now();

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/40 transition-colors hover:border-accent/40"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-linear-to-br from-accent/15 to-accent-3/10">
        {event.bannerUrl ? (
          // Remote/uploaded banners of arbitrary origin — plain img avoids a
          // next/image remotePatterns allowlist. Local hero art uses next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.bannerUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
        )}
        <div className="absolute left-4 top-4 flex flex-col items-center rounded-xl border border-white/15 bg-ink/70 px-3 py-1.5 backdrop-blur">
          <span className="font-display text-lg font-bold leading-none text-white">
            {day}
          </span>
          <span className="text-[10px] font-medium tracking-wider text-accent">
            {month}
          </span>
        </div>
        {isPast ? (
          <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-ink/70 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur">
            Past
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {event.departmentName ? (
          <p className="text-xs font-medium uppercase tracking-wider text-accent/70">
            {event.departmentName}
          </p>
        ) : null}
        <h3 className="mt-1 font-display text-lg font-semibold text-white">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {event.summary}
        </p>
        <div className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-sm text-slate-400">
          <p className="flex items-center gap-2">
            <CalendarDays size={15} className="shrink-0 text-slate-500" />
            {formatEventWhen(event.startsAt, event.endsAt)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-slate-500" />
            {event.venue}
          </p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
          View details
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
