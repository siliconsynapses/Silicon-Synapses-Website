import { safeDb } from "./safe";

export type TeamMemberView = {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  bio: string | null;
  email: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  departmentName: string | null;
};

function toView(m: {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  bio: string | null;
  email: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  department: { name: string } | null;
}): TeamMemberView {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    photoUrl: m.photoUrl,
    bio: m.bio,
    email: m.email,
    linkedinUrl: m.linkedinUrl,
    githubUrl: m.githubUrl,
    departmentName: m.department?.name ?? null,
  };
}

export async function getTeamMembers(): Promise<TeamMemberView[]> {
  const rows = await safeDb(
    (db) =>
      db.teamMember.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: { department: { select: { name: true } } },
      }),
    [],
  );
  return rows.map(toView);
}

export async function getTeamByDepartment(
  slug: string,
): Promise<TeamMemberView[]> {
  const rows = await safeDb(
    (db) =>
      db.teamMember.findMany({
        where: { isActive: true, department: { slug } },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: { department: { select: { name: true } } },
      }),
    [],
  );
  return rows.map(toView);
}
