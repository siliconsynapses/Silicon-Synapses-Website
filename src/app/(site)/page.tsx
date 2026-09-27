import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { DepartmentsPreview } from "@/components/sections/departments-preview";
import { CtaBand } from "@/components/sections/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <DepartmentsPreview />
      <CtaBand />
    </>
  );
}
