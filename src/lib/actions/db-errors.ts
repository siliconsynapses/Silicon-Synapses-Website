import { Prisma } from "@prisma/client";

/**
 * If `error` is a Prisma unique-constraint violation (P2002), return the name of
 * the first offending field; otherwise null. Server-only (imports the Prisma
 * runtime) — never import from a client component.
 */
export function uniqueConstraintField(error: unknown): string | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    if (Array.isArray(target) && target.length > 0) return String(target[0]);
    if (typeof target === "string") return target;
    return "field";
  }
  return null;
}

/** True when the error is Prisma "record not found" (P2025). */
export function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}
