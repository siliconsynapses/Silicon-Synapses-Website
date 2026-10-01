import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for the Learning Resource Hub
 * (Branch → Semester → Subject → Category → Resource).
 *
 * All four entities share this module. Each list read includes the counts the
 * management tables and delete-confirmations need (e.g. how many resources hang
 * off a category, since ResourceCategory uses onDelete: Restrict).
 */

// --- Branches --------------------------------------------------------------

export type AdminBranchRow = {
  id: string;
  slug: string;
  name: string;
  order: number;
  isActive: boolean;
  subjectCount: number;
};

export function listAdminBranches(): Promise<MaybeDb<AdminBranchRow[]>> {
  return tryDb(async () => {
    const rows = await db.branch.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        order: true,
        isActive: true,
        _count: { select: { subjects: true } },
      },
    });
    return rows.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      order: b.order,
      isActive: b.isActive,
      subjectCount: b._count.subjects,
    }));
  });
}

export function getAdminBranch(id: string) {
  return tryDb(() => db.branch.findUnique({ where: { id } }));
}

// --- Subjects --------------------------------------------------------------

export type AdminSubjectRow = {
  id: string;
  name: string;
  code: string | null;
  semester: number;
  order: number;
  isActive: boolean;
  branchName: string;
  resourceCount: number;
};

export function listAdminSubjects(): Promise<MaybeDb<AdminSubjectRow[]>> {
  return tryDb(async () => {
    const rows = await db.subject.findMany({
      orderBy: [{ branch: { order: "asc" } }, { semester: "asc" }, { order: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
        semester: true,
        order: true,
        isActive: true,
        branch: { select: { name: true } },
        _count: { select: { resources: true } },
      },
    });
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      semester: s.semester,
      order: s.order,
      isActive: s.isActive,
      branchName: s.branch.name,
      resourceCount: s._count.resources,
    }));
  });
}

export function getAdminSubject(id: string) {
  return tryDb(() => db.subject.findUnique({ where: { id } }));
}

// --- Categories ------------------------------------------------------------

export type AdminCategoryRow = {
  id: string;
  slug: string;
  name: string;
  order: number;
  resourceCount: number;
};

export function listAdminCategories(): Promise<MaybeDb<AdminCategoryRow[]>> {
  return tryDb(async () => {
    const rows = await db.resourceCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        order: true,
        _count: { select: { resources: true } },
      },
    });
    return rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      order: c.order,
      resourceCount: c._count.resources,
    }));
  });
}

export function getAdminCategory(id: string) {
  return tryDb(() => db.resourceCategory.findUnique({ where: { id } }));
}

// --- Resources -------------------------------------------------------------

export type AdminResourceRow = {
  id: string;
  title: string;
  type: string;
  isPublished: boolean;
  subjectName: string;
  branchName: string;
  semester: number;
  categoryName: string;
};

export function listAdminResources(): Promise<MaybeDb<AdminResourceRow[]>> {
  return tryDb(async () => {
    const rows = await db.resource.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        isPublished: true,
        subject: {
          select: { name: true, semester: true, branch: { select: { name: true } } },
        },
        category: { select: { name: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      isPublished: r.isPublished,
      subjectName: r.subject.name,
      branchName: r.subject.branch.name,
      semester: r.subject.semester,
      categoryName: r.category.name,
    }));
  });
}

export function getAdminResource(id: string) {
  return tryDb(() => db.resource.findUnique({ where: { id } }));
}

// --- Option lists (for <select> inputs) ------------------------------------

export type Option = { id: string; label: string };

export async function branchOptions(): Promise<Option[]> {
  const result = await tryDb(() =>
    db.branch.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  );
  if (result === DB_UNAVAILABLE) return [];
  return result.map((b) => ({ id: b.id, label: b.name }));
}

export async function subjectOptions(): Promise<Option[]> {
  const result = await tryDb(() =>
    db.subject.findMany({
      orderBy: [{ branch: { order: "asc" } }, { semester: "asc" }, { order: "asc" }],
      select: {
        id: true,
        name: true,
        semester: true,
        branch: { select: { name: true } },
      },
    }),
  );
  if (result === DB_UNAVAILABLE) return [];
  return result.map((s) => ({
    id: s.id,
    label: `${s.branch.name} · Sem ${s.semester} · ${s.name}`,
  }));
}

export async function categoryOptions(): Promise<Option[]> {
  const result = await tryDb(() =>
    db.resourceCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  );
  if (result === DB_UNAVAILABLE) return [];
  return result.map((c) => ({ id: c.id, label: c.name }));
}

// --- Hub counts ------------------------------------------------------------

export type LearningStats = {
  branches: number;
  subjects: number;
  categories: number;
  resources: number;
};

export function getLearningStats(): Promise<MaybeDb<LearningStats>> {
  return tryDb(async () => {
    const [branches, subjects, categories, resources] = await Promise.all([
      db.branch.count(),
      db.subject.count(),
      db.resourceCategory.count(),
      db.resource.count(),
    ]);
    return { branches, subjects, categories, resources };
  });
}

export { DB_UNAVAILABLE };
