import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import {
  getAdminSubject,
  branchOptions,
  DB_UNAVAILABLE,
} from "@/app/admin/(dashboard)/learning/data";
import { SubjectForm } from "@/app/admin/(dashboard)/learning/subjects/subject-form";
import { updateSubject } from "@/app/admin/(dashboard)/learning/subjects/actions";

export const dynamic = "force-dynamic";

export default async function EditSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("ADMIN");
  const { id } = await params;
  const [subject, branches] = await Promise.all([
    getAdminSubject(id),
    branchOptions(),
  ]);

  if (subject === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit subject"
          backHref="/admin/learning/subjects"
          backLabel="Subjects"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!subject) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit subject"
        description={subject.name}
        backHref="/admin/learning/subjects"
        backLabel="Subjects"
      />
      <SubjectForm
        action={updateSubject.bind(null, subject.id)}
        branches={branches}
        mode="edit"
        defaultValues={{
          branchId: subject.branchId,
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
          order: subject.order,
          isActive: subject.isActive,
        }}
      />
    </div>
  );
}
