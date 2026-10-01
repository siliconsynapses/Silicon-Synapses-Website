import { z } from "zod";

/**
 * Public event-registration input. Validated server-side in the registration
 * action — never trust the client. The contact details captured here are private
 * to staff; they are NEVER placed in a public URL or the pass QR (only the opaque
 * pass token is). See prisma/schema.prisma → Registration.
 */
export const registrationSchema = z.object({
  participantName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  participantEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(200, "Email is too long"),
  participantPhone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^[0-9+\-\s()]{6,20}$/.test(v),
      "Enter a valid phone number",
    ),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
