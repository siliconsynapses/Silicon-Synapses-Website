import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { departmentOptions, DB_UNAVAILABLE } from "@/lib/data/admin";
import { TeamMemberForm } from "@/app/admin/(dashboard)/team/team-member-form";
import { createTeamMember } from "@/app/admin/(dashboard)/team/actions";

export const dynamic = "force-dynamic";

export default async function NewTeamMemberPage() {
  await requirePage("ADMIN");
  const opts = await departmentOptions();
  const departments = opts === DB_UNAVAILABLE ? [] : opts;

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Add team member"
        backHref="/admin/team"
        backLabel="Team"
      />
      <TeamMemberForm
        action={createTeamMember}
        mode="create"
        departments={departments}
      />
    </div>
  );
}
