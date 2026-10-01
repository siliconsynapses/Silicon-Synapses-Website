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
import { isRecordNotFound, isForeignKeyConstraint } from "@/lib/actions/db-errors";
import { resourceSchema } from "@/lib/validations/admin";
import { saveUpload, deleteUpload, UploadError } from "@/lib/uploads";
import { RESOURCE_EXTS } from "@/lib/upload-constants";

/**
 * Resource CRUD (ADMIN). A resource is filed under one subject and one category.
 * `url` holds an external link; an uploaded file is stored via saveUpload and
 * referenced by `fileKey` (local disk in dev, R2 in production — see
 * src/lib/uploads). A stale form referencing a deleted subject/category surfaces
 * as a friendly FK error rather than a 500.
 */

function revalidateResources() {
  revalidatePath("/admin/learning/resources");
  revalidatePath("/admin/learning");
  revalidatePath("/admin");
  revalidatePath("/learning");
}

const FK_MESSAGE = "The selected subject or category no longer exists.";

export async function createResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    // Optional uploaded file — takes precedence over an external URL.
    let fileKey: string | null = null;
    let url = data.url ?? null;
    let type = data.type;
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      try {
        const saved = await saveUpload(file, { prefix: "resources", allow: RESOURCE_EXTS });
        fileKey = saved.key;
        url = null;
        if (type === "LINK") type = "FILE";
      } catch (error) {
        if (error instanceof UploadError) return actionError(error.message);
        throw error;
      }
    }

    try {
      const created = await db.resource.create({
        data: {
          title: data.title,
          description: data.description ?? null,
          type,
          url,
          fileKey,
          subjectId: data.subjectId,
          categoryId: data.categoryId,
          isPublished: data.isPublished,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "resource.create",
        entity: "Resource",
        entityId: created.id,
        metadata: { subjectId: created.subjectId, categoryId: created.categoryId },
      });
    } catch (error) {
      if (isForeignKeyConstraint(error)) {
        return actionError(FK_MESSAGE);
      }
      throw error;
    }

    revalidateResources();
    return actionSuccess("Resource created.");
  });
}

export async function updateResource(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    const existing = await db.resource.findUnique({
      where: { id },
      select: { fileKey: true },
    });
    if (!existing) {
      return actionError("That resource no longer exists.");
    }

    // A newly uploaded file wins over the URL; an explicit "remove" clears it.
    let fileKey: string | null = existing.fileKey;
    let url = data.url ?? null;
    let type = data.type;
    const removeFile = formData.get("removeFile") === "true";
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      try {
        const saved = await saveUpload(file, { prefix: "resources", allow: RESOURCE_EXTS });
        await deleteUpload(existing.fileKey);
        fileKey = saved.key;
        url = null;
        if (type === "LINK") type = "FILE";
      } catch (error) {
        if (error instanceof UploadError) return actionError(error.message);
        throw error;
      }
    } else if (removeFile) {
      await deleteUpload(existing.fileKey);
      fileKey = null;
    }

    try {
      const updated = await db.resource.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description ?? null,
          type,
          url,
          fileKey,
          subjectId: data.subjectId,
          categoryId: data.categoryId,
          isPublished: data.isPublished,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "resource.update",
        entity: "Resource",
        entityId: updated.id,
        metadata: { subjectId: updated.subjectId, categoryId: updated.categoryId },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That resource no longer exists.");
      }
      if (isForeignKeyConstraint(error)) {
        return actionError(FK_MESSAGE);
      }
      throw error;
    }

    revalidateResources();
    return actionSuccess("Resource updated.");
  });
}

export async function deleteResource(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      const existing = await db.resource.findUnique({
        where: { id },
        select: { fileKey: true },
      });
      await db.resource.delete({ where: { id } });
      await deleteUpload(existing?.fileKey);
      await logAudit({
        actorId: actor.id,
        action: "resource.delete",
        entity: "Resource",
        entityId: id,
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That resource no longer exists.");
      }
      throw error;
    }
    revalidateResources();
    return actionSuccess("Resource deleted.");
  });
}
