"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import { TextField } from "@/app/admin/_components/form-fields";

/** Resource category create/edit form (name, slug, order). No active flag. */

export type CategoryFormValues = {
  name?: string;
  slug?: string;
  order?: number;
};

export function CategoryForm({
  action,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  defaultValues?: CategoryFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create category" : "Save changes"}
      redirectOnSuccess="/admin/learning/categories"
      footer={
        <Link
          href="/admin/learning/categories"
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
            placeholder="Previous Year Questions"
            error={state.errors?.name}
          />
          <TextField
            label="Slug"
            name="slug"
            defaultValue={v.slug}
            placeholder="pyqs (auto from name if blank)"
            hint="Lowercase, hyphenated. Leave blank to auto-generate."
            error={state.errors?.slug}
          />
          <TextField
            label="Order"
            name="order"
            type="number"
            defaultValue={v.order ?? 0}
            hint="Lower numbers appear first."
            error={state.errors?.order}
          />
        </>
      )}
    </AdminForm>
  );
}
