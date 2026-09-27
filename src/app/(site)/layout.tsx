import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Layout for the public marketing site. Owns the shared chrome (navbar +
 * footer) so that other route groups — e.g. the authenticated admin console —
 * can render without it.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
