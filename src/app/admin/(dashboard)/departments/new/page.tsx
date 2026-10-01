import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { DepartmentForm } from "@/app/admin/(dashboard)/departments/department-form";
import { createDepartment } from "@/app/admin/(dashboard)/departments/actions";

export const dynamic = "force-dynamic";

export default async function NewDepartmentPage() {
  await requirePage("ADMIN");
  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New department"
        backHref="/admin/departments"
        backLabel="Departments"
      />
      <DepartmentForm action={createDepartment} mode="create" />
    </div>
  );
}
