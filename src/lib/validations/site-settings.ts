import { z } from "zod";
import { optionalText, optionalUrl } from "@/lib/validations/fields";

/**
 * Club-editable site content (college name, hero copy, social links, contact,
 * homepage stats). Every field is optional: anything left blank falls back to
 * the compiled defaults in `@/config/site` when the public site renders, so an
 * empty form never blanks out the site. Parsed server-side before any write —
 * client input is never trusted. Stats are flat fields here (stat1Label …) to
 * match the flat FormData; the action reassembles them into an array.
 */

const optionalEmail = () =>
  z
    .string()
    .trim()
    .toLowerCase()
    .max(200, "Email is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a valid email address",
    );

export const siteSettingsSchema = z.object({
  tagline: optionalText(160),
  description: optionalText(400),
  college: optionalText(160),
  department: optionalText(160),
  email: optionalEmail(),
  address: optionalText(200),
  instagram: optionalUrl(),
  linkedin: optionalUrl(),
  github: optionalUrl(),
  youtube: optionalUrl(),
  story: optionalText(2000),
  mission: optionalText(600),
  vision: optionalText(600),
  stat1Label: optionalText(40),
  stat1Value: optionalText(24),
  stat2Label: optionalText(40),
  stat2Value: optionalText(24),
  stat3Label: optionalText(40),
  stat3Value: optionalText(24),
  stat4Label: optionalText(40),
  stat4Value: optionalText(24),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
