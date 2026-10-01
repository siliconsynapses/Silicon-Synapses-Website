/**
 * Read-side storage abstraction.
 *
 * Turns an object-storage key into a public URL without callers knowing about
 * the provider. Uploads / signed URLs land in Phase 6 (Cloudflare R2); swap the
 * base URL or this implementation without touching the pages that consume it.
 */
const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, "") ?? "";

/**
 * Resolve a public URL for a stored file.
 * - Absolute URLs are returned as-is.
 * - Keys resolve against R2_PUBLIC_BASE_URL when configured.
 * - Returns null when storage is not yet configured (caller shows a fallback).
 */
export function publicFileUrl(fileKey: string | null | undefined): string | null {
  if (!fileKey) return null;
  if (/^https?:\/\//i.test(fileKey)) return fileKey;
  // Root-relative public assets: uploaded files (/uploads/…) and committed
  // static assets (e.g. team photos at /team/…) are served as-is.
  if (fileKey.startsWith("/")) return fileKey;
  if (!base) return null;
  return `${base}/${fileKey.replace(/^\/+/, "")}`;
}

/** True when read-side storage is configured. */
export const isStorageConfigured = base.length > 0;
