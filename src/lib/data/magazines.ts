import { publicFileUrl } from "@/lib/storage";
import { safeDb } from "./safe";

export type MagazineView = {
  slug: string;
  title: string;
  issue: string;
  description: string | null;
  coverUrl: string | null;
  /** Resolved public URL to read/download the issue, or null when unavailable. */
  fileUrl: string | null;
  publishedAt: Date | null;
};

export async function getPublishedMagazines(): Promise<MagazineView[]> {
  const rows = await safeDb(
    (db) =>
      db.magazine.findMany({
        where: { isPublished: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    [],
  );

  return rows.map((m) => ({
    slug: m.slug,
    title: m.title,
    issue: m.issue,
    description: m.description,
    coverUrl: m.coverUrl,
    // An explicit fileUrl wins; otherwise resolve the storage key.
    fileUrl: m.fileUrl ?? publicFileUrl(m.fileKey),
    publishedAt: m.publishedAt,
  }));
}
