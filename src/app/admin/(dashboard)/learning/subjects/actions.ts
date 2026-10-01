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
import { uniqueConstraintField, isRecordNotFound } from "@/lib/actions/db-errors";
import { subjectSchema } from "@/lib/validations/admin";

/**
 * Subject CRUD (ADMIN). Subjects are unique per (branch, semester, name).
 * Deleting a subject cascades to its resources (schema onDelete: Cascade).
 */

function revalidateSubjects() {
  revalidatePath("/admin/learning/subjects");
  revalidatePath("/admin/learning");
  revalidatePath("/admin");
  revalidatePath("/learning");
}

const DUPLICATE_MESSAGE =
  "A subject with this name already exists in that branch and semester.";

export async function createSubject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    try {
      const created = await db.subject.create({
        data: {
          branchId: data.branchId,
          name: data.name,
          code: data.code ?? null,
          semester: data.semester,
          order: data.order,
          isActive: data.isActive,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "subject.create",
        entity: "Subject",
        entityId: created.id,
        metadata: { branchId: created.branchId, semester: created.semester },
      });
    } catch (error) {
      if (uniqueConstraintField(error)) {
        return actionError(DUPLICATE_MESSAGE, { name: DUPLICATE_MESSAGE });
      }
      throw error;
    }

    revalidateSubjects();
    return actionSuccess("Subject created.");
  });
}

export async function updateSubject(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    try {
      const updated = await db.subject.update({
        where: { id },
        data: {
          branchId: data.branchId,
          name: data.name,
          code: data.code ?? null,
          semester: data.semester,
          order: data.order,
          isActive: data.isActive,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "subject.update",
        entity: "Subject",
        entityId: updated.id,
        metadata: { branchId: updated.branchId, semester: updated.semester },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That subject no longer exists.");
      }
      if (uniqueConstraintField(error)) {
        return actionError(DUPLICATE_MESSAGE, { name: DUPLICATE_MESSAGE });
      }
      throw error;
    }

    revalidateSubjects();
    return actionSuccess("Subject updated.");
  });
}

export async function deleteSubject(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      await db.subject.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "subject.delete",
        entity: "Subject",
        entityId: id,
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That subject no longer exists.");
      }
      throw error;
    }
    revalidateSubjects();
    return actionSuccess("Subject deleted.");
  });
}
