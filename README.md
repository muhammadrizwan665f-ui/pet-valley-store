# Pet Valley — Ready for Cloudflare Workers

Premium sage-green/cream/charcoal pet ecommerce storefront + separate admin dashboard, deployed on **Cloudflare Workers** via the OpenNext adapter (Next.js 15 + React 19), backed by a **real Cloudflare D1 database already created in your account**.

## ⚠️ Before you deploy — read this
I upgraded this project from Next.js 14 to **Next.js 15** because the current, actively-maintained OpenNext Cloudflare adapter requires it (the version compatible with Next 14 depends on an abandoned preview package that no longer resolves). I fixed everything this upgrade broke that I could verify: every `params`/`searchParams` usage across the app (Next 15 made these `Promise`s — a real breaking change, not optional).

**One thing I could not verify end-to-end**: `npm run build` needs `prisma generate` to run first, and my sandboxed tool environment blocks the domain Prisma's CLI downloads its engine from (`binaries.prisma.sh`) — confirmed directly, not a guess. This is specific to *my* execution environment, not your code — that domain is a normal, unblocked part of the public internet everywhere else (your machine, GitHub Actions, Cloudflare's own build servers). Please run this yourself once, before your first deploy, to catch anything my sandbox couldn't show me:
```bash
npm install
npx prisma generate
npm run build
```
If that fails, it's genuinely new information — paste me the error and I'll fix it. Everything else in this README assumes that command succeeds, which it should.

## What's already done for you
- ✅ D1 database `pet-valley-db` created in your Cloudflare account (id `e77f792c-5585-4cdd-828c-c6c2da777ad5`, wired into `wrangler.toml`)
- ✅ All 18 tables created in that real database (`migrations/0001_init.sql`)
- ✅ Seeded with real data: 1 admin user, store settings, 6 categories, 8 sample products
- ✅ Entire codebase converted from Postgres/Prisma to D1/Prisma (schema, query syntax, every route)
- ✅ Upgraded to Next.js 15 / React 19 for OpenNext Cloudflare compatibility, including every `params`/`searchParams` call site
- ✅ `wrangler.toml` + `open-next.config.ts` configured with the real D1 binding

**Admin login:** `admin@petvalley.example` / `ChangeMe123!` — **change this password immediately after your first login**, it's sitting in a real database right now.

## The only steps left — these need your Cloudflare login, which I don't have
I can create/manage resources in your account through my tools, but I can't authenticate `wrangler` as you or push code to your Worker — that needs your own login once.

```bash
npm install --legacy-peer-deps                # some peer ranges lag the latest packages slightly; safe to use
npx wrangler login                        # one-time browser login to your Cloudflare account

# Set secrets (never commit these — they don't live in any file in this repo)
npx wrangler secret put NEXTAUTH_SECRET     # any random 32+ char string, e.g. `openssl rand -base64 32`
npx wrangler secret put PAYFAST_MERCHANT_ID
npx wrangler secret put PAYFAST_MERCHANT_KEY
npx wrangler secret put PAYFAST_PASSPHRASE

npm run deploy                              # builds with OpenNext and pushes to your Worker
```

After the first deploy, Cloudflare gives you a `*.workers.dev` URL (or attach a custom domain). Then:
1. Open `wrangler.toml`, replace the two placeholder URLs under `[vars]` (`NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`) with your real Worker URL, and run `npm run deploy` again.
2. In your PayFast merchant dashboard, set the **Notify URL** to `https://<your-worker-url>/api/webhooks/payfast`.
3. Log into `/admin` and change the seeded admin password.

## Local development
```bash
DATABASE_URL="file:./local.db" npx prisma migrate dev --name init   # local SQLite for iterating
npm run prisma:seed                                                  # sample data for local dev only
npm run dev
```
`next.config.js` calls `initOpenNextCloudflareForDev()` so `next dev` can also reach your real D1 binding locally if you'd rather develop against production data — see the OpenNext Cloudflare docs if you want that instead of a local SQLite file.

## Architecture notes (D1 vs. the original Postgres design)
Cloudflare Workers can't hold a normal Postgres TCP connection, so this was converted to D1 (SQLite), which I could provision directly:
- **Enums → plain `String` columns.** Prisma's SQLite connector doesn't support native enums. Valid values are documented as comments beside each field in `schema.prisma` (e.g. `role: "CUSTOMER" | "ADMIN" | "STAFF"`) and validated in application code.
- **`Decimal` → `Float`.** D1/SQLite has no fixed-point decimal type. Money values are plain floats; for very high-volume financial precision you'd want to store cents as integers instead.
- **`String[]` → JSON-encoded `String`.** SQLite doesn't support scalar list columns. `Product.features` / `Product.tags` are JSON strings — see `src/lib/json.ts` for the `encodeStringArray` / `decodeStringArray` helpers used everywhere they're read or written.
- **Case-insensitive search (`mode: "insensitive"`) and array `has` filters were Postgres-only** and have been replaced with plain `contains` matches (case-sensitive) across Shop search, Admin Orders/Customers/Products search.
- **`src/lib/prisma.ts` is request-scoped, not a module singleton.** D1 is only available as a binding inside a request (via OpenNext's `getCloudflareContext()`), so every route/page calls `const prisma = await getPrisma();` instead of importing a static client.
- **`nodejs_compat` compatibility flag is on** in `wrangler.toml` — required for `bcryptjs` (password hashing) and Node's `crypto` module (used for PayFast signatures and password-reset tokens) to run on Workers.
- **Next/Image optimization is disabled** (`images.unoptimized: true`) since Workers doesn't run Next's built-in sharp-based optimizer; images are served as-is.

## What still requires external configuration
- **PayFast live credentials** — set via `wrangler secret put` as shown above; currently unset (checkout will error until you do).
- **Shipping rates** — flat-rate/free-shipping-threshold only (Admin → Shipping); no live carrier API.
- **Transactional email** — `EMAIL_PROVIDER` reserved; order confirmations, password reset emails, and contact form submissions are validated and logged but not sent until a provider (e.g. Resend) is wired into the three spots noted with `TODO` comments (`api/auth/forgot-password`, `api/contact`).
- **Product photography** — placeholder image path only; add real photos and update the seeded rows' `url` values (or re-run inserts) once you have them.
- **Rate limiting** — `src/lib/rateLimit.ts` is in-memory per-Worker-isolate. Cloudflare may spin up multiple isolates, so this is a soft throttle, not a hard guarantee. For strict limits, switch to Cloudflare's own Rate Limiting API or a KV/Durable-Object-backed counter.

## Database schema
`prisma/schema.prisma` — Users, Addresses, Categories, Products, ProductVariants, ProductImages, Cart/CartItems, Wishlist, Orders/OrderItems/OrderStatusEvents, Payments, Shipments, Coupons/CouponUsage, Reviews, PasswordResetTokens, StoreSettings. `migrations/0001_init.sql` is the exact DDL already applied to your live D1 database.
