import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Admin route group. Kept out of search indexes; the actual authorization is
 * enforced server-side (middleware + requireRole guards), never by hiding UI.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
