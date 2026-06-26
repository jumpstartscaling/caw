# Codebase Audit — June 26, 2026

## Executive finding

The repository has a workable active runtime: Fastify, EJS, and PostgreSQL. The core page model is flexible enough to add content without rebuilding the application. The main problem is that the repository still mixes the active Fastify application with a large legacy Astro/React dependency surface and several page-generation behaviors that are too permissive for controlled production publishing.

## What is working

- `server/index.mjs` is the active HTTP application.
- `server/db.js` uses parameterized PostgreSQL queries for page, article, lead, search, and pSEO data.
- `server/blocks.js` provides reusable block rendering.
- `caw_content` supports runtime page composition.
- `caw_articles` supports published articles, categories, search, related content, RSS, and article navigation.
- Lead capture writes directly to PostgreSQL through `/api/submit-lead`.
- Existing health endpoints provide basic database visibility.

## High-priority risks

### 1. Unknown URLs can mutate production content

The not-found handler calls `autoGeneratePage(slug)` and can permanently save a page based on an arbitrary public URL. Crawlers, typo traffic, scanners, and malicious requests can therefore create unwanted database records.

Required correction: remove auto-generation from the public request path. Page generation should run only through an authenticated CLI, admin action, queue, or controlled seed process.

### 2. Two application generations remain mixed together

`package.json` starts Fastify but still contains Astro, React, Three.js, Vite, TypeScript, and animation dependencies. The `.gitignore` identifies Astro as legacy, yet Astro scripts remain available.

Required correction: confirm whether any deployment still consumes the old Astro tree. Once confirmed unused, remove legacy scripts, dependencies, source folders, and generated outputs in one dedicated cleanup pull request.

### 3. Rendering policy is inconsistent

Some database values are escaped while other fields intentionally accept raw HTML. Several directory pages also build large HTML strings inside route handlers. This creates inconsistent safety and makes visual rules difficult to enforce.

Required correction: define trusted HTML fields explicitly, sanitize those fields before storage, and move directory rendering into EJS partials or reusable render helpers.

### 4. Metadata is too generic

Core page descriptions are hardcoded in route handlers instead of stored with each page. This prevents precise SEO metadata and makes every core page depend on generic copy.

Required correction: add `meta_title`, `meta_description`, `canonical_path`, `robots`, and optional schema data to the core page model.

### 5. Page blocks have no schema validation

The renderer accepts arbitrary block JSON. Missing fields degrade silently, and malformed records can reach production.

Required correction: validate page records before publishing with a block schema and a publication-status gate.

## Maintainability findings

- `server/index.mjs` is handling APIs, health checks, blog routes, search, RSS, directories, redirects, pSEO, generation, and startup in one file.
- Directory routes contain substantial inline CSS and HTML.
- Duplicate `/api/health` and `/health` behavior should be consolidated behind one health service.
- Navigation and footer data are duplicated into page records and fetched from arbitrary template rows for generated pages.
- Random spintax selection means identical URLs can render differently between requests.
- Several UI patterns use rounded cards, translucent borders, and inline hover JavaScript, conflicting with the intended full-width, square-edged content system.
- CTA defaults still include `#contact`, while the approved core-page conversion convention is a page-local section such as `#growth-plan`.

## Cleanup added in this branch

- Added `npm run check:syntax`.
- Added `npm run check:repo`.
- Added `npm run check` as the combined repository check.
- Added a validator that confirms active runtime files and reports the legacy dependency surface and public auto-generation risk.
- Added a documented workflow for creating and publishing core content pages.
- Updated repository documentation to clearly identify the active runtime.

## Recommended refactor order

1. Remove public-request auto-generation.
2. Add metadata columns and publication status to `caw_content`.
3. Add validated page and block schemas.
4. Split the server into route modules: leads, health, pages, blog, search, directories, and redirects.
5. Move directory HTML into EJS partials.
6. Establish one shared navigation/footer configuration.
7. Confirm and remove the unused Astro/React generation.
8. Build new core pages from a controlled page registry and seed workflow.

## Definition of ready for new core pages

The site is ready for systematic page expansion when:

- unknown traffic cannot write content;
- each page has explicit publication status and metadata;
- block JSON is validated before publish;
- the lead form path is tested;
- navigation and sitemap inclusion are controlled;
- page templates comply with the approved full-width, square-edged visual system;
- `npm run check` passes before every merge.
