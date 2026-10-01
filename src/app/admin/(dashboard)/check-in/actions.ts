"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireRole, AuthorizationError } from "@/lib/rbac";

/**
 * QR / pass check-in. The scanner (or a pasted pass link) yields the opaque
 * pass token; the server looks the registration up and records a SINGLE
 * check-in. Authorization is verified server-side (STAFF) on every call — the
 * check-in never trusts anything embedded in the QR beyond the opaque token,
 * and re-scanning is idempotent (it reports the existing check-in, no change).
 */

export type CheckInResult = {
  participantName: string;
  eventTitle: string;
  regStatus: "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  checkedInAt: string; // ISO
  alreadyCheckedIn: boolean;
};

export type CheckInState = {
  status: "idle" | "success" | "error";
  message?: string;
  result?: CheckInResult;
};

/** Accept a bare token, a "/pass/<token>" path, or a full pass URL. */
function extractToken(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  try {
    const url = new URL(s);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    const parts = s.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? s;
  }
}

/**
 * Core check-in by pass token. STAFF-guarded. Usable directly (bound to a token
 * from the pass page's staff control) or via `checkInFromForm`.
 */
export async function recordCheckIn(rawToken: string): Promise<CheckInState> {
  try {
    const session = await requireRole("STAFF");
    const actorId = session.user.id;

    const token = extractToken(rawToken);
    if (token.length < 8) {
      return { status: "error", message: "Enter or scan a valid pass." };
    }

    const reg = await db.registration.findUnique({
      where: { passToken: token },
      select: {
        id: true,
        participantName: true,
        status: true,
        checkedInAt: true,
        event: { select: { title: true } },
      },
    });
    if (!reg) {
      return { status: "error", message: "No registration matches that pass." };
    }
    if (reg.status === "CANCELLED") {
      return {
        status: "error",
        message: `${reg.participantName}'s registration was cancelled — not checking in.`,
      };
    }

    // Idempotent: if already checked in, report it without a second write.
    if (reg.checkedInAt) {
      return {
        status: "success",
        message: "Already checked in.",
        result: {
          participantName: reg.participantName,
          eventTitle: reg.event.title,
          regStatus: reg.status,
          checkedInAt: reg.checkedInAt.toISOString(),
          alreadyCheckedIn: true,
        },
      };
    }

    const now = new Date();
    await db.registration.update({
      where: { id: reg.id },
      data: { checkedInAt: now, checkedInById: actorId },
    });
    await logAudit({
      actorId,
      action: "registration.checkin",
      entity: "Registration",
      entityId: reg.id,
      metadata: { status: reg.status },
    });
    revalidatePath("/admin/registrations");
    revalidatePath("/admin/check-in");
    revalidatePath("/admin");

    return {
      status: "success",
      message: "Checked in.",
      result: {
        participantName: reg.participantName,
        eventTitle: reg.event.title,
        regStatus: reg.status,
        checkedInAt: now.toISOString(),
        alreadyCheckedIn: false,
      },
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        status: "error",
        message:
          error.kind === "UNAUTHENTICATED"
            ? "Your session has expired. Please sign in again."
            : "You don't have permission to check people in.",
      };
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[check-in] unexpected error:", error);
    }
    return { status: "error", message: "Check-in failed. Please try again." };
  }
}

/** Form-action wrapper for `useActionState` on the check-in console. */
export async function checkInFromForm(
  _prev: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  return recordCheckIn((formData.get("token") ?? "").toString());
}
