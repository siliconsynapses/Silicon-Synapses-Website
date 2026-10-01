import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { getCurrentUser } from "@/lib/rbac";
import { getAdminUser, DB_UNAVAILABLE } from "@/app/admin/(dashboard)/users/data";
import { UserForm } from "@/app/admin/(dashboard)/users/user-form";
import { ResetPasswordForm } from "@/app/admin/(dashboard)/users/reset-password-form";
import {
  updateUser,
  resetUserPassword,
} from "@/app/admin/(dashboard)/users/actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("SUPER_ADMIN");
  const { id } = await params;
  const [user, current] = await Promise.all([getAdminUser(id), getCurrentUser()]);

  if (user === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader title="Edit user" backHref="/admin/users" backLabel="Users" />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!user) notFound();

  const isSelf = current?.id === user.id;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <AdminPageHeader
          title="Edit user"
          description={user.email}
          backHref="/admin/users"
          backLabel="Users"
        />
        <UserForm
          action={updateUser.bind(null, user.id)}
          mode="edit"
          isSelf={isSelf}
          defaultValues={{
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          }}
        />
      </div>

      <div className="border-t border-white/10 pt-8">
        <h2 className="mb-1 text-sm font-semibold text-white">Reset password</h2>
        <p className="mb-4 text-sm text-slate-400">
          Set a new password for this user. They can change it after signing in.
        </p>
        <ResetPasswordForm action={resetUserPassword.bind(null, user.id)} />
      </div>
    </div>
  );
}
