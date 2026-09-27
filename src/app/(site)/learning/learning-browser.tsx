"use client";

import { useMemo, useState } from "react";
import type { ResourceType } from "@prisma/client";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileText,
  Film,
  Link2,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { LearningBranch, LearningResource } from "@/lib/data/learning";
import { cn } from "@/lib/utils";

const RESOURCE_META: Record<ResourceType, { icon: LucideIcon; label: string }> =
  {
    LINK: { icon: Link2, label: "Link" },
    FILE: { icon: FileText, label: "File" },
    VIDEO: { icon: Film, label: "Video" },
    BOOK: { icon: BookOpen, label: "Book" },
    NOTE: { icon: StickyNote, label: "Notes" },
  };

function groupByCategory(resources: LearningResource[]) {
  const groups = new Map<string, { name: string; items: LearningResource[] }>();
  for (const r of resources) {
    const existing = groups.get(r.categorySlug);
    if (existing) existing.items.push(r);
    else groups.set(r.categorySlug, { name: r.categoryName, items: [r] });
  }
  return [...groups.values()];
}

export function LearningBrowser({ branches }: { branches: LearningBranch[] }) {
  const [branchSlug, setBranchSlug] = useState(branches[0]?.slug ?? "");
  const branch =
    branches.find((b) => b.slug === branchSlug) ?? branches[0] ?? null;

  const semesters = useMemo(() => {
    const set = new Set<number>();
    branch?.subjects.forEach((s) => set.add(s.semester));
    return [...set].sort((a, b) => a - b);
  }, [branch]);

  const [semester, setSemester] = useState<number | null>(null);
  const activeSemester =
    semester != null && semesters.includes(semester)
      ? semester
      : (semesters[0] ?? null);

  const [openSubjects, setOpenSubjects] = useState<ReadonlySet<string>>(
    new Set(),
  );

  function selectBranch(slug: string) {
    setBranchSlug(slug);
    const next = branches.find((b) => b.slug === slug);
    const firstSem = next?.subjects[0]?.semester ?? null;
    setSemester(firstSem);
    setOpenSubjects(new Set());
  }

  function toggleSubject(id: string) {
    setOpenSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!branch) return null;

  const subjects = branch.subjects.filter((s) => s.semester === activeSemester);

  return (
    <div className="space-y-8">
      {/* Branch selector */}
      {branches.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {branches.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => selectBranch(b.slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                b.slug === branch.slug
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:text-white",
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* Semester selector */}
      {semesters.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {semesters.map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => setSemester(sem)}
              className={cn(
                "rounded-lg border px-3.5 py-1.5 text-sm transition-colors",
                sem === activeSemester
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white",
              )}
            >
              Semester {sem}
            </button>
          ))}
        </div>
      ) : null}

      {/* Subjects accordion */}
      {subjects.length > 0 ? (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const isOpen = openSubjects.has(subject.id);
            const groups = groupByCategory(subject.resources);
            return (
              <div
                key={subject.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40"
              >
                <button
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {subject.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {subject.code ? `${subject.code} · ` : ""}
                      {subject.resources.length}{" "}
                      {subject.resources.length === 1
                        ? "resource"
                        : "resources"}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "shrink-0 text-slate-400 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {isOpen ? (
                  <div className="border-t border-white/5 px-5 py-4">
                    {groups.length > 0 ? (
                      <div className="space-y-5">
                        {groups.map((group) => (
                          <div key={group.name}>
                            <p className="text-xs font-medium uppercase tracking-wider text-accent/70">
                              {group.name}
                            </p>
                            <ul className="mt-2 space-y-2">
                              {group.items.map((r) => (
                                <ResourceRow key={r.id} resource={r} />
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No resources published for this subject yet.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.01] px-5 py-10 text-center text-sm text-slate-400">
          No subjects listed for this semester yet.
        </p>
      )}
    </div>
  );
}

function ResourceRow({ resource }: { resource: LearningResource }) {
  const meta = RESOURCE_META[resource.type] ?? RESOURCE_META.LINK;
  const Icon = meta.icon;

  const inner = (
    <>
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-accent">
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-100">
          {resource.title}
          {resource.href ? (
            <ExternalLink
              size={13}
              className="shrink-0 text-slate-500 group-hover:text-accent"
            />
          ) : null}
        </span>
        {resource.description ? (
          <span className="mt-0.5 block text-xs text-slate-400">
            {resource.description}
          </span>
        ) : null}
        {!resource.href ? (
          <span className="mt-0.5 block text-xs text-slate-500">
            [ASSET REQUIRED] File not uploaded yet
          </span>
        ) : null}
      </span>
    </>
  );

  if (resource.href) {
    return (
      <li>
        <a
          href={resource.href}
          target="_blank"
          rel="noreferrer"
          className="group flex gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-white/10 hover:bg-white/[0.02]"
        >
          {inner}
        </a>
      </li>
    );
  }

  return (
    <li className="flex gap-3 px-2 py-2 opacity-80">{inner}</li>
  );
}
