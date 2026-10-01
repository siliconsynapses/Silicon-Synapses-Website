import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for Events. Returns ALL events (including drafts) with the
 * linked department name and a registration count for the management table.
 * A sentinel distinguishes "DB down" from "no rows".
 */

export type AdminEventRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  startsAt: Date;
  venue: string;
  capacity: number | null;
  registrationCount: number;
  departmentName: string | null;
};

export function listAdminEvents(): Promise<MaybeDb<AdminEventRow[]>> {
  return tryDb(async () => {
    const rows = await db.event.findMany({
      orderBy: [{ startsAt: "desc" }],
      include: {
        department: { select: { name: true } },
        _count: { select: { registrations: true } },
      },
    });
    return rows.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      status: e.status,
      startsAt: e.startsAt,
      venue: e.venue,
      capacity: e.capacity,
      registrationCount: e._count.registrations,
      departmentName: e.department?.name ?? null,
    }));
  });
}

export function getAdminEvent(id: string) {
  return tryDb(() => db.event.findUnique({ where: { id } }));
}

export { DB_UNAVAILABLE };
