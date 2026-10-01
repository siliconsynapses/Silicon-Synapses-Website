"use client";

import Link from "next/link";
import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import {
  TextField,
  SelectField,
  CheckboxField,
} from "@/app/admin/_components/form-fields";
import { ADMIN_ROLES } from "@/lib/validations/user";

/**
 * User create/edit form. On create, email + initial password are required.
 * On edit, email is shown read-only (it's the login identifier) and the
 * password is changed separately via the reset form — never pre-filled.
 */

export type UserFormValues = {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  STAFF: "Staff",
};

const ROLE_HINT =
  "Staff: events, registrations, check-in, messages. Admin: also departments, team, learning, magazines. Super admin: also users and the audit log.";

export function UserForm({
  action,
  defaultValues,
  mode,
  isSelf = false,
}: {
  action: AdminFormAction;
  defaultValues?: UserFormValues;
  mode: "create" | "edit";
  isSelf?: boolean;
}) {
  const v = defaultValues ?? {};

  return (
    <AdminForm
      action={action}
      submitLabel={mode === "create" ? "Create user" : "Save changes"}
      redirectOnSuccess="/admin/users"
      footer={
        <Link
          href="/admin/users"
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
            placeholder="Full name"
            error={state.errors?.name}
          />

          {mode === "create" ? (
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              defaultValue={v.email}
              placeholder="name@example.com"
              hint="Used to sign in. Cannot be changed later."
              error={state.errors?.email}
            />
          ) : (
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-slate-300">Email</span>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-400">
                {v.email}
              </div>
              <p className="text-xs text-slate-500">
                The login email cannot be changed.
              </p>
            </div>
          )}

          {mode === "create" ? (
            <TextField
              label="Initial password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hint="The user can change this later. Share it securely."
              error={state.errors?.password}
            />
          ) : null}

          <SelectField
            label="Role"
            name="role"
            required
            defaultValue={v.role ?? "STAFF"}
            hint={ROLE_HINT}
            error={state.errors?.role}
          >
            {ADMIN_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </option>
            ))}
          </SelectField>

          {mode === "edit" ? (
            <CheckboxField
              label="Active"
              name="isActive"
              hint={
                isSelf
                  ? "You cannot deactivate your own account."
                  : "Inactive users cannot sign in."
              }
              defaultChecked={v.isActive ?? true}
            />
          ) : null}
        </>
      )}
    </AdminForm>
  );
}
