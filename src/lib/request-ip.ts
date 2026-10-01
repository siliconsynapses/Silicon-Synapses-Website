import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * Hash the requester's IP with a secret salt. We store only the hash (never the
 * raw IP) so rate limiting / abuse triage works without holding personal data.
 * Returns null when the IP can't be determined (e.g. local dev without proxy
 * headers) — callers treat a null hash as "skip the IP-based limit".
 *
 * Shared by the contact form and event registration so both rate-limit the same
 * way. The salt falls back to a constant only in dev; in production AUTH_SECRET
 * is always set.
 */
export async function hashIp(): Promise<string | null> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
    if (!ip) return null;
    const salt = process.env.AUTH_SECRET ?? "silicon-synapses";
    return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  } catch {
    return null;
  }
}
