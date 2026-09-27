import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-accent text-ink hover:bg-accent-strong shadow-[0_0_24px_-6px_rgba(34,211,238,0.55)] hover:shadow-[0_0_34px_-4px_rgba(34,211,238,0.85)]",
  secondary:
    "border border-white/15 bg-white/[0.03] text-slate-100 hover:border-accent/40 hover:bg-white/[0.06]",
  ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type Common = { variant?: ButtonVariant; size?: ButtonSize };

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={classes(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return <Link className={classes(variant, size, className)} {...props} />;
}
