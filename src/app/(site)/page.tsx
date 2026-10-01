import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { DepartmentsPreview } from "@/components/sections/departments-preview";
import { CtaBand } from "@/components/sections/cta";
import { getSiteContent } from "@/lib/data/site-settings";

export default async function Home() {
  const content = await getSiteContent();
  return (
    <>
      <Hero content={content} />
      <About content={content} />
      <DepartmentsPreview />
      <CtaBand />
    </>
  );
}
