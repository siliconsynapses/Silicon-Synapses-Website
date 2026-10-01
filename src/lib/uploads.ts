/**
 * Write-side storage abstraction (server-only).
 *
 * The default driver saves to the local `public/uploads/` directory so uploads
 * work immediately in development with zero external setup. This is a DEV
 * solution — a serverless filesystem (Vercel) is ephemeral/read-only — so
 * production swaps this for Cloudflare R2 in Phase 6. Callers only see opaque
 * keys/URLs, so that swap won't touch the forms or actions.
 *
 * The read side (turning a key into a public URL) lives in src/lib/storage.ts.
 */
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-constants";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOADS_ROOT = path.join(PUBLIC_DIR, "uploads");

/** Thrown for user-fixable problems (wrong type, too big); actions surface the message. */
export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

/** Sanitize the original filename's base so the stored name is readable but safe. */
function safeBase(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return cleaned || "file";
}

/**
 * Persist an uploaded file and return its storage key + public URL.
 * Enforces the extension allowlist and size cap server-side — the client
 * `accept` attribute is never trusted. Stored under a random name to prevent
 * collisions and path traversal via the client-supplied filename.
 */
export async function saveUpload(
  file: File,
  opts: { prefix: string; allow: readonly string[] },
): Promise<{ key: string; url: string }> {
  if (!(file instanceof File) || file.size === 0) {
    throw new UploadError("No file was provided.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`File is too large — the maximum is ${MAX_UPLOAD_MB} MB.`);
  }

  const ext = extensionOf(file.name);
  if (!ext || !opts.allow.includes(ext)) {
    throw new UploadError(
      `Unsupported file type${ext ? ` (.${ext})` : ""}. Allowed: ${opts.allow.join(", ")}.`,
    );
  }

  const prefix = opts.prefix.replace(/[^a-z0-9]+/gi, "").toLowerCase() || "misc";
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}-${safeBase(file.name)}.${ext}`;
  const dir = path.join(UPLOADS_ROOT, prefix);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  // Forward-slash key regardless of OS; resolves to itself in publicFileUrl.
  const key = `/uploads/${prefix}/${filename}`;
  return { key, url: key };
}

/**
 * Best-effort delete of a previously stored local upload. Only touches files
 * under public/uploads — external URLs and committed assets (e.g. /team/*) are
 * left alone — and refuses to escape that directory.
 */
export async function deleteUpload(keyOrUrl: string | null | undefined): Promise<void> {
  if (!keyOrUrl || !keyOrUrl.startsWith("/uploads/")) return;

  const rel = keyOrUrl.replace(/^\/+/, "");
  const target = path.resolve(PUBLIC_DIR, rel);
  if (target !== UPLOADS_ROOT && !target.startsWith(UPLOADS_ROOT + path.sep)) return;

  try {
    await unlink(target);
  } catch {
    // File may already be gone — nothing to do.
  }
}
