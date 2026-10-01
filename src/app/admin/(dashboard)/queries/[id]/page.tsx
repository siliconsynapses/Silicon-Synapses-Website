import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { AdminPageHeader, StatusPill } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { AdminForm } from "@/app/admin/_components/admin-form";
import { SelectField, TextAreaField } from "@/app/admin/_components/form-fields";
import { DeleteButton } from "@/app/admin/_components/delete-button";
import { requirePage } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/datetime";
import { QUERY_STATUSES } from "@/lib/validations/admin";
import { QUERY_TYPE_LABELS } from "@/lib/validations/query";
import {
  getAdminQuery,
  DB_UNAVAILABLE,
} from "@/app/admin/(dashboard)/queries/data";
import {
  updateQuery,
  deleteQuery,
} from "@/app/admin/(dashboard)/queries/actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_TONE = {
  OPEN: "amber",
  IN_PROGRESS: "cyan",
  RESOLVED: "green",
  CLOSED: "slate",
} as const;

const TYPE_TONE = {
  QUERY: "cyan",
  SUGGESTION: "green",
  FEEDBACK: "amber",
} as const;

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-200">{children}</dd>
    </div>
  );
}

export default async function QueryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("STAFF");
  const { id } = await params;
  const query = await getAdminQuery(id);

  if (query === DB_UNAVAILABLE) {
    return (
      <div className="max-w-2xl">
        <AdminPageHeader title="Message" backHref="/admin/queries" backLabel="Messages" />
        <DbUnavailableNotice />
      </div>
    );
  }

  if (!query) notFound();

  const statusKey = query.status as keyof typeof STATUS_TONE;
  const typeKey = query.type as keyof typeof TYPE_TONE;

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title={query.subject}
        backHref="/admin/queries"
        backLabel="Messages"
        actions={
          <DeleteButton
            action={deleteQuery.bind(null, query.id)}
            variant="button"
            label="Delete"
            confirmMessage="Delete this message permanently? This cannot be undone."
            onDeleted="/admin/queries"
          />
        }
      />

      <div className="space-y-6">
        {/* Metadata + original message */}
        <div className="rounded-2xl border border-white/10 bg-surface/40 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusPill tone={TYPE_TONE[typeKey] ?? "slate"}>
              {QUERY_TYPE_LABELS[query.type as keyof typeof QUERY_TYPE_LABELS] ??
                query.type}
            </StatusPill>
            <StatusPill tone={STATUS_TONE[statusKey] ?? "slate"}>
              {STATUS_LABEL[query.status] ?? query.status}
            </StatusPill>
          </div>

          <dl className="space-y-2.5">
            <MetaRow label="From">{query.name}</MetaRow>
            <MetaRow label="Email">
              <a
                href={`mailto:${query.email}`}
                className="inline-flex items-center gap-1.5 text-accent transition-colors hover:text-accent/80"
              >
                <Mail size={14} />
                {query.email}
              </a>
            </MetaRow>
            <MetaRow label="Received">{formatDateTime(query.createdAt)}</MetaRow>
            {query.respondedAt ? (
              <MetaRow label="Responded">
                {formatDateTime(query.respondedAt)}
                {query.respondedBy?.name ? ` · ${query.respondedBy.name}` : ""}
              </MetaRow>
            ) : null}
          </dl>

          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Message
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {query.message}
            </p>
          </div>
        </div>

        {/* Triage / respond */}
        <div className="rounded-2xl border border-white/10 bg-surface/40 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Respond & triage</h2>
          <AdminForm
            action={updateQuery.bind(null, query.id)}
            submitLabel="Save"
            redirectOnSuccess="/admin/queries"
          >
            {(state) => (
              <>
                <SelectField
                  label="Status"
                  name="status"
                  defaultValue={query.status}
                  error={state.errors?.status}
                >
                  {QUERY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s] ?? s}
                    </option>
                  ))}
                </SelectField>

                <TextAreaField
                  label="Response"
                  name="response"
                  rows={5}
                  defaultValue={query.response ?? undefined}
                  placeholder="Write an internal response…"
                  hint="Saved internally for now. Emailing the participant is added in Phase 6."
                  error={state.errors?.response}
                />
              </>
            )}
          </AdminForm>
        </div>
      </div>
    </div>
  );
}
