import type { z } from "zod";

/**
 * Shared result shape for form-backed server actions (used with React's
 * `useActionState`). Kept free of any server-only imports (Prisma, bcrypt, …)
 * because client form components import `INITIAL_ACTION_STATE` / `ActionState`.
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Per-field validation messages, keyed by form field `name`. */
  errors?: Record<string, string>;
};

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" };

export function actionError(
  message: string,
  errors?: Record<string, string>,
): ActionState {
  return { status: "error", message, errors };
}

export function actionSuccess(message?: string): ActionState {
  return { status: "success", message };
}

/** Flatten a ZodError into a `{ field: firstMessage }` map. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}
