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
import {
  uniqueConstraintField,
  isRecordNotFound,
  isForeignKeyConstraint,
} from "@/lib/actions/db-errors";
import { categorySchema } from "@/lib/validations/admin";

/**
 * Resource category CRUD (ADMIN). Categories are global, reusable buckets
 * (Notes, PYQs, …). They use onDelete: Restrict — a category with resources
 * attached cannot be deleted until those resources are moved or removed.
 */

function revalidateCategories() {
  revalidatePath("/admin/learning/categories");
  revalidatePath("/admin/learning");
  revalidatePath("/admin");
  revalidatePath("/learning");
}

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = categorySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    try {
      const created = await db.resourceCategory.create({
        data: { slug, name: data.name, order: data.order },
      });
      await logAudit({
        actorId: actor.id,
        action: "category.create",
        entity: "ResourceCategory",
        entityId: created.id,
        metadata: { slug: created.slug },
      });
    } catch (error) {
      if (uniqueConstraintField(error)) {
        return actionError("A category with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateCategories();
    return actionSuccess("Category created.");
  });
}

export async function updateCategory(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = categorySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    try {
      const updated = await db.resourceCategory.update({
        where: { id },
        data: { slug, name: data.name, order: data.order },
      });
      await logAudit({
        actorId: actor.id,
        action: "category.update",
        entity: "ResourceCategory",
        entityId: updated.id,
        metadata: { slug: updated.slug },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That category no longer exists.");
      }
      if (uniqueConstraintField(error)) {
        return actionError("A category with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateCategories();
    return actionSuccess("Category updated.");
  });
}

export async function deleteCategory(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      const deleted = await db.resourceCategory.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "category.delete",
        entity: "ResourceCategory",
        entityId: id,
        metadata: { slug: deleted.slug },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That category no longer exists.");
      }
      if (isForeignKeyConstraint(error)) {
        return actionError(
          "This category still has resources attached. Move or delete those resources first.",
        );
      }
      throw error;
    }
    revalidateCategories();
    return actionSuccess("Category deleted.");
  });
}
