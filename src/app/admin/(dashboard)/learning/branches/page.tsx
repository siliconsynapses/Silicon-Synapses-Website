import Link from "next/link";
import { GitBranch, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { listAdminBranches } from "../data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteBranch } from "./actions";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  await requirePage("ADMIN");
  const rows = await listAdminBranches();

  return (
    <div>
      <AdminPageHeader
        title="Branches"
        description="Engineering branches. Each groups subjects across semesters 1–8."
        backHref="/admin/learning"
        backLabel="Learning hub"
        actions={
          <ButtonLink href="/admin/learning/branches/new" size="sm">
            <Plus size={16} />
            New branch
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No branches yet"
          description="Add a branch (e.g. Electronics & Communication) to start the library."
          icon={<GitBranch size={22} />}
        >
          <ButtonLink href="/admin/learning/branches/new" size="sm">
            <Plus size={16} />
            New branch
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Branch</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Subjects</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Order</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{b.name}</div>
                    <div className="text-xs text-slate-500">/{b.slug}</div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {b.subjectCount}
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {b.order}
                  </td>
                  <td className="px-5 py-3.5">
                    {b.isActive ? (
                      <StatusPill tone="green">Active</StatusPill>
                    ) : (
                      <StatusPill tone="slate">Hidden</StatusPill>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/learning/branches/${b.id}/edit`}
                        aria-label={`Edit ${b.name}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton
                        action={deleteBranch.bind(null, b.id)}
                        variant="icon"
                        label={`Delete ${b.name}`}
                        confirmMessage={
                          b.subjectCount > 0
                            ? `Delete "${b.name}"? This also deletes its ${b.subjectCount} subject(s) and all their resources. This cannot be undone.`
                            : `Delete "${b.name}"? This cannot be undone.`
                        }
                        onDeleted="/admin/learning/branches"
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
