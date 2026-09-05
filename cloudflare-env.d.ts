// Matches the bindings declared in wrangler.toml.
// Regenerate anytime with: npm run cf-typegen
interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
  PAYFAST_MODE?: string;
  NEXTAUTH_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  // Secrets — set via `wrangler secret put <NAME>`, not present here at build time:
  NEXTAUTH_SECRET?: string;
  PAYFAST_MERCHANT_ID?: string;
  PAYFAST_MERCHANT_KEY?: string;
  PAYFAST_PASSPHRASE?: string;
}
