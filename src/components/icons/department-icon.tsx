import {
  BrainCircuit,
  CircuitBoard,
  Code2,
  Cpu,
  Terminal,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps a department's stored icon name (a string in config / DB) to a lucide
 * icon. Server-safe — usable directly inside server components. Unknown names
 * fall back to a neutral chip icon.
 */
const ICONS: Record<string, LucideIcon> = {
  BrainCircuit,
  Cpu,
  Code2,
  Terminal,
  CircuitBoard,
};

export function DepartmentIcon({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Cpu;
  return <Icon size={size} className={className} aria-hidden />;
}
