/**
 * Client-safe upload constants — NO node/server APIs, so both client forms and
 * the server-side uploader can import them. The extension lists here are the
 * single source of truth; the server (src/lib/uploads.ts) enforces them, and the
 * forms use the derived `accept` strings as a convenience hint only.
 */

/** Image types accepted for photos (team members, etc.). */
export const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

/** Document types accepted for learning resources. */
export const DOC_EXTS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "txt",
  "csv",
  "md",
  "zip",
] as const;

/** Everything a learning resource may be: documents + images. */
export const RESOURCE_EXTS = [...DOC_EXTS, ...IMAGE_EXTS] as const;

export const MAX_UPLOAD_MB = 25;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** `accept` attribute values for <input type="file">. */
export const IMAGE_ACCEPT = IMAGE_EXTS.map((e) => `.${e}`).join(",");
export const RESOURCE_ACCEPT = RESOURCE_EXTS.map((e) => `.${e}`).join(",");
