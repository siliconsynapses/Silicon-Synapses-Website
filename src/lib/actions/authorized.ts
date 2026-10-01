import type { Role } from "@prisma/client";
import { requireRole, AuthorizationError } from "@/lib/rbac";
import {
  actionError,
  type ActionState,
} from "@/lib/actions/state";

/**
 * Wrap a privileged admin mutation with a mandatory server-side authorization
 * check. EVERY admin write must go through this — authorization is never
 * enforced by hiding UI. The wrapped function receives the authenticated
 * session's user (guaranteed to meet `minRole`).
 *
 * AuthorizationError is converted to a friendly ActionState instead of throwing,
 * so form components can render it. Unexpected errors are logged (dev) and
 * surfaced as a generic message — internal details are never leaked to the client.
 */
export async function withAuthorizedAction(
  minRole: Role,
  run: (actor: {
    id: string;
    role: Role;
    email?: string | null;
    name?: string | null;
  }) => Promise<ActionState>,
): Promise<ActionState> {
  try {
    const session = await requireRole(minRole);
    return await run({
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      name: session.user.name,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return actionError(
        error.kind === "UNAUTHENTICATED"
          ? "Your session has expired. Please sign in again."
          : "You don't have permission to perform this action.",
      );
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin-action] unexpected error:", error);
    }
    return actionError("Something went wrong. Please try again.");
  }
}
