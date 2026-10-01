import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { requireRole, AuthorizationError } from "@/lib/rbac";

/**
 * Page-level RBAC guard — defense in depth beyond the sidebar filter and the
 * (dashboard) layout's auth check. Call at the top of any admin page whose data
 * sits above the viewer's baseline role (Users, Audit, and all ADMIN-tier
 * management pages). Never rely on hidden UI alone.
 *
 * Redirects: unauthenticated → /admin/login, insufficient role → /admin.
 */
export async function requirePage(minRole: Role) {
  try {
    return await requireRole(minRole);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect(
        error.kind === "UNAUTHENTICATED" ? "/admin/login" : "/admin",
      );
    }
    throw error;
  }
}
