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
import { formatDate } from "@/lib/datetime";
import { listAdminMagazines } from "./data";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { deleteMagazine } from "./actions";

export const dynamic = "force-dynamic";

export default async function MagazinesPage() {
  await requirePage("ADMIN");
  const rows = await listAdminMagazines();

  return (
    <div>
      <AdminPageHeader
        title="Newton's Apple"
        description="The club magazine archive. Only Published issues appear on the public site."
        actions={
          <ButtonLink href="/admin/magazines/new" size="sm">
            <Plus size={16} />
            New issue
          </ButtonLink>
        }
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No issues yet"
          description="Add your first magazine issue to start the archive."
          icon={<BookOpen size={22} />}
        >
          <ButtonLink href="/admin/magazines/new" size="sm">
            <Plus size={16} />
            New issue
          </ButtonLink>
        </AdminEmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Issue</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Published
                </th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{m.title}</div>
                    <div className="text-xs text-slate-500">
                      {m.issue} · /{m.slug}
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">
                    {formatDate(m.publishedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    {m.isPublished ? (
                      <StatusPill tone="green">Published</StatusPill>
                    ) : (
                      <StatusPill tone="slate">Draft</StatusPill>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/magazines/${m.id}/edit`}
                        aria-label={`Edit ${m.title}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton
                        action={deleteMagazine.bind(null, m.id)}
                        variant="icon"
                        label={`Delete ${m.title}`}
                        confirmMessage={`Delete "${m.title}"? This cannot be undone.`}
                        onDeleted="/admin/magazines"
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
