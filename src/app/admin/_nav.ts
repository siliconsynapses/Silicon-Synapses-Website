import type { Role } from "@prisma/client";

/**
 * Admin navigation model. `minRole` gates visibility AND is re-checked in each
 * page/action server-side — the nav never grants access on its own.
 */
export type AdminNavItem = {
  label: string;
  href: string;
  icon: string; // lucide icon name, resolved in the sidebar
  minRole: Role;
  /** Match child routes too (e.g. /admin/events/new highlights Events). */
  section: string;
};

export const adminNav: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard", minRole: "STAFF", section: "overview" },
  { label: "Events", href: "/admin/events", icon: "CalendarDays", minRole: "STAFF", section: "events" },
  { label: "Registrations", href: "/admin/registrations", icon: "Ticket", minRole: "STAFF", section: "registrations" },
  { label: "Check-in", href: "/admin/check-in", icon: "QrCode", minRole: "STAFF", section: "check-in" },
  { label: "Departments", href: "/admin/departments", icon: "Boxes", minRole: "ADMIN", section: "departments" },
  { label: "Team", href: "/admin/team", icon: "Users", minRole: "ADMIN", section: "team" },
  { label: "Learning", href: "/admin/learning", icon: "GraduationCap", minRole: "ADMIN", section: "learning" },
  { label: "Newton's Apple", href: "/admin/magazines", icon: "BookOpen", minRole: "ADMIN", section: "magazines" },
  { label: "Site content", href: "/admin/settings", icon: "Settings", minRole: "ADMIN", section: "settings" },
  { label: "Queries", href: "/admin/queries", icon: "Inbox", minRole: "STAFF", section: "queries" },
  { label: "Users", href: "/admin/users", icon: "ShieldCheck", minRole: "SUPER_ADMIN", section: "users" },
  { label: "Audit log", href: "/admin/audit", icon: "ScrollText", minRole: "SUPER_ADMIN", section: "audit" },
];
