import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Club brand mark using the real provided logo (public/brand/logo.png,
 * 256×256 transparent PNG). Never AI-generated — this is the club's own logo.
 *
 * `size` is the rendered box in px (the source is square). `withWordmark`
 * appends the "Silicon Synapses" wordmark used in the navbar/footer.
 */
export function BrandLogo({
  size = 36,
  withWordmark = true,
  className,
  priority = false,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.png"
        alt="Silicon Synapses logo"
        width={size}
        height={size}
        priority={priority}
        className="h-auto w-auto object-contain"
        style={{ width: size, height: size }}
      />
      {withWordmark ? (
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Silicon <span className="text-accent">Synapses</span>
        </span>
      ) : null}
    </span>
  );
}
