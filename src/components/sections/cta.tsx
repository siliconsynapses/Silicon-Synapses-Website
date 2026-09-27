"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function CtaBand() {
  return (
    <section className="relative py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-surface to-ink p-10 text-center sm:p-14"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_50%_60%_at_50%_50%,black,transparent)]"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]"
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Build the future with us
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Join Silicon Synapses, register for events, or reach out with a
              question or idea.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/events" size="lg">
                See events <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="secondary">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
