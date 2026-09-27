import type { EventStatus } from "@prisma/client";
import { safeDb } from "./safe";

export type EventListItem = {
  slug: string;
  title: string;
  summary: string;
  bannerUrl: string | null;
  venue: string;
  startsAt: Date;
  endsAt: Date | null;
  status: EventStatus;
  departmentName: string | null;
};

export type EventDetail = EventListItem & {
  description: string;
  capacity: number | null;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  registrationCount: number;
};

const listInclude = { department: { select: { name: true } } } as const;

function toListItem(e: {
  slug: string;
  title: string;
  summary: string;
  bannerUrl: string | null;
  venue: string;
  startsAt: Date;
  endsAt: Date | null;
  status: EventStatus;
  department: { name: string } | null;
}): EventListItem {
  return {
    slug: e.slug,
    title: e.title,
    summary: e.summary,
    bannerUrl: e.bannerUrl,
    venue: e.venue,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    status: e.status,
    departmentName: e.department?.name ?? null,
  };
}

/** Publicly visible events (published + completed), earliest first. */
export async function getPublishedEvents(): Promise<EventListItem[]> {
  const rows = await safeDb(
    (db) =>
      db.event.findMany({
        where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
        orderBy: { startsAt: "asc" },
        include: listInclude,
      }),
    [],
  );
  return rows.map(toListItem);
}

export async function getEventsByDepartment(
  slug: string,
): Promise<EventListItem[]> {
  const rows = await safeDb(
    (db) =>
      db.event.findMany({
        where: {
          status: { in: ["PUBLISHED", "COMPLETED"] },
          department: { slug },
        },
        orderBy: { startsAt: "asc" },
        include: listInclude,
      }),
    [],
  );
  return rows.map(toListItem);
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  const e = await safeDb(
    (db) =>
      db.event.findFirst({
        where: { slug, status: { in: ["PUBLISHED", "COMPLETED", "CANCELLED"] } },
        include: {
          department: { select: { name: true } },
          _count: { select: { registrations: true } },
        },
      }),
    null,
  );

  if (!e) return null;

  return {
    ...toListItem(e),
    description: e.description,
    capacity: e.capacity,
    registrationOpensAt: e.registrationOpensAt,
    registrationClosesAt: e.registrationClosesAt,
    registrationCount: e._count.registrations,
  };
}

/** Split a list into upcoming vs past relative to now. */
export function partitionByDate(events: EventListItem[], now = new Date()) {
  const upcoming: EventListItem[] = [];
  const past: EventListItem[] = [];
  for (const e of events) {
    const ended = (e.endsAt ?? e.startsAt).getTime() < now.getTime();
    if (ended || e.status === "COMPLETED") past.push(e);
    else upcoming.push(e);
  }
  // Past events read best most-recent first.
  past.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  return { upcoming, past };
}
