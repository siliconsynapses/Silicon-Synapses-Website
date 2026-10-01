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
import { eventSchema } from "@/lib/validations/admin";

/**
 * Event CRUD. Events drive registration + QR attendance, so mutations require
 * STAFF (matching the nav gate). Every action re-verifies authorization
 * server-side and writes an audit entry — the UI never grants access on its own.
 */

function revalidateEvents(slug?: string) {
  revalidatePath("/admin/events");
  revalidatePath("/admin");
  revalidatePath("/events");
  if (slug) revalidatePath(`/events/${slug}`);
}

export async function createEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("STAFF", async (actor) => {
    const parsed = eventSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.title);

    try {
      const created = await db.event.create({
        data: {
          slug,
          title: data.title,
          summary: data.summary,
          description: data.description,
          bannerUrl: data.bannerUrl ?? null,
          venue: data.venue,
          startsAt: data.startsAt,
          endsAt: data.endsAt ?? null,
          capacity: data.capacity ?? null,
          status: data.status,
          registrationOpensAt: data.registrationOpensAt ?? null,
          registrationClosesAt: data.registrationClosesAt ?? null,
          departmentId: data.departmentId ?? null,
          createdById: actor.id,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "event.create",
        entity: "Event",
        entityId: created.id,
        metadata: { slug: created.slug, title: created.title, status: created.status },
      });
    } catch (error) {
      if (uniqueConstraintField(error)) {
        return actionError("An event with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateEvents(slug);
    return actionSuccess("Event created.");
  });
}

export async function updateEvent(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("STAFF", async (actor) => {
    const parsed = eventSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError("Please fix the errors below.", zodFieldErrors(parsed.error));
    }
    const data = parsed.data;
    const slug = data.slug ?? slugify(data.title);

    try {
      const updated = await db.event.update({
        where: { id },
        data: {
          slug,
          title: data.title,
          summary: data.summary,
          description: data.description,
          bannerUrl: data.bannerUrl ?? null,
          venue: data.venue,
          startsAt: data.startsAt,
          endsAt: data.endsAt ?? null,
          capacity: data.capacity ?? null,
          status: data.status,
          registrationOpensAt: data.registrationOpensAt ?? null,
          registrationClosesAt: data.registrationClosesAt ?? null,
          departmentId: data.departmentId ?? null,
        },
      });
      await logAudit({
        actorId: actor.id,
        action: "event.update",
        entity: "Event",
        entityId: updated.id,
        metadata: { slug: updated.slug, status: updated.status },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That event no longer exists.");
      }
      if (uniqueConstraintField(error)) {
        return actionError("An event with this slug already exists.", {
          slug: "This slug is already in use.",
        });
      }
      throw error;
    }

    revalidateEvents(slug);
    return actionSuccess("Event updated.");
  });
}

export async function deleteEvent(id: string): Promise<ActionState> {
  return withAuthorizedAction("STAFF", async (actor) => {
    try {
      const deleted = await db.event.delete({ where: { id } });
      await logAudit({
        actorId: actor.id,
        action: "event.delete",
        entity: "Event",
        entityId: id,
        metadata: { slug: deleted.slug, title: deleted.title },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return actionError("That event no longer exists.");
      }
      throw error;
    }
    revalidateEvents();
    return actionSuccess("Event deleted.");
  });
}
