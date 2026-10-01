import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { getAdminMagazine, DB_UNAVAILABLE } from "@/app/admin/(dashboard)/magazines/data";
import { MagazineForm } from "@/app/admin/(dashboard)/magazines/magazine-form";
import { updateMagazine } from "@/app/admin/(dashboard)/magazines/actions";

export const dynamic = "force-dynamic";

export default async function EditMagazinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("ADMIN");
  const { id } = await params;
  const magazine = await getAdminMagazine(id);

  if (magazine === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit issue"
          backHref="/admin/magazines"
          backLabel="Newton's Apple"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!magazine) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit issue"
        description={magazine.title}
        backHref="/admin/magazines"
        backLabel="Newton's Apple"
      />
      <MagazineForm
        action={updateMagazine.bind(null, magazine.id)}
        mode="edit"
        defaultValues={{
          title: magazine.title,
          slug: magazine.slug,
          issue: magazine.issue,
          description: magazine.description,
          coverUrl: magazine.coverUrl,
          fileUrl: magazine.fileUrl,
          publishedAt: magazine.publishedAt,
          isPublished: magazine.isPublished,
        }}
      />
    </div>
  );
}
