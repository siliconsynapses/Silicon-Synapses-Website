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
import { teamMemberSchema } from "@/lib/validations/admin";
import { saveUpload, deleteUpload, UploadError } from "@/lib/uploads";
import { IMAGE_EXTS } from "@/lib/upload-constants";

/**
 * Team member CRUD. The team roster shapes the public "About / Team" section,
 * so mutations require ADMIN. Every action re-verifies authorization
 * server-side and writes an audit entry. A photo may be uploaded (saveUpload)
 * or supplied as a URL.
 */

function revalidateTeam() {
  revalidatePath("/admin/team");
  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/about");
}

export async function createTeamMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    // Optional uploaded photo — takes precedence over a typed URL.
    let photoUrl = data.photoUrl ?? null;
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      try {
        const saved = await saveUpload(photo, { prefix: "team", allow: IMAGE_EXTS });
        photoUrl = saved.url;
      } catch (error) {
        if (error instanceof UploadError) return actionError(error.message);
        throw error;
      }
    }

    const created = await db.teamMember.create({
      data: {
        name: data.name,
        role: data.role,
        photoUrl,
        bio: data.bio ?? null,
        email: data.email ?? null,
        linkedinUrl: data.linkedinUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        departmentId: data.departmentId ?? null,
        order: data.order,
        isActive: data.isActive,
      },
    });
    await logAudit({
      actorId: actor.id,
      action: "team.create",
      entity: "TeamMember",
      entityId: created.id,
      metadata: { name: created.name, role: created.role },
    });

    revalidateTeam();
    return actionSuccess("Team member added.");
  });
}

export async function updateTeamMember(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    const existing = await db.teamMember.findUnique({
      where: { id },
      select: { photoUrl: true },
    });
    if (!existing) {
      return actionError("That team member no longer exists.");
    }

    // A newly uploaded photo wins over the typed URL; "remove" clears it.
    let photoUrl = data.photoUrl ?? null;
    const removePhoto = formData.get("removePhoto") === "true";
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      try {
        const saved = await saveUpload(photo, { prefix: "team", allow: IMAGE_EXTS });
        await deleteUpload(existing.photoUrl);
        photoUrl = saved.url;
      } catch (error) {
        if (error instanceof UploadError) return actionError(error.message);
        throw error;
      }
    } else if (removePhoto) {
      await deleteUpload(existing.photoUrl);
      photoUrl = null;
    }

    try {
      const updated = await db.teamMember.update({
        where: { id },
        data: {
          name: data.name,
          role: data.role,
          photoUrl,
          bio: data.bio ?? null,
          email: data.email ?? null,
          linkedinUrl: data.linkedinUrl ?? null,
          githubUrl: data.githubUrl ?? null,
          departmentId: data.departmentId ?? null,
          order: data.order,
          isActive: data.isActive,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "team.update",
        entity: "TeamMember",
        entityId: updated.id,
        metadata: { name: updated.name },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That team member no longer exists.");
      }
      throw error;
    }

    revalidateTeam();
    return actionSuccess("Team member updated.");
  });
}

export async function deleteTeamMember(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      const deleted = await db.teamMember.delete({ where: { id } });
      await deleteUpload(deleted.photoUrl);
      await logAudit({
        actorId: actor.id,
        action: "team.delete",
        entity: "TeamMember",
        entityId: id,
        metadata: { name: deleted.name },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That team member no longer exists.");
      }
      throw error;
    }
    revalidateTeam();
    return actionSuccess("Team member removed.");
  });
}
