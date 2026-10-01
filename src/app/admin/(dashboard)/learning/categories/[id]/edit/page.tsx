import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import {
  getAdminCategory,
  DB_UNAVAILABLE,
} from "@/app/admin/(dashboard)/learning/data";
import { CategoryForm } from "@/app/admin/(dashboard)/learning/categories/category-form";
import { updateCategory } from "@/app/admin/(dashboard)/learning/categories/actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("ADMIN");
  const { id } = await params;
  const category = await getAdminCategory(id);

  if (category === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit category"
          backHref="/admin/learning/categories"
          backLabel="Categories"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!category) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit category"
        description={category.name}
        backHref="/admin/learning/categories"
        backLabel="Categories"
      />
      <CategoryForm
        action={updateCategory.bind(null, category.id)}
        mode="edit"
        defaultValues={{
          name: category.name,
          slug: category.slug,
          order: category.order,
        }}
      />
    </div>
  );
}
