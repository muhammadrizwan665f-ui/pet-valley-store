/**
 * Cloudflare D1 (SQLite) doesn't support Prisma's native String[] scalar
 * lists, so `Product.features` and `Product.tags` are stored as JSON-encoded
 * strings instead (see schema.prisma). These helpers keep the JSON
 * encode/decode in one place.
 */

export function decodeStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function encodeStringArray(value: string[] | undefined): string {
  return JSON.stringify(value ?? []);
}
