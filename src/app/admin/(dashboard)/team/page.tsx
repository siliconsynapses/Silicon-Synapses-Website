import Link from "next/link";
import { Users, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { listAdminTeam } from "./data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteTeamMember } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  await requirePage("ADMIN");
  const rows = await listAdminTeam();

  return (
    <div>
      <AdminPageHeader
        title="Team"
        description="Club office-bearers and domain leads shown on the public site. Order controls their display sequence."
        actions={
          <ButtonLink href="/admin/team/new" size="sm">
            <Plus size={16} />
            Add member
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No team members yet"
          description="Add your first office-bearer or domain lead to populate the public team section."
          icon={<Users size={22} />}
        >
          <ButtonLink href="/admin/team/new" size="sm">
            <Plus size={16} />
            Add member
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Department
                </th>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.role}</div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {m.departmentName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-400">
                    {m.order}
                  </td>
                  <td className="px-5 py-3.5">
                    {m.isActive ? (
                      <StatusPill tone="green">Active</StatusPill>
                    ) : (
                      <StatusPill tone="slate">Hidden</StatusPill>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/team/${m.id}/edit`}
                        aria-label={`Edit ${m.name}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton
                        action={deleteTeamMember.bind(null, m.id)}
                        variant="icon"
                        label={`Delete ${m.name}`}
                        confirmMessage={`Remove "${m.name}" from the team? This cannot be undone.`}
                        onDeleted="/admin/team"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
