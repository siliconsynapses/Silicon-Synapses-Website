import type { Metadata } from "next";
import { BookOpen, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublishedMagazines } from "@/lib/data/magazines";
import { formatMonthYear } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newton's Apple",
  description:
    "Newton's Apple — the student magazine of Silicon Synapses. Articles, projects, and ideas from across the ECE department.",
};

export default async function NewtonsApplePage() {
  const magazines = await getPublishedMagazines();

  return (
    <>
      <PageHero
        badge="The magazine"
        title="Newton's Apple"
        description="Our student magazine — a collection of articles, project write-ups, and ideas from across the department. Browse the archive below."
      />

      <section className="pb-24">
        <Container>
          {magazines.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {magazines.map((m) => (
                <article
                  key={m.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/40"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-linear-to-br from-accent/15 to-accent-3/10">
                    {m.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.coverUrl}
                        alt={`Cover of ${m.title}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-accent/40">
                        <BookOpen size={48} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-accent/70">
                      {m.issue}
                      {m.publishedAt
                        ? ` · ${formatMonthYear(m.publishedAt)}`
                        : ""}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-semibold text-white">
                      {m.title}
                    </h2>
                    {m.description ? (
                      <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                        {m.description}
                      </p>
                    ) : null}
                    <div className="mt-auto pt-4">
                      {m.fileUrl ? (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-strong"
                        >
                          Read issue
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">
                          [ASSET REQUIRED] Issue file not uploaded yet
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={22} />}
              title="No issues published yet"
              description={
                <>
                  <span className="text-slate-500">[DEMO CONTENT]</span> Issues of
                  Newton&apos;s Apple will appear here once they&apos;re
                  published from the dashboard.
                </>
              }
            />
          )}
        </Container>
      </section>
    </>
  );
}
