import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import {
  getAdminBranch,
  DB_UNAVAILABLE,
} from "@/app/admin/(dashboard)/learning/data";
import { BranchForm } from "@/app/admin/(dashboard)/learning/branches/branch-form";
import { updateBranch } from "@/app/admin/(dashboard)/learning/branches/actions";

export const dynamic = "force-dynamic";

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("ADMIN");
  const { id } = await params;
  const branch = await getAdminBranch(id);

  if (branch === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit branch"
          backHref="/admin/learning/branches"
          backLabel="Branches"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!branch) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit branch"
        description={branch.name}
        backHref="/admin/learning/branches"
        backLabel="Branches"
      />
      <BranchForm
        action={updateBranch.bind(null, branch.id)}
        mode="edit"
        defaultValues={{
          name: branch.name,
          slug: branch.slug,
          order: branch.order,
          isActive: branch.isActive,
        }}
      />
    </div>
  );
}
