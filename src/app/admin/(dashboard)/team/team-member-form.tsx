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
import { IMAGE_ACCEPT, MAX_UPLOAD_MB } from "@/lib/upload-constants";

/**
 * Team member create/edit form. A photo can be uploaded (stored on local disk
 * in dev, R2 in production) or provided as a URL. Department is optional and
 * links the member to a domain.
 */

export type TeamMemberFormValues = {
  name?: string;
  role?: string;
  photoUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  departmentId?: string | null;
  order?: number;
  isActive?: boolean;
};

export function TeamMemberForm({
  action,
  departments,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  departments: { id: string; name: string }[];
  defaultValues?: TeamMemberFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Add member" : "Save changes"}
      redirectOnSuccess="/admin/team"
      footer={
        <Link
          href="/admin/team"
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
              label="Name"
              name="name"
              required
              defaultValue={v.name}
              placeholder="Ada Lovelace"
              error={state.errors?.name}
            />
            <TextField
              label="Role"
              name="role"
              required
              defaultValue={v.role}
              placeholder="President · Lead — VLSI"
              error={state.errors?.role}
            />
          </div>

          <TextAreaField
            label="Bio"
            name="bio"
            rows={3}
            defaultValue={v.bio ?? undefined}
            placeholder="Short bio (optional)…"
            hint="Optional. Shown on the team card."
            error={state.errors?.bio}
          />

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <FileField
              label="Photo"
              name="photo"
              accept={IMAGE_ACCEPT}
              hint={`Upload a photo (JPG, PNG, WEBP — max ${MAX_UPLOAD_MB} MB), or paste a URL below. Uploading overrides the URL.`}
            />
            {mode === "edit" && v.photoUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={v.photoUrl}
                  alt=""
                  className="h-14 w-14 rounded-lg object-cover ring-1 ring-white/10"
                />
                <CheckboxField
                  label="Remove photo"
                  name="removePhoto"
                  hint="Clears the current photo when you save."
                />
              </div>
            ) : null}
            <TextField
              label="Photo URL"
              name="photoUrl"
              type="text"
              defaultValue={v.photoUrl ?? undefined}
              placeholder="https://… or leave blank"
              hint="Optional. Used only if you don't upload a file above."
              error={state.errors?.photoUrl}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Email"
              name="email"
              type="email"
              defaultValue={v.email ?? undefined}
              placeholder="name@example.com"
              hint="Optional."
              error={state.errors?.email}
            />
            <SelectField
              label="Department"
              name="departmentId"
              defaultValue={v.departmentId ?? ""}
              hint="Optional — the domain this member leads."
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

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="LinkedIn URL"
              name="linkedinUrl"
              type="url"
              defaultValue={v.linkedinUrl ?? undefined}
              placeholder="https://linkedin.com/in/…"
              hint="Optional."
              error={state.errors?.linkedinUrl}
            />
            <TextField
              label="GitHub URL"
              name="githubUrl"
              type="url"
              defaultValue={v.githubUrl ?? undefined}
              placeholder="https://github.com/…"
              hint="Optional."
              error={state.errors?.githubUrl}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Order"
              name="order"
              type="number"
              min={0}
              defaultValue={v.order ?? 0}
              hint="Lower numbers appear first."
              error={state.errors?.order}
            />
            <div className="flex items-end">
              <div className="w-full">
                <CheckboxField
                  label="Active"
                  name="isActive"
                  hint="Visible on the public site."
                  defaultChecked={v.isActive ?? true}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </AdminForm>
  );
}
