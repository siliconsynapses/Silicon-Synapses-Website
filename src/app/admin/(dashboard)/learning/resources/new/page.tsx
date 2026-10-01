import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import {
  subjectOptions,
  categoryOptions,
} from "@/app/admin/(dashboard)/learning/data";
import { ResourceForm } from "@/app/admin/(dashboard)/learning/resources/resource-form";
import { createResource } from "@/app/admin/(dashboard)/learning/resources/actions";

export const dynamic = "force-dynamic";

export default async function NewResourcePage() {
  await requirePage("ADMIN");
  const [subjects, categories] = await Promise.all([
    subjectOptions(),
    categoryOptions(),
  ]);
  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New resource"
        backHref="/admin/learning/resources"
        backLabel="Resources"
      />
      <ResourceForm
        action={createResource}
        subjects={subjects}
        categories={categories}
        mode="create"
      />
    </div>
  );
}
