import { z } from "zod";

/**
 * Login credentials. Validated on the server inside the Credentials provider —
 * client-side validation is never trusted.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
