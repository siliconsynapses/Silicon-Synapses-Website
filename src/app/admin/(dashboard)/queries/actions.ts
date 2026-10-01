"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { withAuthorizedAction } from "@/lib/actions/authorized";
import {
  actionError,
  actionSuccess,
  zodFieldErrors,
  type ActionState,
} from "@/lib/actions/state";
import { isRecordNotFound } from "@/lib/actions/db-errors";
import { queryUpdateSchema } from "@/lib/validations/admin";

/**
 * Query inbox mutations (STAFF). There is no "create" — queries arrive from the
 * public contact form. Staff can triage status and record an internal response.
 *
 * Privacy: the participant's name/email/message are NOT written to the audit log
 * — only the query id and the new status. Emailing the participant their
 * response is a Phase 6 feature (Resend); for now the response is stored only.
 */

function revalidateQueries(id: string) {
  revalidatePath("/admin/queries");
  revalidatePath(`/admin/queries/${id}`);
  revalidatePath("/admin");
}

export async function updateQuery(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("STAFF", async (actor) => {
    const parsed = queryUpdateSchema.safeParse({
      ...Object.fromEntries(formData),
      id,
    });
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const hasResponse = Boolean(data.response);

    try {
      await db.query.update({
        where: { id },
        data: {
          status: data.status,
          response: data.response ?? null,
          // Stamp the responder only when a response is actually recorded;
          // clear it if the response is removed.
          respondedById: hasResponse ? actor.id : null,
          respondedAt: hasResponse ? new Date() : null,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "query.update",
        entity: "Query",
        entityId: id,
        metadata: { status: data.status, responded: hasResponse },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That message no longer exists.");
      }
      throw error;
    }

    revalidateQueries(id);
    return actionSuccess("Message updated.");
  });
}

export async function deleteQuery(id: string): Promise<ActionState> {
  return withAuthorizedAction("STAFF", async (actor) => {
    try {
      await db.query.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "query.delete",
        entity: "Query",
        entityId: id,
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That message no longer exists.");
      }
      throw error;
    }
    revalidatePath("/admin/queries");
    revalidatePath("/admin");
    return actionSuccess("Message deleted.");
  });
}
