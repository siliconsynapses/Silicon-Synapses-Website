import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function PagePlaceholder({
  title,
  description,
  phase = "Coming soon",
}: {
  title: string;
  description: string;
  phase?: string;
}) {
  return (
    <section className="relative min-h-[70vh] pb-24 pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_50%_40%_at_50%_20%,black,transparent)]"
      />
      <Container className="relative text-center">
        <Badge>{phase}</Badge>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">{description}</p>
        <div className="mt-8">
          <ButtonLink href="/" variant="secondary">
            Back home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
