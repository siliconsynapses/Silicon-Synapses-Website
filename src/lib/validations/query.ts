import { z } from "zod";

export const QUERY_TYPES = ["QUERY", "SUGGESTION", "FEEDBACK"] as const;
export type QueryType = (typeof QUERY_TYPES)[number];

export const QUERY_TYPE_LABELS: Record<QueryType, string> = {
  QUERY: "Question",
  SUGGESTION: "Suggestion",
  FEEDBACK: "Feedback",
};

export const querySchema = z.object({
  type: z.enum(QUERY_TYPES),
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(200, "Email is too long"),
  subject: z
    .string()
    .trim()
    .min(3, "Add a short subject")
    .max(150, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters)")
    .max(3000, "Message is too long (3000 characters max)"),
});

export type QueryInput = z.infer<typeof querySchema>;
