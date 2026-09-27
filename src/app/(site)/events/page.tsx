import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCard } from "@/components/events/event-card";
import { getPublishedEvents, partitionByDate } from "@/lib/data/events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Workshops, talks, hackathons, and hands-on sessions hosted by Silicon Synapses. Register for what's coming up or revisit past events.",
};

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const { upcoming, past } = partitionByDate(events);

  return (
    <>
      <PageHero
        badge="What's on"
        title="Events"
        description="Workshops, talks, hackathons, and hands-on sessions run by our domains. Register for what's coming up — or revisit what we've done."
      />

      <section className="pb-24">
        <Container className="space-y-16">
          {events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title="No events published yet"
              description={
                <>
                  <span className="text-slate-500">[DEMO CONTENT]</span> Events
                  will appear here as soon as the team publishes them from the
                  dashboard.
                </>
              }
            />
          ) : (
            <>
              <div>
                <div className="mb-6 flex items-baseline justify-between">
                  <h2 className="font-display text-xl font-semibold text-white">
                    Upcoming
                  </h2>
                  <span className="text-sm text-slate-500">
                    {upcoming.length}{" "}
                    {upcoming.length === 1 ? "event" : "events"}
                  </span>
                </div>
                {upcoming.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((event) => (
                      <EventCard key={event.slug} event={event} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<CalendarDays size={22} />}
                    title="Nothing scheduled right now"
                    description="No upcoming events at the moment — check back soon."
                  />
                )}
              </div>

              {past.length > 0 ? (
                <div>
                  <h2 className="mb-6 font-display text-xl font-semibold text-white">
                    Past events
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {past.map((event) => (
                      <EventCard key={event.slug} event={event} />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
