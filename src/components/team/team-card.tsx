import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/social";
import type { TeamMemberView } from "@/lib/data/team";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function TeamCard({ member }: { member: TeamMemberView }) {
  const hasSocials = member.email || member.linkedinUrl || member.githubUrl;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-surface/40 p-6 text-center">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoUrl}
            alt={member.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-lg font-semibold text-accent">
            {initials(member.name)}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-white">
        {member.name}
      </h3>
      <p className="mt-0.5 text-sm text-accent/80">{member.role}</p>
      {member.departmentName ? (
        <p className="mt-0.5 text-xs text-slate-500">{member.departmentName}</p>
      ) : null}
      {member.bio ? (
        <p className="mt-3 line-clamp-3 text-sm text-slate-400">{member.bio}</p>
      ) : null}
      {hasSocials ? (
        <div className="mt-4 flex items-center gap-3">
          {member.email ? (
            <a
              href={`mailto:${member.email}`}
              aria-label={`Email ${member.name}`}
              className="text-slate-400 transition-colors hover:text-accent"
            >
              <Mail size={17} />
            </a>
          ) : null}
          {member.linkedinUrl ? (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="text-slate-400 transition-colors hover:text-accent"
            >
              <LinkedinIcon size={17} />
            </a>
          ) : null}
          {member.githubUrl ? (
            <a
              href={member.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on GitHub`}
              className="text-slate-400 transition-colors hover:text-accent"
            >
              <GithubIcon size={17} />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
