import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import {
  departmentsPreview,
  navItems,
  siteConfig,
  socialLinks,
} from "@/config/site";

const socials = [
  { href: socialLinks.instagram, icon: InstagramIcon, label: "Instagram" },
  { href: socialLinks.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
  { href: socialLinks.github, icon: GithubIcon, label: "GitHub" },
  { href: socialLinks.youtube, icon: YoutubeIcon, label: "YouTube" },
  { href: `mailto:${socialLinks.email}`, icon: Mail, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface/50">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-linear-to-br from-accent to-accent-3 text-sm font-bold text-ink">
                SS
              </span>
              <span className="font-display text-lg font-semibold text-white">
                Silicon <span className="text-accent">Synapses</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {navItems.slice(1).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Domains</h3>
            <ul className="mt-4 space-y-2.5">
              {departmentsPreview.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/departments/${d.slug}`}
                    className="text-sm text-slate-400 transition-colors hover:text-accent"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>{siteConfig.department}</li>
              <li className="text-slate-500">
                [CONTENT REQUIRED] — College name &amp; address
              </li>
              <li>
                <a
                  href={`mailto:${socialLinks.email}`}
                  className="transition-colors hover:text-accent"
                >
                  {socialLinks.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Silicon Synapses · {siteConfig.department}
          </p>
          <p>Built by the Web Development domain · [DEMO CONTENT]</p>
        </div>
      </Container>
    </footer>
  );
}
