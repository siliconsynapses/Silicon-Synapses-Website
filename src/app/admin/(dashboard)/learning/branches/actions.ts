"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";
import { withAuthorizedAction } from "@/lib/actions/authorized";
import {
  actionError,
  actionSuccess,
  zodFieldErrors,
  type ActionState,
} from "@/lib/actions/state";
import { uniqueConstraintField, isRecordNotFound } from "@/lib/actions/db-errors";
import { branchSchema } from "@/lib/validations/admin";

/**
 * Branch CRUD (ADMIN). A branch groups subjects by semester. Deleting a branch
 * cascades to its subjects and their resources (schema onDelete: Cascade), so
 * the UI warns before deletion.
 */

function revalidateBranches() {
  revalidatePath("/admin/learning/branches");
  revalidatePath("/admin/learning");
  revalidatePath("/admin");
  revalidatePath("/learning");
}

export async function createBranch(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = branchSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    try {
      const created = await db.branch.create({
        data: {
          slug,
          name: data.name,
          order: data.order,
          isActive: data.isActive,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "branch.create",
        entity: "Branch",
        entityId: created.id,
        metadata: { slug: created.slug },
      });
    } catch (error) {
      if (uniqueConstraintField(error)) {
        return actionError("A branch with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateBranches();
    return actionSuccess("Branch created.");
  });
}

export async function updateBranch(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = branchSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    try {
      const updated = await db.branch.update({
        where: { id },
        data: {
          slug,
          name: data.name,
          order: data.order,
          isActive: data.isActive,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "branch.update",
        entity: "Branch",
        entityId: updated.id,
        metadata: { slug: updated.slug },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That branch no longer exists.");
      }
      if (uniqueConstraintField(error)) {
        return actionError("A branch with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateBranches();
    return actionSuccess("Branch updated.");
  });
}

export async function deleteBranch(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      const deleted = await db.branch.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "branch.delete",
        entity: "Branch",
        entityId: id,
        metadata: { slug: deleted.slug },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That branch no longer exists.");
      }
      throw error;
    }
    revalidateBranches();
    return actionSuccess("Branch deleted.");
  });
}
