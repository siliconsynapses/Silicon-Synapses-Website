import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { DepartmentIcon } from "@/components/icons/department-icon";
import { getDepartments } from "@/lib/data/departments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Departments",
  description:
    "The specialized domains of Silicon Synapses — from AI/ML and VLSI to embedded systems, competitive programming, and web development.",
};

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <>
      <PageHero
        badge="Our domains"
        title="Departments"
        description="Silicon Synapses is organized into focused domains. Each one runs its own workshops, projects, and events — pick a track and dive in."
      />

      <section className="pb-24">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <Link
                key={d.slug}
                href={`/departments/${d.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/40 p-6 transition-colors hover:border-accent/40"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-linear-to-br ${d.accent} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                    <DepartmentIcon name={d.icon} />
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-slate-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </div>
                <h2 className="relative mt-5 font-display text-lg font-semibold text-white">
                  {d.name}
                </h2>
                <p className="relative mt-1 text-xs font-medium uppercase tracking-wider text-accent/70">
                  {d.tagline}
                </p>
                <p className="relative mt-3 text-sm text-slate-400">
                  {d.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
