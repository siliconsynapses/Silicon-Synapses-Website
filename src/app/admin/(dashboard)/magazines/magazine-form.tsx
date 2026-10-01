"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import {
  TextField,
  TextAreaField,
  CheckboxField,
} from "@/app/admin/_components/form-fields";
import { toDateTimeLocal } from "@/lib/datetime";

/**
 * Magazine (Newton's Apple) create/edit form. Cover image and PDF are external
 * URLs for now — in-app uploads to object storage arrive in Phase 6.
 */

export type MagazineFormValues = {
  title?: string;
  slug?: string;
  issue?: string;
  description?: string | null;
  coverUrl?: string | null;
  fileUrl?: string | null;
  publishedAt?: Date | string | null;
  isPublished?: boolean;
};

export function MagazineForm({
  action,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  defaultValues?: MagazineFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create issue" : "Save changes"}
      redirectOnSuccess="/admin/magazines"
      footer={
        <Link
          href="/admin/magazines"
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
              placeholder="Newton's Apple — Vol. 1"
              error={state.errors?.title}
            />
            <TextField
              label="Issue label"
              name="issue"
              required
              defaultValue={v.issue}
              placeholder="Vol. 1, Issue 2"
              error={state.errors?.issue}
            />
          </div>

          <TextField
            label="Slug"
            name="slug"
            defaultValue={v.slug}
            placeholder="newtons-apple-vol-1 (auto from title if blank)"
            hint="Lowercase, hyphenated. Leave blank to auto-generate."
            error={state.errors?.slug}
          />

          <TextAreaField
            label="Description"
            name="description"
            rows={3}
            defaultValue={v.description ?? undefined}
            placeholder="What's inside this issue (optional)…"
            error={state.errors?.description}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Cover image URL"
              name="coverUrl"
              type="url"
              defaultValue={v.coverUrl ?? undefined}
              placeholder="https://…"
              hint="Optional. Uploads arrive in Phase 6."
              error={state.errors?.coverUrl}
            />
            <TextField
              label="PDF URL"
              name="fileUrl"
              type="url"
              defaultValue={v.fileUrl ?? undefined}
              placeholder="https://…"
              hint="Optional. Link to the issue PDF."
              error={state.errors?.fileUrl}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Publish date"
              name="publishedAt"
              type="date"
              defaultValue={toDateTimeLocal(v.publishedAt).slice(0, 10)}
              hint="Optional."
              error={state.errors?.publishedAt}
            />
            <div className="flex items-end">
              <div className="w-full">
                <CheckboxField
                  label="Published"
                  name="isPublished"
                  hint="Visible in the public archive."
                  defaultChecked={v.isPublished ?? false}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </AdminForm>
  );
}
