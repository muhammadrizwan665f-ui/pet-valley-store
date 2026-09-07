/**
 * Normalizes any string into a clean, URL-safe slug.
 *
 * This exists because the admin product form saved whatever the "slug"
 * field contained with zero sanitization — a pasted value like
 * "/location-tracker " (leading slash, trailing space) got stored as-is,
 * producing a broken /product/... link and a 404 on the storefront.
 * Every write path (create + update) now runs the slug through this.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^\/+/, "")          // strip any leading slash(es)
    .replace(/[^a-z0-9]+/g, "-")  // non-alphanumeric runs -> single hyphen
    .replace(/^-+|-+$/g, "");     // trim leading/trailing hyphens
}
