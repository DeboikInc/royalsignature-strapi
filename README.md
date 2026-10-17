# Royal Signature Hotel and Suites

An independent Next.js App Router and Strapi 5 booking application for Royal Signature Hotel and Suites, Ojo Road, Ojo, Lagos State. This project was copied from the Vivee Aura implementation into a separate directory and adapted here; the source project is not used as a runtime dependency.

## Stack

- Frontend: Next.js 15.4.10, React 19, Node.js 22 (verified locally with Node 22.13.0)
- CMS/API: Strapi 5.57.0; Strapi package overrides remain version-aligned
- Database: dedicated MariaDB 11.4 container and database/user
- Booking: server-side price recalculation, unit availability, expiring holds, idempotency and verified-payment state transitions
- Payments: Paystack test mode only; no credentials or live transaction are included. Flutterwave is not configured and its routes remain disabled.

## Local Setup

Use Docker Desktop with Compose, Node.js 22, and npm. All services use Royal Signature-specific ports and named resources: website `3100`, Strapi `1437`, MariaDB `3317`, network `royal_signature_network`, and volumes `royal_signature_mariadb_data` / `royal_signature_strapi_uploads`.

In PowerShell, create local-only environment files:

```powershell
Copy-Item .env.example .env.local
Copy-Item backend/.env.example backend/.env
```

Replace every `replace_with_...` value locally with a unique random value. Do not use Vivee Aura credentials or commit either local environment file. `STRAPI_API_TOKEN` must be created as a least-privilege Strapi API token after the new CMS starts. `PAYMENT_SECRET_KEY` and `PAYMENT_PUBLIC_KEY` must be the hotel's own Paystack test keys; until configured, payment initialization returns a configuration error and no provider request is made.

Install, start the isolated CMS/database, seed the supplied room records, and start the frontend:

```powershell
npm ci
npm ci --prefix backend
npm run db:up
npm run seed
npm run dev
```

Open `http://localhost:3100`; the Strapi admin is at `http://localhost:1437/admin`. Create the initial administrator in the Royal Signature Strapi instance only. The frontend can show the designed catalog and confirmation states without a CMS token; protected bookings intentionally fail closed until `STRAPI_API_TOKEN` is configured.

Useful commands:

```sh
npm run build
npm run strapi:build
npm run test:backend
npm run db:logs
npm run db:down
```

`db:down` retains Royal Signature data. Do not run `docker compose down -v` unless you explicitly intend to delete the Royal Signature database and upload volumes. No Docker or database command in this setup targets Vivee Aura.

## Environment

Root `.env.example` is the Next.js and Compose template; `backend/.env.example` is for a host-run Strapi process. All values are safe placeholders. `STRAPI_URL` is server-only, has no public fallback, and rejects Vivee Aura's known production domains. Database configuration requires MySQL/MariaDB and a database and user with the `royal_signature_` prefix. Missing or placeholder Strapi secrets stop startup.

`CORS_ORIGINS` lists the Royal Signature frontend and local admin origins. `APP_BASE_URL` defaults in the template to `http://localhost:3100`; the intended production domain is `https://royalssignaturehotelandsuites.com`, pending ownership and DNS confirmation. Media URL, CMS token, payment keys, webhook secrets, and application secrets are independently configured; none are copied from Vivee Aura.

## Rooms and Seed Data

`backend/scripts/seed.js` idempotently creates five room types, five starting-rate records in NGN, four categories, and suggested amenity records. It creates no rooms/units, bookings, guest reviews, or verified amenity relations. The availability service consequently returns no bookable inventory until authorized staff add physical units and confirm capacities.

| Room | Supplied starting rate | Supplied capacity | Bed configuration |
| --- | ---: | --- | --- |
| Classic Room | NGN 25,000/night | 2 adults | 1 Queen bed |
| Executive Room | NGN 30,000/night | 2 adults | 1 King bed |
| Deluxe Room | NGN 40,000/night | 2 adults, 1 child | 1 King bed |
| Super Royal | NGN 50,000/night | 1–2 adults (seeded maximum 2) | 1 King bed |
| Apartment Amsterdam's | NGN 100,000/night | 4 adults, 2 children | 1 King bed plus sofa bed |

Prices and occupancy details are initial supplied information, not independently verified live offers. Room sizes, facility availability, breakfast inclusion and other assumptions are not asserted as facts. See [the launch confirmation checklist](docs/ROYAL_SIGNATURE_LAUNCH_CHECKLIST.md).

## Media and Brand

Vivee Aura media, logos, uploads, production URLs and local fixtures were excluded. The frontend uses a temporary text-based RS lockup and clearly labelled illustrative hotel photography; these are not represented as actual Royal Signature property images. The approved logo artwork was included in the project brief but is not present as a local binary asset in this directory. Add the approved transparent logo/wordmark exports under `public/brand/` and replace the temporary lockup before launch. The gallery remains empty until hotel-approved images are supplied.

## Booking and Payment

Availability is read from individual active inventory units. Date validation, capacity, applicable rate, and stay total are calculated by Strapi. Checkout submits guest consent, creates a protected pending hold with an idempotency key, then uses the returned server total. A signed Paystack webhook and server-side transaction verification must match reference, amount and currency before a booking is confirmed. Browser redirects alone do not confirm bookings.

The frontend cannot be considered production-ready until the hotel provisions its own CMS token, Paystack test credentials and webhook setup. No live payment has been initiated. Flutterwave is not supported by the current working source and remains disabled.

## Deployment and Rollback

Deploy the frontend, Strapi, MariaDB and media storage as separate Royal Signature resources. Use a dedicated production database/user, private secrets manager, isolated upload storage, backups, monitoring, and explicit CORS origins. Do not use the intended domain or update DNS until ownership and access are confirmed. No production deployment or DNS change is automated here.

For rollback, route traffic back to the previous Royal Signature frontend/backend release, retain database/media volumes, and restore a verified Royal Signature backup only if data integrity requires it. Never use a Vivee Aura database, volume, secret or backup for rollback.

## Verification Status

- `npm run build`: passed; Next.js generated the pages, sitemap and robots routes. Existing dependency data warnings remain.
- `npm run test:backend`: passed, 17/17 tests, including booking pricing/idempotency, Paystack signature checks and Royal seed repeatability.
- `npm run strapi:build`: passed with temporary non-secret Royal-prefixed build configuration values.
- Docker Compose startup, MariaDB isolation, Strapi admin login, seed against a live CMS, browser booking, and provider/webhook connectivity: not run because Docker, credentials and hotel configuration are not available in this environment.
- `npm install` reported dependency audit findings in the inherited locked dependency tree: 29 frontend and 41 backend findings. Versions were preserved; review and remediate before production.

The source repository was not used for runtime configuration or database operations. Its working files and history were not edited by this implementation. The original source had an unrelated untracked `.vscode/settings.json` visible during the session; it was left untouched.