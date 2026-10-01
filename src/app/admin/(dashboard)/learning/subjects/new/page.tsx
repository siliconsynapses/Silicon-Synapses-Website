import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { branchOptions } from "@/app/admin/(dashboard)/learning/data";
import { SubjectForm } from "@/app/admin/(dashboard)/learning/subjects/subject-form";
import { createSubject } from "@/app/admin/(dashboard)/learning/subjects/actions";

export const dynamic = "force-dynamic";

export default async function NewSubjectPage() {
  await requirePage("ADMIN");
  const branches = await branchOptions();
  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New subject"
        backHref="/admin/learning/subjects"
        backLabel="Subjects"
      />
      <SubjectForm action={createSubject} branches={branches} mode="create" />
    </div>
  );
}
