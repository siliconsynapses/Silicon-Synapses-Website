import "server-only";
import { randomBytes } from "node:crypto";

/**
 * Opaque, high-entropy pass token — the ONLY identifier placed in a pass URL or
 * QR code (never a participant's name/email/phone). ~144 bits of entropy,
 * URL-safe (base64url). Overrides the schema's cuid() default at creation so the
 * token is unguessable and safe to expose in a capability URL.
 */
export function newPassToken(): string {
  return randomBytes(18).toString("base64url");
}
