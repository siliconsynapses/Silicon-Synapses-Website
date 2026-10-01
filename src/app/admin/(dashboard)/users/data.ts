import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for user management (SUPER_ADMIN only).
 *
 * SECURITY: hashedPassword is NEVER selected, returned, or logged. Every read
 * here uses an explicit `select` that omits it.
 */

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export function listAdminUsers(): Promise<MaybeDb<AdminUserRow[]>> {
  return tryDb(() =>
    db.user.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      select: publicUserSelect,
    }),
  );
}

export function getAdminUser(id: string) {
  return tryDb(() =>
    db.user.findUnique({ where: { id }, select: publicUserSelect }),
  );
}

export { DB_UNAVAILABLE };
