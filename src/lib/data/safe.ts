import { db } from "@/lib/db";

/**
 * Run a Prisma query with a safe fallback.
 *
 * The public site must render even when the database is unreachable (e.g. before
 * Neon is provisioned) — a failed query serves the fallback and logs in dev,
 * rather than throwing and 500-ing the page.
 */
export async function safeDb<T>(
  run: (client: typeof db) => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run(db);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[data] query failed — serving fallback:",
        error instanceof Error ? error.message : error,
      );
    }
    return fallback;
  }
}
