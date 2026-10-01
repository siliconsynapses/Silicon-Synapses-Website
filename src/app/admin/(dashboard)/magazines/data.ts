import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for the "Newton's Apple" magazine archive. Returns ALL
 * issues (including unpublished drafts) for the management table.
 */

export type AdminMagazineRow = {
  id: string;
  slug: string;
  title: string;
  issue: string;
  publishedAt: Date | null;
  isPublished: boolean;
};

export function listAdminMagazines(): Promise<MaybeDb<AdminMagazineRow[]>> {
  return tryDb(() =>
    db.magazine.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        issue: true,
        publishedAt: true,
        isPublished: true,
      },
    }),
  );
}

export function getAdminMagazine(id: string) {
  return tryDb(() => db.magazine.findUnique({ where: { id } }));
}

export { DB_UNAVAILABLE };
