import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { UserForm } from "@/app/admin/(dashboard)/users/user-form";
import { createUser } from "@/app/admin/(dashboard)/users/actions";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requirePage("SUPER_ADMIN");
  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="New user" backHref="/admin/users" backLabel="Users" />
      <UserForm action={createUser} mode="create" />
    </div>
  );
}
