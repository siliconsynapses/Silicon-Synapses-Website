import Link from "next/link";
import { FolderTree, Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { listAdminCategories } from "../data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requirePage("ADMIN");
  const rows = await listAdminCategories();

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Reusable buckets resources are filed under (Notes, PYQs, Reference Books, …)."
        backHref="/admin/learning"
        backLabel="Learning hub"
        actions={
          <ButtonLink href="/admin/learning/categories/new" size="sm">
            <Plus size={16} />
            New category
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No categories yet"
          description="Add categories like Notes or PYQs to organise resources."
          icon={<FolderTree size={22} />}
        >
          <ButtonLink href="/admin/learning/categories/new" size="sm">
            <Plus size={16} />
            New category
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Resources</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Order</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">/{c.slug}</div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {c.resourceCount}
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {c.order}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/learning/categories/${c.id}/edit`}
                        aria-label={`Edit ${c.name}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton
                        action={deleteCategory.bind(null, c.id)}
                        variant="icon"
                        label={`Delete ${c.name}`}
                        confirmMessage={`Delete "${c.name}"? Categories with resources attached cannot be deleted.`}
                        onDeleted="/admin/learning/categories"
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
