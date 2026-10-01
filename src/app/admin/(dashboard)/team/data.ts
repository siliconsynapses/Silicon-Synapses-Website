import { db } from "@/lib/db";
import { tryDb, DB_UNAVAILABLE, type MaybeDb } from "@/lib/data/admin";

/**
 * Admin-side reads for Team members. Returns ALL rows (including hidden) and
 * the linked department name for the management table. A sentinel distinguishes
 * "DB down" from "no rows" — mirrors the Departments data layer.
 */

export type AdminTeamRow = {
  id: string;
  name: string;
  role: string;
  order: number;
  isActive: boolean;
  departmentName: string | null;
};

export function listAdminTeam(): Promise<MaybeDb<AdminTeamRow[]>> {
  return tryDb(async () => {
    const rows = await db.teamMember.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { department: { select: { name: true } } },
    });
    return rows.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      order: m.order,
      isActive: m.isActive,
      departmentName: m.department?.name ?? null,
    }));
  });
}

export function getAdminTeamMember(id: string) {
  return tryDb(() => db.teamMember.findUnique({ where: { id } }));
}

export { DB_UNAVAILABLE };
