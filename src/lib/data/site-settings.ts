import { db } from "@/lib/db";
import { safeDb } from "@/lib/data/safe";
import { tryDb, type MaybeDb } from "@/lib/data/admin";
import { siteConfig, socialLinks, clubStats } from "@/config/site";

/**
 * Site content read layer. The club edits copy/contact/socials/stats from the
 * admin console; the values live in a single `SiteSetting` row (key = "site")
 * whose JSON `value` holds the stored overrides. Anything unset falls back to
 * the compiled defaults in `@/config/site`, so the public site always renders —
 * even before anything has been saved, or if the database is unreachable.
 */

export const SITE_SETTINGS_KEY = "site";

/** Raw stored overrides — every field optional (blank ⇒ fall back to config). */
export type StoredSiteSettings = {
  tagline?: string;
  description?: string;
  college?: string;
  department?: string;
  email?: string;
  address?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
  story?: string;
  mission?: string;
  vision?: string;
  stats?: { label: string; value: string }[];
};

/** Fully-resolved content the public site renders (defaults already applied). */
export type SiteContent = {
  tagline: string;
  description: string;
  college: string;
  /** True once a real college name has been set (not the placeholder). */
  hasCollege: boolean;
  department: string;
  email: string;
  address: string | null;
  /** Each social is a real URL, or "" when unset — consumers skip the blanks. */
  socials: { instagram: string; linkedin: string; github: string; youtube: string };
  /** About-page prose — null when unset so the page can show guidance instead. */
  story: string | null;
  mission: string | null;
  vision: string | null;
  stats: { label: string; value: string }[];
};

const COLLEGE_PLACEHOLDER = "[College Name]";

/** The `value` column is written only by our validated action, so it is trusted. */
function coerceStored(value: unknown): StoredSiteSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as StoredSiteSettings;
}

const nonEmpty = (v: string | undefined | null): v is string =>
  typeof v === "string" && v.trim().length > 0;

const pick = (v: string | undefined, fallback: string) =>
  nonEmpty(v) ? v.trim() : fallback;

function normalizeStats(
  stats: StoredSiteSettings["stats"],
): { label: string; value: string }[] {
  // Always return exactly the 4 homepage slots, filling blanks from config.
  return clubStats.map((fallback, i) => {
    const s = Array.isArray(stats) ? stats[i] : undefined;
    return {
      label: pick(s?.label, fallback.label),
      value: pick(s?.value, fallback.value),
    };
  });
}

function resolve(stored: StoredSiteSettings): SiteContent {
  const college = pick(stored.college, siteConfig.college);
  return {
    tagline: pick(stored.tagline, siteConfig.tagline),
    description: pick(stored.description, siteConfig.description),
    college,
    hasCollege: nonEmpty(stored.college) && college !== COLLEGE_PLACEHOLDER,
    department: pick(stored.department, siteConfig.department),
    email: pick(stored.email, socialLinks.email),
    address: nonEmpty(stored.address) ? stored.address!.trim() : null,
    socials: {
      // Config defaults are dead "#" placeholders — treat those as unset.
      instagram: nonEmpty(stored.instagram) ? stored.instagram!.trim() : "",
      linkedin: nonEmpty(stored.linkedin) ? stored.linkedin!.trim() : "",
      github: nonEmpty(stored.github) ? stored.github!.trim() : "",
      youtube: nonEmpty(stored.youtube) ? stored.youtube!.trim() : "",
    },
    // About-page prose has no sensible compiled default — leave null so the page
    // renders its own "[CONTENT REQUIRED]" guidance until the club writes real copy.
    story: nonEmpty(stored.story) ? stored.story!.trim() : null,
    mission: nonEmpty(stored.mission) ? stored.mission!.trim() : null,
    vision: nonEmpty(stored.vision) ? stored.vision!.trim() : null,
    stats: normalizeStats(stored.stats),
  };
}

/** Public read — resolved content with config fallbacks; never throws. */
export async function getSiteContent(): Promise<SiteContent> {
  const stored = await safeDb(
    async (client) => {
      const row = await client.siteSetting.findUnique({
        where: { key: SITE_SETTINGS_KEY },
      });
      return coerceStored(row?.value);
    },
    {} as StoredSiteSettings,
  );
  return resolve(stored);
}

/** Admin read — the raw stored overrides, for pre-filling the editor. */
export function getStoredSiteSettings(): Promise<MaybeDb<StoredSiteSettings>> {
  return tryDb(async () => {
    const row = await db.siteSetting.findUnique({
      where: { key: SITE_SETTINGS_KEY },
    });
    return coerceStored(row?.value);
  });
}
