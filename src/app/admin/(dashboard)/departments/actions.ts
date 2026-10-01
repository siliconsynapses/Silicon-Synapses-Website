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
import { departmentSchema } from "@/lib/validations/admin";

/**
 * Department CRUD. Departments shape the public site's domains, so mutations
 * require ADMIN. Every action re-verifies authorization server-side and writes
 * an audit-log entry — the UI never grants access on its own.
 */

function revalidateDepartments(slug?: string) {
  revalidatePath("/admin/departments");
  revalidatePath("/departments");
  if (slug) revalidatePath(`/departments/${slug}`);
}

export async function createDepartment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = departmentSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }

    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    try {
      const created = await db.department.create({
        data: {
          slug,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          icon: data.icon,
          accent: data.accent,
          order: data.order,
          isActive: data.isActive,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "department.create",
        entity: "Department",
        entityId: created.id,
        metadata: { slug: created.slug, name: created.name },
      });
    } catch (error) {
      const field = uniqueConstraintField(error);
      if (field) {
        return actionError("A department with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateDepartments(slug);
    return actionSuccess("Department created.");
  });
}

export async function updateDepartment(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = departmentSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }

    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    try {
      const updated = await db.department.update({
        where: { id },
        data: {
          slug,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          icon: data.icon,
          accent: data.accent,
          order: data.order,
          isActive: data.isActive,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "department.update",
        entity: "Department",
        entityId: updated.id,
        metadata: { slug: updated.slug },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That department no longer exists.");
      }
      const field = uniqueConstraintField(error);
      if (field) {
        return actionError("A department with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateDepartments(slug);
    return actionSuccess("Department updated.");
  });
}

export async function deleteDepartment(id: string): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    try {
      const deleted = await db.department.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "department.delete",
        entity: "Department",
        entityId: id,
        metadata: { slug: deleted.slug, name: deleted.name },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That department no longer exists.");
      }
      throw error;
    }
    revalidateDepartments();
    return actionSuccess("Department deleted.");
  });
}
