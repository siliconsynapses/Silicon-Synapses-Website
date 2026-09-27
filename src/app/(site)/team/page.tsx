import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamCard } from "@/components/team/team-card";
import { getTeamMembers } from "@/lib/data/team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The students who lead Silicon Synapses across its domains — coordinators, domain leads, and the core team.",
};

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <>
      <PageHero
        badge="The people"
        title="Team"
        description="The students who keep Silicon Synapses running — coordinators, domain leads, and the core team behind every event and project."
      />

      <section className="pb-24">
        <Container>
          {team.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {team.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users size={22} />}
              title="Team roster coming soon"
              description={
                <>
                  <span className="text-slate-500">[CONTENT REQUIRED]</span> Team
                  member profiles will appear here once they&apos;re added from
                  the admin dashboard.
                </>
              }
            />
          )}
        </Container>
      </section>
    </>
  );
}
