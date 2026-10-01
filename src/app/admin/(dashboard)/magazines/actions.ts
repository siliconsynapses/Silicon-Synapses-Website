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
import { magazineSchema } from "@/lib/validations/admin";

/**
 * Magazine (Newton's Apple) CRUD. Part of the public archive, so mutations
 * require ADMIN. `fileKey` (an uploaded PDF's storage key) is managed by the
 * Phase 6 upload flow, not here — this form takes an external `fileUrl`.
 */

function revalidateMagazines() {
  revalidatePath("/admin/magazines");
  revalidatePath("/admin");
  revalidatePath("/newtons-apple");
}

export async function createMagazine(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = magazineSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.title);

    try {
      const created = await db.magazine.create({
        data: {
          slug,
          title: data.title,
          issue: data.issue,
          description: data.description ?? null,
          coverUrl: data.coverUrl ?? null,
          fileUrl: data.fileUrl ?? null,
          publishedAt: data.publishedAt ?? null,
          isPublished: data.isPublished,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "magazine.create",
        entity: "Magazine",
        entityId: created.id,
        metadata: { slug: created.slug, issue: created.issue },
      });
    } catch (error) {
      if (uniqueConstraintField(error)) {
        return actionError("A magazine with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateMagazines();
    return actionSuccess("Magazine issue created.");
  });
}

export async function updateMagazine(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = magazineSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.title);

    try {
      const updated = await db.magazine.update({
        where: { id },
        data: {
          slug,
          title: data.title,
          issue: data.issue,
          description: data.description ?? null,
          coverUrl: data.coverUrl ?? null,
          fileUrl: data.fileUrl ?? null,
          publishedAt: data.publishedAt ?? null,
          isPublished: data.isPublished,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "magazine.update",
        entity: "Magazine",
        entityId: updated.id,
        metadata: { slug: updated.slug },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That magazine issue no longer exists.");
      }
      if (uniqueConstraintField(error)) {
        return actionError("A magazine with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateMagazines();
    return actionSuccess("Magazine issue updated.");
  });
}

export async function deleteMagazine(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      const deleted = await db.magazine.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "magazine.delete",
        entity: "Magazine",
        entityId: id,
        metadata: { slug: deleted.slug, issue: deleted.issue },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That magazine issue no longer exists.");
      }
      throw error;
    }
    revalidateMagazines();
    return actionSuccess("Magazine issue deleted.");
  });
}
