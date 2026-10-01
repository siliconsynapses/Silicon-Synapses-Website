import { ScrollText } from "lucide-react";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import {
  DbUnavailableNotice,
  AdminEmptyState,
} from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/datetime";
import { listAuditLog, AUDIT_PAGE_SIZE, DB_UNAVAILABLE } from "./data";

export const dynamic = "force-dynamic";

/** Tone by action verb (last dot-segment) — create/update/delete/etc. */
function actionTone(action: string): "green" | "amber" | "red" | "cyan" | "slate" {
  const verb = action.split(".").pop() ?? "";
  if (verb.includes("create")) return "green";
  if (verb.includes("delete")) return "red";
  if (verb.includes("update") || verb.includes("reset")) return "amber";
  if (verb.includes("publish") || verb.includes("checkin")) return "cyan";
  return "slate";
}

function metadataSummary(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const entries = Object.entries(metadata as Record<string, unknown>);
  if (entries.length === 0) return null;
  return entries
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ");
}

export default async function AuditPage() {
  await requirePage("SUPER_ADMIN");
  const rows = await listAuditLog();

  return (
    <div>
      <AdminPageHeader
        title="Audit log"
        description={`Append-only trail of privileged actions. Showing the most recent ${AUDIT_PAGE_SIZE}.`}
      />

      {rows === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No activity yet"
          description="Privileged actions — publishing, role changes, check-ins — will be recorded here."
          icon={<ScrollText size={22} />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Actor</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Details</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((r) => {
                const summary = metadataSummary(r.metadata);
                return (
                  <tr key={r.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusPill tone={actionTone(r.action)}>{r.action}</StatusPill>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {r.entity}
                        {r.entityId ? ` · ${r.entityId}` : ""}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 md:table-cell">
                      {r.actorName ? (
                        <>
                          <div className="text-slate-200">{r.actorName}</div>
                          <div className="text-xs text-slate-500">{r.actorEmail}</div>
                        </>
                      ) : (
                        <span className="text-slate-500">System / removed</span>
                      )}
                    </td>
                    <td className="hidden max-w-xs px-5 py-3.5 align-top lg:table-cell">
                      {summary ? (
                        <span className="block truncate text-xs text-slate-400" title={summary}>
                          {summary}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-400">
                      {formatDateTime(r.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
