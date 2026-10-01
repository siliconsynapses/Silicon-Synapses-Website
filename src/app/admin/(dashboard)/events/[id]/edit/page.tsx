import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { departmentOptions, DB_UNAVAILABLE } from "@/lib/data/admin";
import { getAdminEvent } from "@/app/admin/(dashboard)/events/data";
import { EventForm } from "@/app/admin/(dashboard)/events/event-form";
import { updateEvent } from "@/app/admin/(dashboard)/events/actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("STAFF");
  const { id } = await params;
  const [event, opts] = await Promise.all([
    getAdminEvent(id),
    departmentOptions(),
  ]);

  if (event === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader
          title="Edit event"
          backHref="/admin/events"
          backLabel="Events"
        />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!event) notFound();

  const departments = opts === DB_UNAVAILABLE ? [] : opts;

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit event"
        description={event.title}
        backHref="/admin/events"
        backLabel="Events"
      />
      <EventForm
        action={updateEvent.bind(null, event.id)}
        mode="edit"
        departments={departments}
        defaultValues={{
          title: event.title,
          slug: event.slug,
          summary: event.summary,
          description: event.description,
          bannerUrl: event.bannerUrl,
          venue: event.venue,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          capacity: event.capacity,
          status: event.status,
          registrationOpensAt: event.registrationOpensAt,
          registrationClosesAt: event.registrationClosesAt,
          departmentId: event.departmentId,
        }}
      />
    </div>
  );
}
