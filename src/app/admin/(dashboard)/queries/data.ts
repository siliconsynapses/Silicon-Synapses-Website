import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for the query / suggestion / feedback inbox.
 *
 * Privacy: participant name + email are only ever read here, behind the
 * STAFF-guarded admin pages. They must never appear in public URLs, QR codes,
 * or audit-log metadata.
 */

export type AdminQueryRow = {
  id: string;
  type: string;
  status: string;
  name: string;
  subject: string;
  createdAt: Date;
};

export function listAdminQueries(): Promise<MaybeDb<AdminQueryRow[]>> {
  return tryDb(() =>
    db.query.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        type: true,
        status: true,
        name: true,
        subject: true,
        createdAt: true,
      },
    }),
  );
}

export function getAdminQuery(id: string) {
  return tryDb(() =>
    db.query.findUnique({
      where: { id },
      include: {
        respondedBy: { select: { name: true, email: true } },
      },
    }),
  );
}

export { DB_UNAVAILABLE };
