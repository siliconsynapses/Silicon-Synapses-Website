import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/layout/logo";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import { departmentsPreview, navItems, siteConfig } from "@/config/site";
import { getSiteContent } from "@/lib/data/site-settings";

export async function Footer() {
  const content = await getSiteContent();

  // Only show social icons that have a real link set in the admin — no dead
  // "#" links. Email is always shown (its mailto href is never empty).
  const socials = [
    { href: content.socials.instagram, icon: InstagramIcon, label: "Instagram" },
    { href: content.socials.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
    { href: content.socials.github, icon: GithubIcon, label: "GitHub" },
    { href: content.socials.youtube, icon: YoutubeIcon, label: "YouTube" },
    { href: `mailto:${content.email}`, icon: Mail, label: "Email" },
  ].filter((s) => s.href.length > 0);

  const location = [content.hasCollege ? content.college : null, content.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="border-t border-white/10 bg-surface/50">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo size={36} />
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              {content.description}
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
              <li>{content.department}</li>
              {location ? (
                <li className="text-slate-400">{location}</li>
              ) : (
                <li className="text-slate-500">
                  [CONTENT REQUIRED] — College name &amp; address
                </li>
              )}
              <li>
                <a
                  href={`mailto:${content.email}`}
                  className="transition-colors hover:text-accent"
                >
                  {content.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} · {content.department}
          </p>
          <p>Built by the Web Development domain · [DEMO CONTENT]</p>
        </div>
      </Container>
    </footer>
  );
}
