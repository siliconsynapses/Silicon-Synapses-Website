import "server-only";
import { headers } from "next/headers";

/**
 * Absolute site origin, used where a full URL is required — the pass QR must
 * encode an absolute link the door scanner can open. Prefers NEXT_PUBLIC_SITE_URL
 * (set in production); otherwise derives from the request's forwarded host.
 */
export async function getBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() unavailable in this context — fall through to localhost.
  }
  return "http://localhost:3000";
}

export async function absoluteUrl(path: string): Promise<string> {
  const base = await getBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
