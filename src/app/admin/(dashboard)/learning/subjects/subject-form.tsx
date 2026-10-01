"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import {
  TextField,
  SelectField,
  CheckboxField,
} from "@/app/admin/_components/form-fields";
import type { Option } from "@/app/admin/(dashboard)/learning/data";

/** Subject create/edit form. Requires at least one branch to exist. */

export type SubjectFormValues = {
  branchId?: string;
  name?: string;
  code?: string | null;
  semester?: number;
  order?: number;
  isActive?: boolean;
};

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function SubjectForm({
  action,
  branches,
  defaultValues,
  mode,
}: {
  action: AdminFormAction;
  branches: Option[];
  defaultValues?: SubjectFormValues;
  mode: "create" | "edit";
}) {
  const v = defaultValues ?? {};

  if (branches.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/40 p-6 text-sm text-slate-300">
        You need at least one branch before adding subjects.{" "}
        <Link
          href="/admin/learning/branches/new"
          className="text-accent transition-colors hover:text-accent/80"
        >
          Create a branch first →
        </Link>
      </div>
    );
  }

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create subject" : "Save changes"}
      redirectOnSuccess="/admin/learning/subjects"
      footer={
        <Link
          href="/admin/learning/subjects"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          Cancel
        </Link>
      }
    >
      {(state) => (
        <>
          <SelectField
            label="Branch"
            name="branchId"
            required
            defaultValue={v.branchId}
            error={state.errors?.branchId}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </SelectField>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Name"
              name="name"
              required
              defaultValue={v.name}
              placeholder="Signals & Systems"
              error={state.errors?.name}
            />
            <TextField
              label="Course code"
              name="code"
              defaultValue={v.code ?? undefined}
              placeholder="EC301 (optional)"
              error={state.errors?.code}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Semester"
              name="semester"
              required
              defaultValue={String(v.semester ?? 1)}
              error={state.errors?.semester}
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Order"
              name="order"
              type="number"
              defaultValue={v.order ?? 0}
              hint="Lower numbers appear first."
              error={state.errors?.order}
            />
          </div>

          <CheckboxField
            label="Active"
            name="isActive"
            hint="Visible on the public learning hub."
            defaultChecked={v.isActive ?? true}
          />
        </>
      )}
    </AdminForm>
  );
}
