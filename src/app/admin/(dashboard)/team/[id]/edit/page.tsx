import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { departmentOptions, DB_UNAVAILABLE } from "@/lib/data/admin";
import { getAdminTeamMember } from "@/app/admin/(dashboard)/team/data";
import { TeamMemberForm } from "@/app/admin/(dashboard)/team/team-member-form";
import { updateTeamMember } from "@/app/admin/(dashboard)/team/actions";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("ADMIN");
  const { id } = await params;
  const [member, opts] = await Promise.all([
    getAdminTeamMember(id),
    departmentOptions(),
  ]);

  if (member === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit team member"
          backHref="/admin/team"
          backLabel="Team"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!member) notFound();

  const departments = opts === DB_UNAVAILABLE ? [] : opts;

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit team member"
        description={member.name}
        backHref="/admin/team"
        backLabel="Team"
      />
      <TeamMemberForm
        action={updateTeamMember.bind(null, member.id)}
        mode="edit"
        departments={departments}
        defaultValues={{
          name: member.name,
          role: member.role,
          photoUrl: member.photoUrl,
          bio: member.bio,
          email: member.email,
          linkedinUrl: member.linkedinUrl,
          githubUrl: member.githubUrl,
          departmentId: member.departmentId,
          order: member.order,
          isActive: member.isActive,
        }}
      />
    </div>
  );
}
