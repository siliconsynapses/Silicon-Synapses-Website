import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Append an entry to the audit trail. Called server-side after every authorized
 * privileged mutation (create/update/delete/publish/check-in/role change).
 *
 * Best-effort: a logging failure must never break the underlying operation, so
 * errors are swallowed (and surfaced in dev only).
 */
export async function logAudit(entry: {
  actorId?: string | null;
  action: string; // e.g. "event.publish"
  entity: string; // e.g. "Event"
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        ...(entry.metadata !== undefined ? { metadata: entry.metadata } : {}),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[audit] failed to write log:",
        error instanceof Error ? error.message : error,
      );
    }
  }
}
