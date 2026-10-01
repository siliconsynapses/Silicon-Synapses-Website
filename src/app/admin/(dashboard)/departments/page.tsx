import Link from "next/link";
import { Boxes, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { listAdminDepartments, DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteDepartment } from "./actions";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  await requirePage("ADMIN");
  const rows = await listAdminDepartments();

  return (
    <div>
      <AdminPageHeader
        title="Departments"
        description="The technical domains shown across the public site. Order controls their display sequence."
        actions={
          <ButtonLink href="/admin/departments/new" size="sm">
            <Plus size={16} />
            New department
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No departments yet"
          description="Create your first technical domain to populate the public site."
          icon={<Boxes size={22} />}
        >
          <ButtonLink href="/admin/departments/new" size="sm">
            <Plus size={16} />
            New department
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Events
                </th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Team
                </th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{d.name}</div>
                    <div className="text-xs text-slate-500">
                      /{d.slug} · {d.tagline}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-400">
                    {d.order}
                  </td>
                  <td className="hidden px-5 py-3.5 tabular-nums text-slate-400 sm:table-cell">
                    {d.eventCount}
                  </td>
                  <td className="hidden px-5 py-3.5 tabular-nums text-slate-400 sm:table-cell">
                    {d.teamCount}
                  </td>
                  <td className="px-5 py-3.5">
                    {d.isActive ? (
                      <StatusPill tone="green">Active</StatusPill>
                    ) : (
                      <StatusPill tone="slate">Hidden</StatusPill>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/departments/${d.id}/edit`}
                        aria-label={`Edit ${d.name}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton
                        action={deleteDepartment.bind(null, d.id)}
                        variant="icon"
                        label={`Delete ${d.name}`}
                        confirmMessage={`Delete "${d.name}"? Events and team members linked to it will be detached. This cannot be undone.`}
                        onDeleted="/admin/departments"
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
