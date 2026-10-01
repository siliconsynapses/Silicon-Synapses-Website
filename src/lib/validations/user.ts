import { z } from "zod";
import { requiredText } from "@/lib/validations/fields";

/**
 * User-management schemas (SUPER_ADMIN only). Passwords are validated here and
 * hashed with bcrypt server-side before storage — never logged, never returned.
 */

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF"] as const;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(200, "Email is too long")
  .refine(
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Enter a valid email address",
  );

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200, "Password is too long");

export const createUserSchema = z.object({
  name: requiredText("Name", 120),
  email,
  password,
  role: z.enum(ADMIN_ROLES),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  id: requiredText("User", 40),
  name: requiredText("Name", 120),
  role: z.enum(ADMIN_ROLES),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => v === true || v === "true" || v === "on" || v === "1"),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** Optional password reset — blank means "leave unchanged". */
export const resetPasswordSchema = z.object({
  id: requiredText("User", 40),
  password,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
