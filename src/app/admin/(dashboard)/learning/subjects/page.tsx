import Link from "next/link";
import { BookOpen, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { listAdminSubjects } from "../data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteSubject } from "./actions";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  await requirePage("ADMIN");
  const rows = await listAdminSubjects();

  return (
    <div>
      <AdminPageHeader
        title="Subjects"
        description="Subjects within a branch and semester. Resources are filed under a subject."
        backHref="/admin/learning"
        backLabel="Learning hub"
        actions={
          <ButtonLink href="/admin/learning/subjects/new" size="sm">
            <Plus size={16} />
            New subject
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No subjects yet"
          description="Add subjects to a branch and semester to organise resources."
          icon={<BookOpen size={22} />}
        >
          <ButtonLink href="/admin/learning/subjects/new" size="sm">
            <Plus size={16} />
            New subject
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Branch</th>
                <th className="px-5 py-3 font-medium">Sem</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Resources</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{s.name}</div>
                    {s.code ? (
                      <div className="text-xs text-slate-500">{s.code}</div>
                    ) : null}
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 md:table-cell">
                    {s.branchName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{s.semester}</td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {s.resourceCount}
                  </td>
                  <td className="px-5 py-3.5">
                    {s.isActive ? (
                      <StatusPill tone="green">Active</StatusPill>
                    ) : (
                      <StatusPill tone="slate">Hidden</StatusPill>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/learning/subjects/${s.id}/edit`}
                        aria-label={`Edit ${s.name}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton
                        action={deleteSubject.bind(null, s.id)}
                        variant="icon"
                        label={`Delete ${s.name}`}
                        confirmMessage={
                          s.resourceCount > 0
                            ? `Delete "${s.name}"? This also deletes its ${s.resourceCount} resource(s). This cannot be undone.`
                            : `Delete "${s.name}"? This cannot be undone.`
                        }
                        onDeleted="/admin/learning/subjects"
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
