import Link from "next/link";
import { GitBranch, BookOpen, FolderTree, FileText, ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { getLearningStats, DB_UNAVAILABLE } from "./data";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    key: "branches" as const,
    href: "/admin/learning/branches",
    title: "Branches",
    description: "Engineering branches (ECE, EEE, …). Each holds semesters of subjects.",
    icon: GitBranch,
  },
  {
    key: "subjects" as const,
    href: "/admin/learning/subjects",
    title: "Subjects",
    description: "Subjects within a branch and semester (1–8).",
    icon: BookOpen,
  },
  {
    key: "categories" as const,
    href: "/admin/learning/categories",
    title: "Categories",
    description: "Reusable buckets — Notes, PYQs, Reference Books, Video Lectures.",
    icon: FolderTree,
  },
  {
    key: "resources" as const,
    href: "/admin/learning/resources",
    title: "Resources",
    description: "The actual materials, filed under a subject and a category.",
    icon: FileText,
  },
];

export default async function LearningHubPage() {
  await requirePage("ADMIN");
  const stats = await getLearningStats();
  const counts = stats === DB_UNAVAILABLE ? null : stats;

  return (
    <div>
      <AdminPageHeader
        title="Learning hub"
        description="Manage the resource library: Branch → Semester → Subject → Category → Resource."
      />

      {stats === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const count = counts ? counts[s.key] : 0;
            return (
              <Link
                key={s.key}
                href={s.href}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-surface/40 p-5 transition-colors hover:border-accent/30 hover:bg-white/[0.03]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">{s.title}</span>
                    <span className="text-sm tabular-nums text-slate-400">{count}</span>
                  </span>
                  <span className="mt-1 block text-sm text-slate-400">
                    {s.description}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="mt-1 shrink-0 text-slate-600 transition-colors group-hover:text-accent"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
