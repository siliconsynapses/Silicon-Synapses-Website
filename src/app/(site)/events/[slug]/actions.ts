"use server";

import { db } from "@/lib/db";
import { hashIp } from "@/lib/request-ip";
import { logAudit } from "@/lib/audit";
import { newPassToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/site-url";
import { formatDateTime } from "@/lib/datetime";
import { getSiteContent } from "@/lib/data/site-settings";
import { isEmailConfigured, sendRegistrationConfirmation } from "@/lib/email";
import { uniqueConstraintField } from "@/lib/actions/db-errors";
import { registrationSchema } from "@/lib/validations/registration";

export type RegisterState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<
    Record<"participantName" | "participantEmail" | "participantPhone", string>
  >;
  pass?: {
    url: string;
    status: "CONFIRMED" | "WAITLISTED";
    alreadyRegistered: boolean;
  };
};

// Per-IP backstop against automated floods. Deliberately generous: many
// students share one campus NAT IP, so a popular event launch must not trip it.
// The honeypot + unique (eventId, email) constraint are the primary defenses;
// this only stops a script hammering fake registrations. Safe to tune.
const REG_RATE_MAX = 20;
const REG_RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * Public event registration. Anti-abuse: a honeypot field, the DB's unique
 * (eventId, email) constraint, and a generous per-IP rate limit (a hashed IP
 * only — never the raw address). The event's open/full state is ALWAYS
 * re-checked server-side; the client's view is never trusted. Issues an opaque
 * pass token — participant contact details never leave the DB.
 */
export async function registerForEvent(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Honeypot — bots fill this hidden field. Pretend success, store nothing.
  const honeypot = (formData.get("company") ?? "").toString();
  if (honeypot.trim().length > 0) {
    return { status: "success", message: "Thanks! You're registered." };
  }

  const eventSlug = (formData.get("eventSlug") ?? "").toString();

  const parsed = registrationSchema.safeParse({
    participantName: (formData.get("participantName") ?? "").toString(),
    participantEmail: (formData.get("participantEmail") ?? "").toString(),
    participantPhone: (formData.get("participantPhone") ?? "").toString(),
  });
  if (!parsed.success) {
    const errors: NonNullable<RegisterState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in errors)) {
        errors[key as keyof typeof errors] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors,
    };
  }

  // Hashed source IP (never stored raw) — used for the per-IP rate limit below
  // and persisted for abuse triage. Null in local dev without proxy headers.
  const ipHash = await hashIp();

  let eventId: string | null = null;
  try {
    const event = await db.event.findUnique({
      where: { slug: eventSlug },
      select: {
        id: true,
        title: true,
        venue: true,
        status: true,
        startsAt: true,
        endsAt: true,
        capacity: true,
        registrationOpensAt: true,
        registrationClosesAt: true,
      },
    });

    // Server-side gate — the source of truth for whether registration is open.
    if (!event || event.status !== "PUBLISHED") {
      return {
        status: "error",
        message: "Registration isn't open for this event.",
      };
    }
    eventId = event.id;

    const now = Date.now();
    const ended = (event.endsAt ?? event.startsAt).getTime() < now;
    const notYetOpen =
      event.registrationOpensAt != null &&
      now < event.registrationOpensAt.getTime();
    const closed =
      event.registrationClosesAt != null &&
      now > event.registrationClosesAt.getTime();
    if (ended || notYetOpen || closed) {
      return {
        status: "error",
        message: "Registration isn't open for this event.",
      };
    }

    // Generous per-IP flood backstop (hashed IP; skipped when IP is unknown).
    if (ipHash) {
      const since = new Date(Date.now() - REG_RATE_WINDOW_MS);
      const recent = await db.registration.count({
        where: { ipHash, createdAt: { gte: since } },
      });
      if (recent >= REG_RATE_MAX) {
        return {
          status: "error",
          message:
            "Too many registrations from this network recently. Please try again in a few minutes.",
        };
      }
    }

    // Capacity → waitlist when full. Best-effort under concurrency; the unique
    // (eventId, email) constraint still prevents duplicate rows.
    let regStatus: "CONFIRMED" | "WAITLISTED" = "CONFIRMED";
    if (event.capacity != null) {
      const confirmed = await db.registration.count({
        where: { eventId: event.id, status: "CONFIRMED" },
      });
      if (confirmed >= event.capacity) regStatus = "WAITLISTED";
    }

    const created = await db.registration.create({
      data: {
        eventId: event.id,
        participantName: parsed.data.participantName,
        participantEmail: parsed.data.participantEmail,
        participantPhone: parsed.data.participantPhone ?? null,
        status: regStatus,
        passToken: newPassToken(),
        ipHash,
      },
      select: { id: true, passToken: true, status: true },
    });

    // Audit without PII — only ids/status, never name/email/phone.
    await logAudit({
      action: "registration.create",
      entity: "Registration",
      entityId: created.id,
      metadata: { eventId: event.id, status: created.status },
    });

    // Best-effort confirmation email. A no-op until Resend is configured, and it
    // must NEVER fail the registration — the row is already committed above, so
    // any email error is swallowed rather than bubbling into the catch below
    // (which would wrongly report failure to a user who IS registered).
    if (isEmailConfigured()) {
      try {
        const [content, passUrl] = await Promise.all([
          getSiteContent(),
          absoluteUrl(`/pass/${created.passToken}`),
        ]);
        await sendRegistrationConfirmation({
          to: parsed.data.participantEmail,
          participantName: parsed.data.participantName,
          eventTitle: event.title,
          eventWhen: formatDateTime(event.startsAt),
          eventVenue: event.venue,
          passUrl,
          status: regStatus,
          replyTo: content.email,
        });
      } catch {
        // Registration already succeeded; email is best-effort.
      }
    }

    return {
      status: "success",
      pass: {
        url: `/pass/${created.passToken}`,
        status: regStatus,
        alreadyRegistered: false,
      },
    };
  } catch (error) {
    // Already registered with this email for this event → hand back the pass.
    if (uniqueConstraintField(error) && eventId) {
      const existing = await db.registration
        .findUnique({
          where: {
            eventId_participantEmail: {
              eventId,
              participantEmail: parsed.data.participantEmail,
            },
          },
          select: { passToken: true, status: true },
        })
        .catch(() => null);
      if (existing && existing.status !== "CANCELLED") {
        return {
          status: "success",
          message: "You're already registered for this event.",
          pass: {
            url: `/pass/${existing.passToken}`,
            status: existing.status === "WAITLISTED" ? "WAITLISTED" : "CONFIRMED",
            alreadyRegistered: true,
          },
        };
      }
      return {
        status: "error",
        message: "You're already registered for this event with that email.",
      };
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[register] failed:",
        error instanceof Error ? error.message : error,
      );
    }
    return {
      status: "error",
      message:
        "We couldn't complete your registration right now. Please try again.",
    };
  }
}
