# chrisamaya.work

Database-driven Fastify SSR for the Chris Amaya website. The active runtime uses Fastify, EJS, and PostgreSQL. Core pages render from `caw_content` at request time, so content updates do not require a frontend rebuild.

## Active architecture

- **HTTP runtime:** `server/index.mjs`
- **Database access:** `server/db.js`
- **Block renderer:** `server/blocks.js`
- **Templates:** `views/*.ejs`
- **Pages, blocks, navigation, and footer:** PostgreSQL table `caw_content`
- **Articles:** PostgreSQL table `caw_articles`
- **Lead intake:** `POST /api/submit-lead` into PostgreSQL

## Local start

```bash
cp .env.example .env
# Set DATABASE_URL to the PostgreSQL connection string.
npm install
npm run check
npm run dev
```

Production start:

```bash
npm start
```

## Database seed

```bash
DATABASE_URL=... npm run db:seed
```

## Health checks

- `GET /api/health`
- `GET /health`

## Adding core content pages

Core pages are records in `caw_content`, not new route files. Read [`docs/CORE_CONTENT_PAGES.md`](docs/CORE_CONTENT_PAGES.md) before adding or publishing pages.

## Audit and cleanup status

The June 26, 2026 review is documented in [`docs/CODEBASE_AUDIT_2026-06-26.md`](docs/CODEBASE_AUDIT_2026-06-26.md).

The repository currently retains legacy Astro/React dependencies. They should be removed only after confirming that no deployment or archived workflow still relies on them. Public-request page auto-generation is also identified as a production risk and should be moved behind a controlled administrative workflow.
