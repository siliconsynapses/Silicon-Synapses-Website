import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getSiteContent } from "@/lib/data/site-settings";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // Description is club-editable (Site content admin); title/URL stay fixed brand.
  const content = await getSiteContent();
  return {
    title: {
      default: `${siteConfig.name} — ECE Department Club`,
      template: `%s · ${siteConfig.name}`,
    },
    description: content.description,
    metadataBase: new URL(siteConfig.url),
    icons: {
      icon: "/brand/logo.png",
      shortcut: "/brand/logo.png",
      apple: "/brand/logo.png",
    },
  };
}

/**
 * Root layout: HTML shell, fonts, and global styles only. Shared page chrome
 * (navbar/footer) lives in the (site) route group so the admin console can
 * render on a clean canvas.
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-ink font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
