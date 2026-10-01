import { db } from "@/lib/db";
import { safeDb } from "@/lib/data/safe";

/**
 * Admin-side reads. Unlike the public data layer these return ALL rows
 * (including inactive/unpublished) and richer relations for management.
 * A sentinel is used so callers can distinguish "DB down" from "no rows".
 */

export const DB_UNAVAILABLE = Symbol("db-unavailable");
export type MaybeDb<T> = T | typeof DB_UNAVAILABLE;

export async function tryDb<T>(run: () => Promise<T>): Promise<MaybeDb<T>> {
  return safeDb<MaybeDb<T>>(() => run(), DB_UNAVAILABLE);
}

// --- Departments -----------------------------------------------------------
export type AdminDepartmentRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  order: number;
  isActive: boolean;
  eventCount: number;
  teamCount: number;
};

export function listAdminDepartments(): Promise<MaybeDb<AdminDepartmentRow[]>> {
  return tryDb(async () => {
    const rows = await db.department.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { events: true, teamMembers: true } },
      },
    });
    return rows.map((d) => ({
      id: d.id,
      slug: d.slug,
      name: d.name,
      tagline: d.tagline,
      icon: d.icon,
      accent: d.accent,
      order: d.order,
      isActive: d.isActive,
      eventCount: d._count.events,
      teamCount: d._count.teamMembers,
    }));
  });
}

export function getAdminDepartment(id: string) {
  return tryDb(() => db.department.findUnique({ where: { id } }));
}

/** Lightweight id/name list for <select> inputs (events, team). */
export function departmentOptions(): Promise<
  MaybeDb<{ id: string; name: string }[]>
> {
  return tryDb(() =>
    db.department.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  );
}

// --- Dashboard overview ----------------------------------------------------
export type DashboardStats = {
  publishedEvents: number;
  totalEvents: number;
  registrations: number;
  checkedIn: number;
  departments: number;
  teamMembers: number;
  publishedResources: number;
  openQueries: number;
};

/** Aggregate counts for the admin landing page (single round-trip). */
export function getDashboardStats(): Promise<MaybeDb<DashboardStats>> {
  return tryDb(async () => {
    const [
      publishedEvents,
      totalEvents,
      registrations,
      checkedIn,
      departments,
      teamMembers,
      publishedResources,
      openQueries,
    ] = await Promise.all([
      db.event.count({ where: { status: "PUBLISHED" } }),
      db.event.count(),
      db.registration.count(),
      db.registration.count({ where: { checkedInAt: { not: null } } }),
      db.department.count(),
      db.teamMember.count(),
      db.resource.count({ where: { isPublished: true } }),
      db.query.count({ where: { status: "OPEN" } }),
    ]);
    return {
      publishedEvents,
      totalEvents,
      registrations,
      checkedIn,
      departments,
      teamMembers,
      publishedResources,
      openQueries,
    };
  });
}

/** Most recent open queries for the dashboard's action list. */
export function recentOpenQueries(limit = 5) {
  return tryDb(() =>
    db.query.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        name: true,
        subject: true,
        createdAt: true,
      },
    }),
  );
}
