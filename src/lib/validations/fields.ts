import { z } from "zod";
import { slugify } from "@/lib/slug";
import { fromDateTimeLocal } from "@/lib/datetime";

/**
 * Shared field helpers for admin CRUD forms. Every admin mutation validates
 * against these server-side — client inputs are never trusted.
 */

const requiredText = (label: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, "Too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

/** Optional URL that also accepts an empty string (→ undefined). */
const optionalUrl = () =>
  z
    .string()
    .trim()
    .max(2048, "URL is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^https?:\/\/.+/i.test(v),
      "Enter a valid URL starting with http:// or https://",
    );

/**
 * Optional image reference: an http(s) URL OR a root-relative path — e.g. an
 * uploaded file ("/uploads/…") or a committed static asset ("/team/…").
 * Accepts an empty string (→ undefined).
 */
export const optionalUrlOrPath = () =>
  z
    .string()
    .trim()
    .max(2048, "URL is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^https?:\/\/.+/i.test(v) || /^\/[^\s]*$/.test(v),
      "Enter a valid URL (http:// or https://) or leave blank",
    );

/** A slug field that derives from `source` when left blank. */
const slugField = () =>
  z
    .string()
    .trim()
    .max(80, "Slug is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? slugify(v) : undefined));

/** Coerce checkbox / "true"/"on" values to boolean. */
const boolFromForm = () =>
  z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => v === true || v === "true" || v === "on" || v === "1");

/** Optional integer from a form string ("" → undefined). */
const optionalInt = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^\d+$/.test(v),
      `${label} must be a whole number`,
    )
    .transform((v) => (v === undefined ? undefined : Number.parseInt(v, 10)))
    .refine(
      (v) => v === undefined || (v >= min && v <= max),
      `${label} must be between ${min} and ${max}`,
    );

/** Required integer from a form string. */
const requiredInt = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => /^\d+$/.test(v), `${label} must be a whole number`)
    .transform((v) => Number.parseInt(v, 10))
    .refine((v) => v >= min && v <= max, `${label} must be between ${min} and ${max}`);

/** Optional datetime-local string ("" → undefined; else a Date, parsed as IST). */
const optionalDate = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || !Number.isNaN(fromDateTimeLocal(v).getTime()),
      `${label} is not a valid date`,
    )
    .transform((v) => (v === undefined ? undefined : fromDateTimeLocal(v)));

const requiredDate = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (v) => !Number.isNaN(fromDateTimeLocal(v).getTime()),
      `${label} is not a valid date`,
    )
    .transform((v) => fromDateTimeLocal(v));

export const orderField = () =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : "0"))
    .refine((v) => /^\d+$/.test(v), "Order must be a whole number")
    .transform((v) => Number.parseInt(v, 10));

export {
  requiredText,
  optionalText,
  optionalUrl,
  slugField,
  boolFromForm,
  optionalInt,
  requiredInt,
  optionalDate,
  requiredDate,
};
