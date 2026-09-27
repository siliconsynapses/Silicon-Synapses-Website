import type { Role } from "@prisma/client";
import { auth } from "@/auth";

/**
 * Role hierarchy. Higher rank ⇒ more privilege.
 *   SUPER_ADMIN (3) > ADMIN (2) > STAFF (1)
 */
export const ROLE_RANK: Record<Role, number> = {
  STAFF: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/** True when `role` meets or exceeds the `minimum` required role. */
export function hasRole(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export type AuthzErrorKind = "UNAUTHENTICATED" | "FORBIDDEN";

/** Thrown by server-side guards; callers map it to a redirect or 401/403. */
export class AuthorizationError extends Error {
  constructor(
    public readonly kind: AuthzErrorKind,
    message?: string,
  ) {
    super(message ?? kind);
    this.name = "AuthorizationError";
  }
}

/**
 * Server-side authorization guard for pages, server actions, and route
 * handlers. Every privileged backend operation must call this — access is
 * never enforced by hiding UI alone.
 *
 * @throws AuthorizationError when not signed in or lacking the required role.
 */
export async function requireRole(minimum: Role) {
  const session = await auth();
  if (!session?.user) {
    throw new AuthorizationError("UNAUTHENTICATED");
  }
  if (!hasRole(session.user.role, minimum)) {
    throw new AuthorizationError("FORBIDDEN");
  }
  return session;
}

/** Returns the current user or null (no throw). */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
