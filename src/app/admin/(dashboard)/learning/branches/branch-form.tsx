"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import { TextField, CheckboxField } from "@/app/admin/_components/form-fields";

/** Branch create/edit form (name, slug, order, active). */

export type BranchFormValues = {
  name?: string;
  slug?: string;
  order?: number;
  isActive?: boolean;
};

export function BranchForm({
  action,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  defaultValues?: BranchFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create branch" : "Save changes"}
      redirectOnSuccess="/admin/learning/branches"
      footer={
        <Link
          href="/admin/learning/branches"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          Cancel
        </Link>
      }
    >
      {(state) => (
        <>
          <TextField
            label="Name"
            name="name"
            required
            defaultValue={v.name}
            placeholder="Electronics & Communication"
            error={state.errors?.name}
          />
          <TextField
            label="Slug"
            name="slug"
            defaultValue={v.slug}
            placeholder="ece (auto from name if blank)"
            hint="Lowercase, hyphenated. Leave blank to auto-generate."
            error={state.errors?.slug}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Order"
              name="order"
              type="number"
              defaultValue={v.order ?? 0}
              hint="Lower numbers appear first."
              error={state.errors?.order}
            />
            <div className="flex items-end">
              <div className="w-full">
                <CheckboxField
                  label="Active"
                  name="isActive"
                  hint="Visible on the public learning hub."
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
