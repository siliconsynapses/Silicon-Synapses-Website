import { departmentsPreview } from "@/config/site";
import { safeDb } from "./safe";

export type DepartmentView = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
};

/**
 * Demo fallback (from site config) so the domains render before the DB is live
 * or seeded. These are seeded into the Department table by `npm run db:seed`,
 * after which the DB is the source of truth.
 */
const demoDepartments: DepartmentView[] = departmentsPreview.map((d) => ({
  slug: d.slug,
  name: d.name,
  tagline: d.tagline,
  description: d.description,
  icon: d.icon,
  accent: d.accent,
}));

export async function getDepartments(): Promise<DepartmentView[]> {
  const rows = await safeDb(
    (db) =>
      db.department.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
    [],
  );

  if (rows.length === 0) return demoDepartments;

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    icon: r.icon,
    accent: r.accent,
  }));
}

export async function getDepartmentBySlug(
  slug: string,
): Promise<DepartmentView | null> {
  const row = await safeDb(
    (db) => db.department.findUnique({ where: { slug } }),
    null,
  );

  if (row) {
    return {
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      icon: row.icon,
      accent: row.accent,
    };
  }

  return demoDepartments.find((d) => d.slug === slug) ?? null;
}
