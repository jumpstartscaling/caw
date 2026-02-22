# Spark Architecture

Spark uses **god-mode**: a Python FastAPI backend with PostgreSQL. No Directus or Django.

## Stack

| Layer | Technology |
|-------|------------|
| API | FastAPI (god-mode/python-api) |
| Database | PostgreSQL + PGVector |
| Frontend | Astro + React (god-mode/sites) |
| Deployment | Coolify (JFactory + god-mode-api apps) |

## Data Flow

1. **Forms** (ContactForm, ScalingSurvey) → `submitLead()` / `submitScalingSurvey()` → POST to god-mode API
2. **Admin pages** → `window.__ADMIN_API_BASE__` (PUBLIC_GOD_MODE_API_URL) → fetch `/api/leads`, `/api/locations`, etc.
3. **pSEO pages** → `/api/matrix/by-slug/{slug}` for content
4. **Seed data** → `seed_from_exports.py` reads `exports/*.json` → inserts into Postgres

## Schema

Single source: `god-mode/python-api/app/db/schema.sql`

- **God-mode**: leads, scaling_survey_submissions, api_logs, locations, pseo_services, content_matrix
- **Factory**: sites, campaign_masters, avatar_intelligence, geo_intelligence, generation_jobs, generated_articles, pages, posts, etc.

## API Client

Sites use `god-mode/sites/*/src/lib/api/client.ts`:

- `submitLead(payload)` → POST /api/submit-lead
- `submitScalingSurvey(payload)` → POST /api/submit-scaling-survey
- `getHealth()` → GET /

When `PUBLIC_GOD_MODE_API_URL` is set (standalone site like jumpstartscaling.com), all API calls go directly to that URL.

## Coolify Apps

- **JFactory** (port 8100): Serves Astro sites, proxies `/api/*` to god-mode-api
- **god-mode-api** (port 8200): FastAPI + Postgres
- **jumpstartscaling-site**: Standalone Coolify app, uses PUBLIC_GOD_MODE_API_URL
