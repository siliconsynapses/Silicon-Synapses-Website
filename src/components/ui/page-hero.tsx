import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * Standard header for content pages. Sits below the fixed navbar (pt-32) with a
 * subtle grid + accent glow, matching the homepage sections.
 */
export function PageHero({
  badge,
  title,
  description,
  align = "center",
  children,
}: {
  badge?: string;
  title: string;
  description?: ReactNode;
  align?: "center" | "left";
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <section className="relative overflow-hidden pb-10 pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />
      <Container className={cn("relative", centered && "text-center")}>
        {badge ? <Badge>{badge}</Badge> : null}
        <h1
          className={cn(
            "font-display text-4xl font-bold tracking-tight text-white sm:text-5xl",
            badge && "mt-5",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-pretty text-slate-400",
              centered && "mx-auto",
            )}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </section>
  );
}
