"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BrainCircuit,
  CircuitBoard,
  Code2,
  Cpu,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { departmentsPreview } from "@/config/site";

const iconMap: Record<string, LucideIcon> = {
  BrainCircuit,
  Cpu,
  Code2,
  Terminal,
  CircuitBoard,
};

export function DepartmentsPreview() {
  return (
    <section id="departments" className="relative py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge>Our domains</Badge>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Five domains, one community
          </h2>
          <p className="mt-4 text-slate-400">
            Explore the specialized tracks that make up Silicon Synapses.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departmentsPreview.map((d, i) => {
            const Icon = iconMap[d.icon] ?? Cpu;
            return (
              <motion.div
                key={d.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              >
                <Link
                  href={`/departments/${d.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/40 p-6 transition-colors hover:border-accent/40"
                >
                  <div
                    className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-linear-to-br ${d.accent} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                      <Icon size={22} />
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-slate-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </div>
                  <h3 className="relative mt-5 font-display text-lg font-semibold text-white">
                    {d.name}
                  </h3>
                  <p className="relative mt-1 text-xs uppercase tracking-wider text-accent/70">
                    {d.tagline}
                  </p>
                  <p className="relative mt-3 text-sm text-slate-400">
                    {d.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}

          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.01] p-6 text-center">
            <p className="text-sm text-slate-400">Want the full picture?</p>
            <Link
              href="/departments"
              className="mt-2 inline-flex items-center justify-center gap-1.5 font-display font-semibold text-accent transition-colors hover:text-white"
            >
              View all domains <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
