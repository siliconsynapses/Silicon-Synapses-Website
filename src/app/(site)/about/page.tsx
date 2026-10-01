import type { Metadata } from "next";
import { Compass, Rocket, Target } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { getSiteContent } from "@/lib/data/site-settings";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Silicon Synapses — the student technology club of the ECE department.",
};

export default async function AboutPage() {
  const content = await getSiteContent();
  return (
    <>
      <PageHero
        badge="Who we are"
        title="About Silicon Synapses"
        description={content.description}
      />

      <section className="pb-8">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4 text-pretty leading-relaxed text-slate-300">
            <p>
              Silicon Synapses is the student technology club of the{" "}
              {content.department}
              {content.hasCollege ? ` at ${content.college}` : ""}. We bring
              together students across domains — from AI/ML and VLSI to embedded
              systems, competitive programming, and web development — to learn,
              build, and share.
            </p>
            {content.story ? (
              <p className="whitespace-pre-line text-slate-300">
                {content.story}
              </p>
            ) : (
              <p className="text-slate-400">
                <span className="text-slate-500">[CONTENT REQUIRED]</span> Add the
                club&apos;s real story here: when it was founded, why it started,
                key milestones, and what makes it distinct within the department.
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-12">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-surface/40 p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                <Target size={20} />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-white">
                Our mission
              </h2>
              {content.mission ? (
                <p className="mt-2 whitespace-pre-line text-sm text-slate-300">
                  {content.mission}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  <span className="text-slate-500">[CONTENT REQUIRED]</span> State
                  the club&apos;s mission — the change it exists to create for its
                  members and the department.
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface/40 p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                <Compass size={20} />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-white">
                Our vision
              </h2>
              {content.vision ? (
                <p className="mt-2 whitespace-pre-line text-sm text-slate-300">
                  {content.vision}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  <span className="text-slate-500">[CONTENT REQUIRED]</span>{" "}
                  Describe where the club is headed and what it aspires to build
                  over the coming years.
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {content.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-surface/40 p-6 text-center"
              >
                <p className="font-display text-3xl font-bold text-gradient-accent">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            <span className="text-slate-500">[CONTENT REQUIRED]</span> Replace
            these figures with accurate numbers before launch.
          </p>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-12 pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface/40 p-10 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
            />
            <div className="relative mx-auto max-w-xl">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent mx-auto">
                <Rocket size={20} />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
                Want to get involved?
              </h2>
              <p className="mt-3 text-slate-400">
                Whether you want to join a domain, propose an event, or just say
                hello — we&apos;d love to hear from you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/contact">Get in touch</ButtonLink>
                <ButtonLink href="/departments" variant="secondary">
                  Explore domains
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
