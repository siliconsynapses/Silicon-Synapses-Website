"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { clubStats, siteConfig } from "@/config/site";

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
  });

  return (
    <section className="relative flex min-h-[92vh] w-full items-center overflow-hidden">
      {/* Background layer — [ASSET REQUIRED] swap for the JC Bose Block photo. */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#070b16] via-[#05070d] to-ink" />
        <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_38%,black,transparent)]" />
        <div className="absolute -top-[10%] left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
        <div className="absolute -bottom-[20%] right-[6%] h-[420px] w-[420px] rounded-full bg-accent-3/20 blur-[130px]" />
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500">
          Hero background · JC Bose Block photo goes here
        </span>
      </div>

      <Container className="relative flex flex-col items-center pt-24 text-center">
        <motion.div {...rise(0)}>
          <Badge>ECE Department Technology Club</Badge>
        </motion.div>

        <motion.h1
          {...rise(0.06)}
          className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-gradient-accent sm:text-7xl lg:text-8xl"
        >
          SILICON SYNAPSES
        </motion.h1>

        <motion.p
          {...rise(0.12)}
          className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl"
        >
          {siteConfig.tagline}.{" "}
          <span className="text-slate-400">{siteConfig.description}</span>
        </motion.p>

        <motion.div
          {...rise(0.18)}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <ButtonLink href="/departments" size="lg">
            Explore Departments <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink href="/events" size="lg" variant="secondary">
            <CalendarDays size={18} /> Upcoming Events
          </ButtonLink>
        </motion.div>

        <motion.div
          {...rise(0.24)}
          className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {clubStats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
