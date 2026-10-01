import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { DepartmentForm } from "@/app/admin/(dashboard)/departments/department-form";
import { updateDepartment } from "@/app/admin/(dashboard)/departments/actions";
import { getAdminDepartment, DB_UNAVAILABLE } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("ADMIN");
  const { id } = await params;
  const department = await getAdminDepartment(id);

  if (department === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit department"
          backHref="/admin/departments"
          backLabel="Departments"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!department) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit department"
        description={department.name}
        backHref="/admin/departments"
        backLabel="Departments"
      />
      <DepartmentForm
        action={updateDepartment.bind(null, department.id)}
        mode="edit"
        defaultValues={{
          name: department.name,
          slug: department.slug,
          tagline: department.tagline,
          description: department.description,
          icon: department.icon,
          accent: department.accent,
          order: department.order,
          isActive: department.isActive,
        }}
      />
    </div>
  );
}
