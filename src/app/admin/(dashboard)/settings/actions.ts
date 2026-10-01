"use server";

import type { Prisma } from "@prisma/client";
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
import { siteSettingsSchema } from "@/lib/validations/site-settings";
import { SITE_SETTINGS_KEY } from "@/lib/data/site-settings";

/**
 * Site content editing (ADMIN). Persists the club-editable copy/contact/socials/
 * stats into the single `SiteSetting` row (key = "site"). Only fields the admin
 * actually filled in are stored; blanks are omitted so the public resolver falls
 * back to the compiled `@/config/site` defaults. Re-verifies ADMIN server-side
 * and writes a PII-free audit entry (which fields changed, not their values).
 */
export async function updateSiteSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withAuthorizedAction("ADMIN", async (actor) => {
    const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return actionError(
        "Please fix the errors below.",
        zodFieldErrors(parsed.error),
      );
    }
    const d = parsed.data;

    // Build the stored JSON incrementally. Use a mutable Record — Prisma's
    // `InputJsonObject` has a readonly index signature, so we'd not be able to
    // assign to it field by field; it's assignable to the column type on write.
    const value: Record<string, Prisma.InputJsonValue> = {};
    if (d.tagline) value.tagline = d.tagline;
    if (d.description) value.description = d.description;
    if (d.college) value.college = d.college;
    if (d.department) value.department = d.department;
    if (d.email) value.email = d.email;
    if (d.address) value.address = d.address;
    if (d.instagram) value.instagram = d.instagram;
    if (d.linkedin) value.linkedin = d.linkedin;
    if (d.github) value.github = d.github;
    if (d.youtube) value.youtube = d.youtube;
    if (d.story) value.story = d.story;
    if (d.mission) value.mission = d.mission;
    if (d.vision) value.vision = d.vision;

    const stats = [
      { label: d.stat1Label ?? "", value: d.stat1Value ?? "" },
      { label: d.stat2Label ?? "", value: d.stat2Value ?? "" },
      { label: d.stat3Label ?? "", value: d.stat3Value ?? "" },
      { label: d.stat4Label ?? "", value: d.stat4Value ?? "" },
    ].filter((s) => s.label || s.value);
    if (stats.length > 0) value.stats = stats;

    await db.siteSetting.upsert({
      where: { key: SITE_SETTINGS_KEY },
      create: { key: SITE_SETTINGS_KEY, value },
      update: { value },
    });
    await logAudit({
      actorId: actor.id,
      action: "site-settings.update",
      entity: "SiteSetting",
      entityId: SITE_SETTINGS_KEY,
      metadata: { fields: Object.keys(value) },
    });

    // Site content shows in the shared chrome (footer) and several pages, so
    // revalidate the whole public tree plus this editor.
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return actionSuccess("Site content saved.");
  });
}
