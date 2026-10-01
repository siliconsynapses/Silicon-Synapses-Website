import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  QrCode,
  Boxes,
  Users,
  GraduationCap,
  BookOpen,
  Inbox,
  ShieldCheck,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  QrCode,
  Boxes,
  Users,
  GraduationCap,
  BookOpen,
  Inbox,
  ShieldCheck,
  ScrollText,
  Settings,
};

export function AdminNavIcon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon size={size} className={className} aria-hidden />;
}
