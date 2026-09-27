/**
 * Turn arbitrary text into a URL-safe slug. Used to auto-derive slugs for
 * departments, events, magazines, branches, and categories when an admin leaves
 * the slug field blank. Uniqueness is enforced by the database (`@unique`);
 * collisions surface as a friendly field error.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "item";
}
