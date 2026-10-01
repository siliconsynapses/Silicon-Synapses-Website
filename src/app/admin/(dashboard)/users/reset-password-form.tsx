"use client";

import { AdminForm, type AdminFormAction } from "@/app/admin/_components/admin-form";
import { TextField } from "@/app/admin/_components/form-fields";

/**
 * Password reset form. Sets a new password for a user; the field is never
 * pre-filled and the value is hashed server-side before storage.
 */
export function ResetPasswordForm({ action }: { action: AdminFormAction }) {
  return (
    <AdminForm
      action={action}
      submitLabel="Reset password"
      successMessage="Password reset."
    >
      {(state) => (
        <TextField
          label="New password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Share the new password with the user securely."
          error={state.errors?.password}
        />
      )}
    </AdminForm>
  );
}
