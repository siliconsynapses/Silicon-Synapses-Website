"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { querySchema } from "@/lib/validations/query";

type FieldName = "type" | "name" | "email" | "subject" | "message";

export type QueryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<FieldName, string>>;
};

export async function submitQuery(
  _prev: QueryFormState,
  formData: FormData,
): Promise<QueryFormState> {
  // Honeypot: bots fill this hidden field. Pretend success, store nothing.
  const honeypot = (formData.get("company") ?? "").toString();
  if (honeypot.trim().length > 0) {
    return {
      status: "success",
      message: "Thanks! Your message has been received.",
    };
  }

  const raw = {
    type: (formData.get("type") ?? "QUERY").toString(),
    name: (formData.get("name") ?? "").toString(),
    email: (formData.get("email") ?? "").toString(),
    subject: (formData.get("subject") ?? "").toString(),
    message: (formData.get("message") ?? "").toString(),
  };

  // Server-side validation — never trust the client.
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: QueryFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in errors)) {
        errors[key as FieldName] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors,
    };
  }

  const ipHash = await hashIp();

  try {
    // Lightweight rate limit: max 5 submissions / 10 min per hashed IP.
    if (ipHash) {
      const since = new Date(Date.now() - 10 * 60 * 1000);
      const recent = await db.query.count({
        where: { ipHash, createdAt: { gte: since } },
      });
      if (recent >= 5) {
        return {
          status: "error",
          message:
            "You've sent a few messages already. Please try again in a little while.",
        };
      }
    }

    await db.query.create({ data: { ...parsed.data, ipHash } });

    return {
      status: "success",
      message:
        "Thanks! Your message has been received — we'll get back to you soon.",
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[contact] submit failed:",
        error instanceof Error ? error.message : error,
      );
    }
    return {
      status: "error",
      message:
        "We couldn't submit your message right now. Please try again later, or email us directly.",
    };
  }
}

/**
 * Hash the requester IP with a secret salt. We store only the hash (never the
 * raw IP) so basic rate limiting works without holding personal data.
 */
async function hashIp(): Promise<string | null> {
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
