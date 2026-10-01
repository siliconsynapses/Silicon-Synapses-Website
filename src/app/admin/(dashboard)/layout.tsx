import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasRole } from "@/lib/rbac";
import { adminNav } from "../_nav";
import { AdminSidebar } from "../_components/sidebar";

/**
 * Authenticated admin shell. Middleware already blocks anonymous access to
 * /admin/*, but we re-verify here (defense in depth) and use the session role
 * to filter the sidebar. Every page and action inside still runs its own
 * requireRole guard — the filtered nav is a convenience, never the gate.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const role = session.user.role;
  const items = adminNav.filter((item) => hasRole(role, item.minRole));

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <AdminSidebar
        items={items}
        user={{
          name: session.user.name,
          email: session.user.email,
          role,
        }}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
