"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
} from "@/app/admin/_components/form-fields";

/**
 * Department create/edit form. `icon` and `accent` are constrained to
 * known-good presets: the accent is a Tailwind gradient token that must exist
 * in the compiled CSS, and the icon must be one the public site can render.
 */

export const DEPT_ICONS = [
  "BrainCircuit",
  "Cpu",
  "Code2",
  "Terminal",
  "CircuitBoard",
] as const;

export const DEPT_ACCENTS = [
  { label: "Cyan → Blue", value: "from-cyan-400/25 to-blue-500/10" },
  { label: "Violet → Fuchsia", value: "from-violet-400/25 to-fuchsia-500/10" },
  { label: "Emerald → Cyan", value: "from-emerald-400/25 to-cyan-500/10" },
  { label: "Amber → Orange", value: "from-amber-400/25 to-orange-500/10" },
  { label: "Rose → Red", value: "from-rose-400/25 to-red-500/10" },
] as const;

export type DepartmentFormValues = {
  name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  icon?: string;
  accent?: string;
  order?: number;
  isActive?: boolean;
};

export function DepartmentForm({
  action,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  defaultValues?: DepartmentFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create department" : "Save changes"}
      redirectOnSuccess="/admin/departments"
      footer={
        <Link
          href="/admin/departments"
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
              placeholder="AI / ML"
              error={state.errors?.name}
            />
            <TextField
              label="Slug"
              name="slug"
              defaultValue={v.slug}
              placeholder="ai-ml (auto from name if blank)"
              hint="Lowercase, hyphenated. Leave blank to auto-generate."
              error={state.errors?.slug}
            />
          </div>

          <TextField
            label="Tagline"
            name="tagline"
            required
            defaultValue={v.tagline}
            placeholder="Intelligent systems"
            error={state.errors?.tagline}
          />

          <TextAreaField
            label="Description"
            name="description"
            required
            rows={3}
            defaultValue={v.description}
            placeholder="What this domain covers…"
            error={state.errors?.description}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Icon"
              name="icon"
              required
              defaultValue={v.icon ?? "Cpu"}
              hint="Shown on department cards."
              error={state.errors?.icon}
            >
              {DEPT_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Accent gradient"
              name="accent"
              required
              defaultValue={v.accent ?? DEPT_ACCENTS[0].value}
              error={state.errors?.accent}
            >
              {DEPT_ACCENTS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </SelectField>
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
