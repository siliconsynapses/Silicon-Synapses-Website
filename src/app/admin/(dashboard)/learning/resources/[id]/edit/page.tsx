import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import {
  getAdminResource,
  subjectOptions,
  categoryOptions,
  DB_UNAVAILABLE,
} from "@/app/admin/(dashboard)/learning/data";
import { ResourceForm } from "@/app/admin/(dashboard)/learning/resources/resource-form";
import { updateResource } from "@/app/admin/(dashboard)/learning/resources/actions";

export const dynamic = "force-dynamic";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("ADMIN");
  const { id } = await params;
  const [resource, subjects, categories] = await Promise.all([
    getAdminResource(id),
    subjectOptions(),
    categoryOptions(),
  ]);

  if (resource === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit resource"
          backHref="/admin/learning/resources"
          backLabel="Resources"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!resource) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit resource"
        description={resource.title}
        backHref="/admin/learning/resources"
        backLabel="Resources"
      />
      <ResourceForm
        action={updateResource.bind(null, resource.id)}
        subjects={subjects}
        categories={categories}
        mode="edit"
        defaultValues={{
          title: resource.title,
          description: resource.description,
          type: resource.type,
          url: resource.url,
          fileKey: resource.fileKey,
          subjectId: resource.subjectId,
          categoryId: resource.categoryId,
          isPublished: resource.isPublished,
        }}
      />
    </div>
  );
}
