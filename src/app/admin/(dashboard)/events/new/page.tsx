import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { departmentOptions, DB_UNAVAILABLE } from "@/lib/data/admin";
import { EventForm } from "@/app/admin/(dashboard)/events/event-form";
import { createEvent } from "@/app/admin/(dashboard)/events/actions";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requirePage("STAFF");
  const opts = await departmentOptions();
  const departments = opts === DB_UNAVAILABLE ? [] : opts;

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New event"
        backHref="/admin/events"
        backLabel="Events"
      />
      <EventForm action={createEvent} mode="create" departments={departments} />
    </div>
  );
}
