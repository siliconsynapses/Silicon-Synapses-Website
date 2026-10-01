import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { CategoryForm } from "@/app/admin/(dashboard)/learning/categories/category-form";
import { createCategory } from "@/app/admin/(dashboard)/learning/categories/actions";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requirePage("ADMIN");
  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New category"
        backHref="/admin/learning/categories"
        backLabel="Categories"
      />
      <CategoryForm action={createCategory} mode="create" />
    </div>
  );
}
