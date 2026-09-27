import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { getLearningTree } from "@/lib/data/learning";
import { LearningBrowser } from "./learning-browser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learning",
  description:
    "A curated library of notes, previous-year papers, reference books, video lectures, and lab manuals — organized by branch, semester, and subject.",
};

export default async function LearningPage() {
  const branches = await getLearningTree();
  const hasContent = branches.some((b) => b.subjects.length > 0);

  return (
    <>
      <PageHero
        badge="Resource hub"
        title="Learning"
        description="Notes, previous-year papers, reference books, video lectures, and lab manuals — organized by branch, semester, and subject."
      />

      <section className="pb-24">
        <Container>
          {hasContent ? (
            <LearningBrowser branches={branches} />
          ) : (
            <EmptyState
              icon={<GraduationCap size={22} />}
              title="Resource library coming soon"
              description={
                <>
                  <span className="text-slate-500">[DEMO CONTENT]</span> Study
                  resources will appear here — browsable by branch, semester,
                  and subject — once they&apos;re added from the dashboard.
                </>
              }
            />
          )}
        </Container>
      </section>
    </>
  );
}
