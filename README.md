# chrisamaya.work — Fastify SSR (no build)

DB-driven SSR. Fastify + EJS + pg. No build step; templates rendered at request time.

## Architecture

- **Pages, blocks, nav, footer** → Direct Postgres (`${SITE_PREFIX}_content`)
- **Forms** → POST `/api/submit-lead` → INSERT `leads`

## Quick Start

```bash
cp .env.example .env
# Set DATABASE_URL to your Postgres connection string
npm install
npm run dev   # or npm run start
```

## Seed

Creates `caw_seed` and `caw_content` tables.

```bash
DATABASE_URL=... npm run db:seed
```

Seed Jumpstart Scaling tenant:

```bash
DATABASE_URL=... npm run db:seed:jss
```

Set `SITE_PREFIX` per deployment:

- `SITE_PREFIX=caw` for chrisamaya.work
- `SITE_PREFIX=jss` for jumpstartscaling.com

## Health Check

`GET /api/health` returns `{ ok, db, tables }` or error with hint.

## pSEO service-page strategy (localized + unique)

- `getPseoPage(slug)` now tries to use a tenant service page as a base template first:
  - `services/<service-slug>`
  - `services/custom-apps/<service-slug>`
  - `solutions/<service-slug>`
  - `service/<service-slug>`
- If a base template exists, the renderer localizes it with `{city}`, `{state}`, `{service_type}`, etc.
- It then appends generic localized modules (geo bridge, interlinks, related articles) so end pages stay unique.
- If no base template exists, it falls back to synthetic pSEO assembly from shared fragment/spintax tables.

## Tracking pSEO element usage across sites

Shared table/view:
- `pseo_element_usage` (raw events)
- `pseo_element_usage_stats` (aggregated stats)

Quick queries:

```sql
-- Most reused pSEO elements by site
SELECT site_prefix, element_group, element_key, total_usage_count, unique_element_count, page_count
FROM pseo_element_usage_rollup
ORDER BY total_usage_count DESC
LIMIT 100;

-- Where a specific element was used
SELECT site_prefix, element_group, element_key, pages, page_count
FROM pseo_element_usage_stats
WHERE element_group = 'fragment' AND element_key = 'geo_bridge';

-- Per-page element mix
SELECT page_slug, element_group, COUNT(*) AS elements_used
FROM pseo_element_usage
WHERE site_prefix = 'jss'
GROUP BY page_slug, element_group
ORDER BY page_slug, element_group;
```
