"use server";

import bcrypt from "bcryptjs";
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
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "@/lib/validations/user";

/**
 * User management (SUPER_ADMIN only).
 *
 * SECURITY invariants enforced here (never by hiding UI):
 *  - Passwords are hashed with bcrypt (cost 12) before storage, and the raw
 *    password / resulting hash is NEVER logged or returned.
 *  - An admin cannot lock themselves out: no self-deactivation and no
 *    self-demotion from SUPER_ADMIN.
 *  - The last active SUPER_ADMIN cannot be demoted, deactivated, or deleted —
 *    the system must always retain at least one.
 */

const BCRYPT_COST = 12;

function revalidateUsers() {
  revalidatePath("/admin/users");
}

/** Count active SUPER_ADMINs, optionally excluding one user id. */
async function countOtherActiveSuperAdmins(excludeId: string): Promise<number> {
  return db.user.count({
    where: { role: "SUPER_ADMIN", isActive: true, id: { not: excludeId } },
  });
}

export async function createUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("SUPER_ADMIN", async (actor) => {
    const parsed = createUserSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    // Hash before storage. The raw password never leaves this scope.
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_COST);

    try {
      const created = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          hashedPassword,
          role: data.role,
        },
        select: { id: true, email: true, role: true },
      });
      // Audit records who/what/role — never the password or its hash.
      await logAudit({
        actorId: actor.id,
        action: "user.create",
        entity: "User",
        entityId: created.id,
        metadata: { email: created.email, role: created.role },
      });
    } catch (error) {
      if (uniqueConstraintField(error)) {
        return actionError("A user with this email already exists.", {
          email: "This email is already registered.",
        });
      }
      throw error;
    }

    revalidateUsers();
    return actionSuccess("User created.");
  });
}

export async function updateUser(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("SUPER_ADMIN", async (actor) => {
    const parsed = updateUserSchema.safeParse({
      ...Object.fromEntries(formData),
      id,
    });
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;

    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!target) return actionError("That user no longer exists.");

    const isSelf = actor.id === id;
    const demotingFromSuper =
      target.role === "SUPER_ADMIN" && data.role !== "SUPER_ADMIN";
    const deactivating = target.isActive && !data.isActive;

    // Self-lockout guards.
    if (isSelf && demotingFromSuper) {
      return actionError("You cannot remove your own super-admin role.");
    }
    if (isSelf && deactivating) {
      return actionError("You cannot deactivate your own account.");
    }

    // Last-super-admin guard: block demotion/deactivation of the final one.
    if ((demotingFromSuper || deactivating) && target.role === "SUPER_ADMIN") {
      const others = await countOtherActiveSuperAdmins(id);
      if (others === 0) {
        return actionError(
          "This is the last active super-admin. Promote another user first.",
        );
      }
    }

    try {
      const updated = await db.user.update({
        where: { id },
        data: { name: data.name, role: data.role, isActive: data.isActive },
        select: { id: true, email: true, role: true, isActive: true },
      });
      await logAudit({
        actorId: actor.id,
        action: "user.update",
        entity: "User",
        entityId: updated.id,
        metadata: {
          email: updated.email,
          role: updated.role,
          isActive: updated.isActive,
        },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That user no longer exists.");
      }
      throw error;
    }

    revalidateUsers();
    return actionSuccess("User updated.");
  });
}

export async function resetUserPassword(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("SUPER_ADMIN", async (actor) => {
    const parsed = resetPasswordSchema.safeParse({
      ...Object.fromEntries(formData),
      id,
    });
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, BCRYPT_COST);

    try {
      await db.user.update({
        where: { id },
        data: { hashedPassword },
        select: { id: true },
      });
      // Record only that a reset happened — never the password or hash.
      await logAudit({
        actorId: actor.id,
        action: "user.reset_password",
        entity: "User",
        entityId: id,
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That user no longer exists.");
      }
      throw error;
    }

    revalidateUsers();
    return actionSuccess("Password reset.");
  });
}

export async function deleteUser(id: string): Promise<ActionState> {
  return withAuthorizedAction("SUPER_ADMIN", async (actor) => {
    if (actor.id === id) {
      return actionError("You cannot delete your own account.");
    }

    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true, email: true },
    });
    if (!target) return actionError("That user no longer exists.");

    if (target.role === "SUPER_ADMIN") {
      const others = await countOtherActiveSuperAdmins(id);
      if (others === 0) {
        return actionError(
          "This is the last active super-admin and cannot be deleted.",
        );
      }
    }

    try {
      await db.user.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "user.delete",
        entity: "User",
        entityId: id,
        metadata: { email: target.email, role: target.role },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That user no longer exists.");
      }
      throw error;
    }

    revalidateUsers();
    return actionSuccess("User deleted.");
  });
}
