import Link from "next/link";
import { Users as UsersIcon, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { getCurrentUser } from "@/lib/rbac";
import { formatDateTime } from "@/lib/datetime";
import { listAdminUsers } from "./data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteUser } from "./actions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  STAFF: "Staff",
};

const ROLE_TONE = {
  SUPER_ADMIN: "cyan",
  ADMIN: "green",
  STAFF: "slate",
} as const;

export default async function UsersPage() {
  await requirePage("SUPER_ADMIN");
  const [rows, current] = await Promise.all([listAdminUsers(), getCurrentUser()]);

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Staff and admin accounts. Only these accounts can sign in — the public never registers."
        actions={
          <ButtonLink href="/admin/users/new" size="sm">
            <Plus size={16} />
            New user
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No users yet"
          description="Create the first account. Seeding a super-admin is also available via the setup script."
          icon={<UsersIcon size={22} />}
        >
          <ButtonLink href="/admin/users/new" size="sm">
            <Plus size={16} />
            New user
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">
                  Last sign-in
                </th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((u) => {
                const roleKey = u.role as keyof typeof ROLE_TONE;
                const isSelf = current?.id === u.id;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-medium text-white">
                        {u.name}
                        {isSelf ? (
                          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                            You
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={ROLE_TONE[roleKey] ?? "slate"}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </StatusPill>
                    </td>
                    <td className="hidden px-5 py-3.5 text-slate-400 md:table-cell">
                      {formatDateTime(u.lastLoginAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.isActive ? (
                        <StatusPill tone="green">Active</StatusPill>
                      ) : (
                        <StatusPill tone="red">Inactive</StatusPill>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${u.id}/edit`}
                          aria-label={`Edit ${u.name}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                        >
                          <Pencil size={15} />
                        </Link>
                        {isSelf ? null : (
                          <DeleteButton
                            action={deleteUser.bind(null, u.id)}
                            variant="icon"
                            label={`Delete ${u.name}`}
                            confirmMessage={`Delete "${u.name}" (${u.email})? This cannot be undone.`}
                            onDeleted="/admin/users"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
