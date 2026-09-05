import { PrismaClient } from "@/generated/prisma/edge";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Cloudflare D1 gives us the database as a binding on `env`, available only
 * inside a request (via OpenNext's AsyncLocalStorage-backed context) — not
 * as a module-level singleton the way a Postgres connection string would be.
 *
 * Every server component / route handler must call `await getPrisma()`
 * instead of importing a static `prisma` client. The underlying D1Database
 * binding itself is stable per-deployment, so we cache the constructed
 * PrismaClient after the first call.
 */

let cached: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (cached) return cached;

  const { env } = await getCloudflareContext({ async: true });
  if (!env?.DB) {
    throw new Error(
      "D1 binding 'DB' not found. Check wrangler.toml has a [[d1_databases]] " +
        "block with binding = \"DB\" pointing at your database_id, and that " +
        "you're running under `wrangler dev` / a deployed Worker (not plain `next dev`)."
    );
  }

  const adapter = new PrismaD1(env.DB);
  cached = new PrismaClient({ adapter });
  return cached;
}
