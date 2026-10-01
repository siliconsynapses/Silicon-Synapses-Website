import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { MagazineForm } from "@/app/admin/(dashboard)/magazines/magazine-form";
import { createMagazine } from "@/app/admin/(dashboard)/magazines/actions";

export const dynamic = "force-dynamic";

export default async function NewMagazinePage() {
  await requirePage("ADMIN");
  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New magazine issue"
        backHref="/admin/magazines"
        backLabel="Newton's Apple"
      />
      <MagazineForm action={createMagazine} mode="create" />
    </div>
  );
}
