import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for the audit log (SUPER_ADMIN only). Read-only — the trail
 * is append-only and written by logAudit after each privileged mutation.
 */

export type AdminAuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Prisma.JsonValue;
  createdAt: Date;
  actorName: string | null;
  actorEmail: string | null;
};

const PAGE_SIZE = 200;

export function listAuditLog(): Promise<MaybeDb<AdminAuditRow[]>> {
  return tryDb(async () => {
    const rows = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        actor: { select: { name: true, email: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      entity: r.entity,
      entityId: r.entityId,
      metadata: r.metadata,
      createdAt: r.createdAt,
      actorName: r.actor?.name ?? null,
      actorEmail: r.actor?.email ?? null,
    }));
  });
}

export const AUDIT_PAGE_SIZE = PAGE_SIZE;
export { DB_UNAVAILABLE };
