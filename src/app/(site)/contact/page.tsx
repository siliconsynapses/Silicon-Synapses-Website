import type { Metadata } from "next";
import { Mail, MapPin, MessageSquareText } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { socialLinks } from "@/config/site";
import { getSiteContent } from "@/lib/data/site-settings";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Silicon Synapses — ask a question, share a suggestion, or send feedback.",
};

export default async function ContactPage() {
  const content = await getSiteContent();
  const hasRealEmail = content.email !== socialLinks.email;
  const location = [content.hasCollege ? content.college : null, content.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHero
        badge="Get in touch"
        title="Contact us"
        description="Have a question, an idea for an event, or feedback for the team? Send it our way — we read everything."
      />

      <section className="pb-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            {/* Info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-surface/40 p-6">
                <h2 className="font-display text-lg font-semibold text-white">
                  Reach us
                </h2>
                <ul className="mt-5 space-y-5 text-sm">
                  <li className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                      <Mail size={18} />
                    </span>
                    <div>
                      <p className="text-slate-500">Email</p>
                      <a
                        href={`mailto:${content.email}`}
                        className="text-slate-200 transition-colors hover:text-accent"
                      >
                        {content.email}
                      </a>
                      {hasRealEmail ? null : (
                        <p className="mt-0.5 text-xs text-slate-500">
                          [CONTENT REQUIRED] Replace with the club&apos;s real
                          email address.
                        </p>
                      )}
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <p className="text-slate-500">Find us</p>
                      <p className="text-slate-200">{content.department}</p>
                      {location ? (
                        <p className="text-xs text-slate-400">{location}</p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          [CONTENT REQUIRED] College name, room / block &amp;
                          address
                        </p>
                      )}
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-surface/40 p-6">
                <div className="flex items-center gap-2 text-accent">
                  <MessageSquareText size={18} />
                  <h2 className="font-display text-base font-semibold text-white">
                    Response time
                  </h2>
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Messages go straight to the core team. We usually reply within
                  a few days during the semester.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-white/10 bg-surface/40 p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
