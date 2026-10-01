import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { BranchForm } from "@/app/admin/(dashboard)/learning/branches/branch-form";
import { createBranch } from "@/app/admin/(dashboard)/learning/branches/actions";

export const dynamic = "force-dynamic";

export default async function NewBranchPage() {
  await requirePage("ADMIN");
  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New branch"
        backHref="/admin/learning/branches"
        backLabel="Branches"
      />
      <BranchForm action={createBranch} mode="create" />
    </div>
  );
}
