import { z } from "zod";
import {
  boolFromForm,
  optionalDate,
  optionalInt,
  optionalText,
  optionalUrl,
  optionalUrlOrPath,
  orderField,
  requiredDate,
  requiredInt,
  requiredText,
  slugField,
} from "@/lib/validations/fields";

/**
 * Admin CRUD validation schemas. Each mirrors a Prisma model's editable fields.
 * Server actions parse `FormData` against these before any write — client-side
 * validation is never trusted. `slug` is optional and derived from the name
 * when omitted; DB `@unique` constraints are the source of truth for collisions.
 */

// --- Department ------------------------------------------------------------
export const departmentSchema = z.object({
  name: requiredText("Name", 120),
  slug: slugField(),
  tagline: requiredText("Tagline", 160),
  description: requiredText("Description", 2000),
  icon: requiredText("Icon", 60),
  accent: requiredText("Accent", 120),
  order: orderField(),
  isActive: boolFromForm(),
});
export type DepartmentInput = z.infer<typeof departmentSchema>;

// --- Team member -----------------------------------------------------------
export const teamMemberSchema = z.object({
  name: requiredText("Name", 120),
  role: requiredText("Role", 120),
  photoUrl: optionalUrlOrPath(),
  bio: optionalText(1000),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200, "Email is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a valid email address",
    ),
  linkedinUrl: optionalUrl(),
  githubUrl: optionalUrl(),
  departmentId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  order: orderField(),
  isActive: boolFromForm(),
});
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

// --- Event -----------------------------------------------------------------
export const EVENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
] as const;

export const eventSchema = z
  .object({
    title: requiredText("Title", 160),
    slug: slugField(),
    summary: requiredText("Summary", 300),
    description: requiredText("Description", 8000),
    bannerUrl: optionalUrl(),
    venue: requiredText("Venue", 200),
    startsAt: requiredDate("Start date"),
    endsAt: optionalDate("End date"),
    capacity: optionalInt("Capacity", 1, 100000),
    status: z.enum(EVENT_STATUSES),
    registrationOpensAt: optionalDate("Registration opens"),
    registrationClosesAt: optionalDate("Registration closes"),
    departmentId: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
  })
  .refine(
    (v) => !v.endsAt || v.endsAt.getTime() >= v.startsAt.getTime(),
    { message: "End date must be after the start date", path: ["endsAt"] },
  )
  .refine(
    (v) =>
      !v.registrationOpensAt ||
      !v.registrationClosesAt ||
      v.registrationClosesAt.getTime() >= v.registrationOpensAt.getTime(),
    {
      message: "Registration close must be after it opens",
      path: ["registrationClosesAt"],
    },
  );
export type EventInput = z.infer<typeof eventSchema>;

// --- Magazine --------------------------------------------------------------
export const magazineSchema = z.object({
  title: requiredText("Title", 160),
  slug: slugField(),
  issue: requiredText("Issue label", 80),
  description: optionalText(1000),
  coverUrl: optionalUrl(),
  fileUrl: optionalUrl(),
  publishedAt: optionalDate("Publish date"),
  isPublished: boolFromForm(),
});
export type MagazineInput = z.infer<typeof magazineSchema>;

// --- Learning: Branch ------------------------------------------------------
export const branchSchema = z.object({
  name: requiredText("Name", 120),
  slug: slugField(),
  order: orderField(),
  isActive: boolFromForm(),
});
export type BranchInput = z.infer<typeof branchSchema>;

// --- Learning: Subject -----------------------------------------------------
export const subjectSchema = z.object({
  branchId: requiredText("Branch", 40),
  name: requiredText("Name", 160),
  code: optionalText(40),
  semester: requiredInt("Semester", 1, 8),
  order: orderField(),
  isActive: boolFromForm(),
});
export type SubjectInput = z.infer<typeof subjectSchema>;

// --- Learning: Resource Category -------------------------------------------
export const categorySchema = z.object({
  name: requiredText("Name", 120),
  slug: slugField(),
  order: orderField(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

// --- Learning: Resource ----------------------------------------------------
export const RESOURCE_TYPES = ["LINK", "FILE", "VIDEO", "BOOK", "NOTE"] as const;

export const resourceSchema = z.object({
  title: requiredText("Title", 200),
  description: optionalText(1000),
  type: z.enum(RESOURCE_TYPES),
  url: optionalUrl(),
  subjectId: requiredText("Subject", 40),
  categoryId: requiredText("Category", 40),
  isPublished: boolFromForm(),
});
export type ResourceInput = z.infer<typeof resourceSchema>;

// --- Query response / status ----------------------------------------------
export const QUERY_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export const queryUpdateSchema = z.object({
  id: requiredText("Query", 40),
  status: z.enum(QUERY_STATUSES),
  response: optionalText(4000),
});
export type QueryUpdateInput = z.infer<typeof queryUpdateSchema>;
