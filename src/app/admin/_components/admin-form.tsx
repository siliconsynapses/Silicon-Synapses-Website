"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  INITIAL_ACTION_STATE,
  type ActionState,
} from "@/lib/actions/state";

export type AdminFormAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-ink shadow-[0_0_24px_-6px_rgba(34,211,238,0.55)] transition-all hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      {pending ? "Saving…" : label}
    </button>
  );
}

/**
 * Reusable admin form. Wraps a server action with useActionState, renders a
 * top-level success/error banner, and (optionally) navigates on success.
 *
 * The children are typically field components that read `state.errors[name]`.
 * We pass `state` down via render-prop so fields can show inline errors.
 */
export function AdminForm({
  action,
  submitLabel = "Save",
  redirectOnSuccess,
  successMessage,
  children,
  footer,
}: {
  action: AdminFormAction;
  submitLabel?: string;
  redirectOnSuccess?: string;
  successMessage?: string;
  children: (state: ActionState) => ReactNode;
  footer?: ReactNode;
}) {
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success" && redirectOnSuccess) {
      router.push(redirectOnSuccess);
      router.refresh();
    }
  }, [state, redirectOnSuccess, router]);

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      encType="multipart/form-data"
    >
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      ) : null}
      {state.status === "success" && (successMessage || state.message) ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>{successMessage || state.message}</span>
        </div>
      ) : null}

      {children(state)}

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        {footer}
      </div>
    </form>
  );
}
