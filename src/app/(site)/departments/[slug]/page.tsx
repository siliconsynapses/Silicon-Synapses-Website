import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DepartmentIcon } from "@/components/icons/department-icon";
import { EventCard } from "@/components/events/event-card";
import { TeamCard } from "@/components/team/team-card";
import { getDepartmentBySlug } from "@/lib/data/departments";
import { getTeamByDepartment } from "@/lib/data/team";
import { getEventsByDepartment } from "@/lib/data/events";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dept = await getDepartmentBySlug(slug);
  if (!dept) return { title: "Department not found" };
  return { title: dept.name, description: dept.description };
}

export default async function DepartmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dept = await getDepartmentBySlug(slug);
  if (!dept) notFound();

  const [team, events] = await Promise.all([
    getTeamByDepartment(slug),
    getEventsByDepartment(slug),
  ]);

  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-linear-to-br ${dept.accent} blur-[120px]`}
        />
        <Container className="relative">
          <ButtonLink
            href="/departments"
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2 text-slate-400"
          >
            <ArrowLeft size={15} /> All departments
          </ButtonLink>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-accent">
              <DepartmentIcon name={dept.icon} size={30} />
            </span>
            <div>
              <Badge>{dept.tagline}</Badge>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {dept.name}
              </h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-slate-300">
            {dept.description}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            [CONTENT REQUIRED] Add this domain&apos;s detailed charter, focus
            areas, and the skills members build — editable from the admin
            dashboard once the database is connected.
          </p>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="mb-6 flex items-center gap-2">
            <CalendarDays size={18} className="text-accent" />
            <h2 className="font-display text-xl font-semibold text-white">
              Events
            </h2>
          </div>
          {events.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title="No events yet"
              description="This domain hasn't published any events yet. Check the events page for everything coming up across the club."
            >
              <ButtonLink href="/events" variant="secondary" size="sm">
                Browse all events
              </ButtonLink>
            </EmptyState>
          )}
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="mb-6 flex items-center gap-2">
            <Users size={18} className="text-accent" />
            <h2 className="font-display text-xl font-semibold text-white">
              Team
            </h2>
          </div>
          {team.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users size={22} />}
              title="Team coming soon"
              description="Domain leads and members will appear here once the team roster is added."
            />
          )}
        </Container>
      </section>
    </>
  );
}
