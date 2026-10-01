import type { RegistrationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for event registrations. Participant contact details are
 * returned ONLY here (behind a STAFF page guard) — they are never part of the
 * public data layer, a public URL, or a pass QR. A sentinel distinguishes
 * "DB down" from "no rows".
 */

// --- Per-event summary (registrations landing) ----------------------------
export type EventRegistrationStats = {
  id: string;
  slug: string;
  title: string;
  status: string;
  startsAt: Date;
  capacity: number | null;
  total: number;
  confirmed: number;
  waitlisted: number;
  cancelled: number;
  checkedIn: number;
};

export function listEventsWithRegistrationStats(): Promise<
  MaybeDb<EventRegistrationStats[]>
> {
  return tryDb(async () => {
    const [events, byStatus, checkedIn] = await Promise.all([
      db.event.findMany({
        orderBy: [{ startsAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          startsAt: true,
          capacity: true,
        },
      }),
      db.registration.groupBy({
        by: ["eventId", "status"],
        _count: { _all: true },
      }),
      db.registration.groupBy({
        by: ["eventId"],
        where: { checkedInAt: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const statusByEvent = new Map<
      string,
      { confirmed: number; waitlisted: number; cancelled: number }
    >();
    for (const g of byStatus) {
      const cur =
        statusByEvent.get(g.eventId) ??
        { confirmed: 0, waitlisted: 0, cancelled: 0 };
      if (g.status === "CONFIRMED") cur.confirmed = g._count._all;
      else if (g.status === "WAITLISTED") cur.waitlisted = g._count._all;
      else if (g.status === "CANCELLED") cur.cancelled = g._count._all;
      statusByEvent.set(g.eventId, cur);
    }

    const checkedInByEvent = new Map<string, number>();
    for (const g of checkedIn) checkedInByEvent.set(g.eventId, g._count._all);

    return events.map((e) => {
      const c =
        statusByEvent.get(e.id) ??
        { confirmed: 0, waitlisted: 0, cancelled: 0 };
      return {
        id: e.id,
        slug: e.slug,
        title: e.title,
        status: e.status,
        startsAt: e.startsAt,
        capacity: e.capacity,
        total: c.confirmed + c.waitlisted + c.cancelled,
        confirmed: c.confirmed,
        waitlisted: c.waitlisted,
        cancelled: c.cancelled,
        checkedIn: checkedInByEvent.get(e.id) ?? 0,
      };
    });
  });
}

// --- Single-event participant list ----------------------------------------
export type RegistrationRow = {
  id: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  status: RegistrationStatus;
  checkedInAt: Date | null;
  createdAt: Date;
  passToken: string;
};

export type EventRegistrations = {
  event: {
    id: string;
    slug: string;
    title: string;
    status: string;
    startsAt: Date;
    capacity: number | null;
  };
  registrations: RegistrationRow[];
};

export function getEventRegistrations(
  eventId: string,
): Promise<MaybeDb<EventRegistrations | null>> {
  return tryDb(async () => {
    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        startsAt: true,
        capacity: true,
      },
    });
    if (!event) return null;

    const registrations = await db.registration.findMany({
      where: { eventId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        participantName: true,
        participantEmail: true,
        participantPhone: true,
        status: true,
        checkedInAt: true,
        createdAt: true,
        passToken: true,
      },
    });

    return { event, registrations };
  });
}

export { DB_UNAVAILABLE };
