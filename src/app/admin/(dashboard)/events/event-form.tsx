"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/app/admin/_components/form-fields";
import { EVENT_STATUSES } from "@/lib/validations/admin";
import { toDateTimeLocal } from "@/lib/datetime";

/**
 * Event create/edit form. Dates use native datetime-local inputs; values are
 * formatted for the control as IST wall-clock and parsed back as IST on save,
 * independent of the server's timezone (see lib/datetime.ts).
 */

const STATUS_LABELS: Record<(typeof EVENT_STATUSES)[number], string> = {
  DRAFT: "Draft — hidden from the public site",
  PUBLISHED: "Published — visible & open to registration",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export type EventFormValues = {
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  bannerUrl?: string | null;
  venue?: string;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  capacity?: number | null;
  status?: string;
  registrationOpensAt?: Date | string | null;
  registrationClosesAt?: Date | string | null;
  departmentId?: string | null;
};

export function EventForm({
  action,
  departments,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  departments: { id: string; name: string }[];
  defaultValues?: EventFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create event" : "Save changes"}
      redirectOnSuccess="/admin/events"
      footer={
        <Link
          href="/admin/events"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          Cancel
        </Link>
      }
    >
      {(state) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Title"
              name="title"
              required
              defaultValue={v.title}
              placeholder="Hackathon 2026"
              error={state.errors?.title}
            />
            <TextField
              label="Slug"
              name="slug"
              defaultValue={v.slug}
              placeholder="hackathon-2026 (auto from title if blank)"
              hint="Lowercase, hyphenated. Leave blank to auto-generate."
              error={state.errors?.slug}
            />
          </div>

          <TextField
            label="Summary"
            name="summary"
            required
            defaultValue={v.summary}
            placeholder="One-line description shown in listings"
            hint="Max 300 characters."
            error={state.errors?.summary}
          />

          <TextAreaField
            label="Description"
            name="description"
            required
            rows={6}
            defaultValue={v.description}
            placeholder="Full event details, schedule, what to bring…"
            error={state.errors?.description}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Venue"
              name="venue"
              required
              defaultValue={v.venue}
              placeholder="JC Bose Block — Seminar Hall"
              error={state.errors?.venue}
            />
            <TextField
              label="Capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={v.capacity ?? undefined}
              placeholder="Blank = unlimited"
              hint="Maximum registrations allowed."
              error={state.errors?.capacity}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Starts at"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={toDateTimeLocal(v.startsAt)}
              hint="Times are IST (India Standard Time)."
              error={state.errors?.startsAt}
            />
            <TextField
              label="Ends at"
              name="endsAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(v.endsAt)}
              hint="Optional."
              error={state.errors?.endsAt}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Registration opens"
              name="registrationOpensAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(v.registrationOpensAt)}
              hint="Optional. Blank = open immediately."
              error={state.errors?.registrationOpensAt}
            />
            <TextField
              label="Registration closes"
              name="registrationClosesAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(v.registrationClosesAt)}
              hint="Optional. Blank = until the event starts."
              error={state.errors?.registrationClosesAt}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Status"
              name="status"
              required
              defaultValue={v.status ?? "DRAFT"}
              hint="Only Published events appear on the public site."
              error={state.errors?.status}
            >
              {EVENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Department"
              name="departmentId"
              defaultValue={v.departmentId ?? ""}
              hint="Optional — the domain this event belongs to."
              error={state.errors?.departmentId}
            >
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectField>
          </div>

          <TextField
            label="Banner image URL"
            name="bannerUrl"
            type="url"
            defaultValue={v.bannerUrl ?? undefined}
            placeholder="https://…"
            hint="Optional. Paste a direct image URL — in-app uploads arrive in Phase 6."
            error={state.errors?.bannerUrl}
          />
        </>
      )}
    </AdminForm>
  );
}
