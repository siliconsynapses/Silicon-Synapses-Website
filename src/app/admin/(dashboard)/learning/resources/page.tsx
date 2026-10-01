import Link from "next/link";
import { FileText, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { listAdminResources } from "../data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteResource } from "./actions";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  LINK: "Link",
  FILE: "File",
  VIDEO: "Video",
  BOOK: "Book",
  NOTE: "Note",
};

export default async function ResourcesPage() {
  await requirePage("ADMIN");
  const rows = await listAdminResources();

  return (
    <div>
      <AdminPageHeader
        title="Resources"
        description="Learning materials, each filed under a subject and a category."
        backHref="/admin/learning"
        backLabel="Learning hub"
        actions={
          <ButtonLink href="/admin/learning/resources/new" size="sm">
            <Plus size={16} />
            New resource
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No resources yet"
          description="Add your first learning resource. You'll need a subject and a category."
          icon={<FileText size={22} />}
        >
          <ButtonLink href="/admin/learning/resources/new" size="sm">
            <Plus size={16} />
            New resource
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Resource</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Category</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{r.title}</div>
                    <div className="text-xs text-slate-500">
                      {r.branchName} · Sem {r.semester} · {r.subjectName}
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 md:table-cell">
                    {r.categoryName}
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {TYPE_LABELS[r.type] ?? r.type}
                  </td>
                  <td className="px-5 py-3.5">
                    {r.isPublished ? (
                      <StatusPill tone="green">Published</StatusPill>
                    ) : (
                      <StatusPill tone="slate">Draft</StatusPill>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/learning/resources/${r.id}/edit`}
                        aria-label={`Edit ${r.title}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton
                        action={deleteResource.bind(null, r.id)}
                        variant="icon"
                        label={`Delete ${r.title}`}
                        confirmMessage={`Delete "${r.title}"? This cannot be undone.`}
                        onDeleted="/admin/learning/resources"
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
