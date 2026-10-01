"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  FileField,
} from "@/app/admin/_components/form-fields";
import { RESOURCE_TYPES } from "@/lib/validations/admin";
import { RESOURCE_ACCEPT, MAX_UPLOAD_MB } from "@/lib/upload-constants";
import type { Option } from "@/app/admin/(dashboard)/learning/data";

/** Resource create/edit form. Requires at least one subject and one category. */

export type ResourceFormValues = {
  title?: string;
  description?: string | null;
  type?: string;
  url?: string | null;
  fileKey?: string | null;
  subjectId?: string;
  categoryId?: string;
  isPublished?: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  LINK: "Link",
  FILE: "File",
  VIDEO: "Video",
  BOOK: "Book",
  NOTE: "Note",
};

/** Human-readable filename from a stored key/URL (drops directory + query). */
function fileBasename(key: string): string {
  const clean = key.split(/[?#]/)[0];
  const name = clean.slice(clean.lastIndexOf("/") + 1);
  try {
    return decodeURIComponent(name) || key;
  } catch {
    return name || key;
  }
}

export function ResourceForm({
  action,
  subjects,
  categories,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  subjects: Option[];
  categories: Option[];
  defaultValues?: ResourceFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  if (subjects.length === 0 || categories.length === 0) {
    const missing =
      subjects.length === 0 && categories.length === 0
        ? "a subject and a category"
        : subjects.length === 0
          ? "a subject"
          : "a category";
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/40 p-6 text-sm text-slate-300">
        You need at least {missing} before adding resources.
        <div className="mt-3 flex flex-wrap gap-4">
          {subjects.length === 0 ? (
            <Link
              href="/admin/learning/subjects/new"
              className="text-accent transition-colors hover:text-accent/80"
            >
              Create a subject →
            </Link>
          ) : null}
          {categories.length === 0 ? (
            <Link
              href="/admin/learning/categories/new"
              className="text-accent transition-colors hover:text-accent/80"
            >
              Create a category →
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create resource" : "Save changes"}
      redirectOnSuccess="/admin/learning/resources"
      footer={
        <Link
          href="/admin/learning/resources"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          Cancel
        </Link>
      }
    >
      {(state) => (
        <>
          <TextField
            label="Title"
            name="title"
            required
            defaultValue={v.title}
            placeholder="Unit 1 — Notes (PDF)"
            error={state.errors?.title}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Subject"
              name="subjectId"
              required
              defaultValue={v.subjectId}
              error={state.errors?.subjectId}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Category"
              name="categoryId"
              required
              defaultValue={v.categoryId}
              error={state.errors?.categoryId}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Type"
              name="type"
              required
              defaultValue={v.type ?? "LINK"}
              error={state.errors?.type}
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </SelectField>
            <TextField
              label="URL"
              name="url"
              type="url"
              defaultValue={v.url ?? undefined}
              placeholder="https://…"
              hint="External link. Leave blank if you upload a file below."
              error={state.errors?.url}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <FileField
              label="Upload a file"
              name="file"
              accept={RESOURCE_ACCEPT}
              hint={`PDF, PPTX, DOCX, TXT, images and other common types (max ${MAX_UPLOAD_MB} MB). Uploading a file overrides the URL above.`}
            />
            {mode === "edit" && v.fileKey ? (
              <div className="text-xs text-slate-400">
                Current file:{" "}
                <a
                  href={v.fileKey}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent transition-colors hover:text-accent/80"
                >
                  {fileBasename(v.fileKey)}
                </a>
                <div className="mt-3">
                  <CheckboxField
                    label="Remove uploaded file"
                    name="removeFile"
                    hint="Deletes the current file when you save."
                  />
                </div>
              </div>
            ) : null}
          </div>

          <TextAreaField
            label="Description"
            name="description"
            rows={3}
            defaultValue={v.description ?? undefined}
            placeholder="What this resource covers (optional)…"
            error={state.errors?.description}
          />

          <CheckboxField
            label="Published"
            name="isPublished"
            hint="Visible on the public learning hub."
            defaultChecked={v.isPublished ?? true}
          />
        </>
      )}
    </AdminForm>
  );
}
