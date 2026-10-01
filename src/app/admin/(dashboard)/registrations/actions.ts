"use server";

import { revalidatePath } from "next/cache";
import type { RegistrationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { withAuthorizedAction } from "@/lib/actions/authorized";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/actions/state";
import { isRecordNotFound } from "@/lib/actions/db-errors";

/**
 * Registration management mutations. Toggling check-in and changing status are
 * STAFF operations; deleting a registration is ADMIN. Every action re-verifies
 * authorization server-side (via withAuthorizedAction) and writes a PII-free
 * audit entry — never name/email/phone, only ids and status.
 */

function revalidateRegistrations(eventId?: string) {
  revalidatePath("/admin/registrations");
  if (eventId) revalidatePath(`/admin/registrations/${eventId}`);
  revalidatePath("/admin/check-in");
  revalidatePath("/admin");
}

export async function setRegistrationCheckIn(
  id: string,
  checkedIn: boolean,
): Promise<ActionState> {
  return withAuthorizedAction("STAFF", async (actor) => {
    try {
      const updated = await db.registration.update({
        where: { id },
        data: checkedIn
          ? { checkedInAt: new Date(), checkedInById: actor.id }
          : { checkedInAt: null, checkedInById: null },
        select: { id: true, eventId: true },
      });
      await logAudit({
        actorId: actor.id,
        action: checkedIn ? "registration.checkin" : "registration.checkin.undo",
        entity: "Registration",
        entityId: updated.id,
        metadata: { eventId: updated.eventId },
      });
      revalidateRegistrations(updated.eventId);
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That registration no longer exists.");
      }
      throw error;
    }
    return actionSuccess(checkedIn ? "Checked in." : "Check-in undone.");
  });
}

export async function setRegistrationStatus(
  id: string,
  status: RegistrationStatus,
): Promise<ActionState> {
  return withAuthorizedAction("STAFF", async (actor) => {
    try {
      const updated = await db.registration.update({
        where: { id },
        data: { status },
        select: { id: true, eventId: true },
      });
      await logAudit({
        actorId: actor.id,
        action: "registration.status",
        entity: "Registration",
        entityId: updated.id,
        metadata: { eventId: updated.eventId, status },
      });
      revalidateRegistrations(updated.eventId);
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That registration no longer exists.");
      }
      throw error;
    }
    return actionSuccess("Registration updated.");
  });
}

export async function deleteRegistration(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      const deleted = await db.registration.delete({
        where: { id },
        select: { id: true, eventId: true },
      });
      await logAudit({
        actorId: actor.id,
        action: "registration.delete",
        entity: "Registration",
        entityId: deleted.id,
        metadata: { eventId: deleted.eventId },
      });
      revalidateRegistrations(deleted.eventId);
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That registration no longer exists.");
      }
      throw error;
    }
    return actionSuccess("Registration deleted.");
  });
}
