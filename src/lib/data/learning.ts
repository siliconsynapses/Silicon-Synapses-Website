import type { ResourceType } from "@prisma/client";
import { publicFileUrl } from "@/lib/storage";
import { safeDb } from "./safe";

export type LearningResource = {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  /** Resolved href (external link or stored file), or null when unavailable. */
  href: string | null;
  categoryName: string;
  categorySlug: string;
};

export type LearningSubject = {
  id: string;
  name: string;
  code: string | null;
  semester: number;
  resources: LearningResource[];
};

export type LearningBranch = {
  slug: string;
  name: string;
  subjects: LearningSubject[];
};

/**
 * The full published learning tree: Branch → Subject (by semester) → Resource
 * (grouped later by category in the UI). Fetched in one nested query and mapped
 * to plain, serializable view types for the client browser.
 *
 * Volume is modest for a club hub (dozens of subjects); if it grows, move
 * resource loading behind a per-subject route or pagination.
 */
export async function getLearningTree(): Promise<LearningBranch[]> {
  const branches = await safeDb(
    (db) =>
      db.branch.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
          subjects: {
            where: { isActive: true },
            orderBy: [{ semester: "asc" }, { order: "asc" }, { name: "asc" }],
            include: {
              resources: {
                where: { isPublished: true },
                orderBy: { createdAt: "desc" },
                include: { category: { select: { name: true, slug: true } } },
              },
            },
          },
        },
      }),
    [],
  );

  return branches.map((b) => ({
    slug: b.slug,
    name: b.name,
    subjects: b.subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      semester: s.semester,
      resources: s.resources.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        href: r.url ?? publicFileUrl(r.fileKey),
        categoryName: r.category.name,
        categorySlug: r.category.slug,
      })),
    })),
  }));
}
