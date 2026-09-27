"use client";

import { motion } from "framer-motion";
import { Cpu, GraduationCap, Rocket, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

const pillars = [
  {
    icon: Cpu,
    title: "Hands-on tech",
    text: "Workshops and projects across the ECE and software spectrum.",
  },
  {
    icon: Users,
    title: "Community",
    text: "A student-run network of makers, coders, and researchers.",
  },
  {
    icon: Rocket,
    title: "Innovation",
    text: "From idea to demo — we build, ship, and compete.",
  },
  {
    icon: GraduationCap,
    title: "Learning",
    text: "Curated resources and mentorship for every semester.",
  },
];

export function About() {
  return (
    <section id="about" className="relative py-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge>About the club</Badge>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Where electronics meets <span className="text-accent">innovation</span>
            </h2>
            <p className="mt-5 text-slate-400">
              <span className="text-slate-500">[DEMO CONTENT]</span> Silicon
              Synapses is the official technology club of the Department of
              Electronics &amp; Communication Engineering. We bring together
              students across AI/ML, VLSI, embedded systems, competitive
              programming, and web development to learn, build, and lead.
            </p>
            <p className="mt-4 text-slate-400">
              <span className="text-slate-500">[CONTENT REQUIRED]</span> — replace
              with the club&apos;s real history, mission, and vision once
              provided.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                  <p.icon size={18} />
                </div>
                <h3 className="mt-4 font-display font-semibold text-white">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
