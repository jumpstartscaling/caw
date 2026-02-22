# Spark Platform

A powerful multi-tenant website platform with SEO automation, content generation, and lead capture.

## Architecture

Spark uses **god-mode**: a Python FastAPI backend with PostgreSQL (PGVector). No Directus or Django.

- **god-mode/python-api** – FastAPI + Postgres (leads, locations, pSEO, content matrix, factory tables)
- **god-mode/sites** – Astro sites (jumpstartscaling, tenant) with React components
- **god-mode/router.js** – JFactory: serves sites and proxies `/api/*` to god-mode-api
- **exports/** – JSON exports for seeding (geo_intelligence, campaign_masters, etc.)
- **_archive/** – Legacy Directus, scripts, and frontend (kept for reference)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Features

### Multi-Tenant Sites
- jumpstartscaling.com, chrisamaya.work (tenant template)
- Admin at `/admin` (leads, locations, pSEO services, content matrix)
- Forms POST to god-mode API (`submitLead`, `submitScalingSurvey`)

### pSEO Content Engine
- Harris matrix: locations, services, content_matrix
- Content fragments, campaign masters, generation jobs
- Seed from `exports/*.json` via `python-api/scripts/seed_from_exports.py`

### Lead Capture
- Contact forms, Scaling Survey (Moat Audit)
- Stored in `leads` and `scaling_survey_submissions` tables

## Project Structure

```
spark/
├── god-mode/
│   ├── python-api/           # FastAPI + Postgres
│   │   ├── app/db/schema.sql # Single schema source
│   │   ├── app/routers/      # Leads, locations, pSEO, admin
│   │   └── scripts/          # seed_from_exports, run_schema
│   ├── sites/
│   │   ├── jumpstartscaling/ # Astro + React (calculators, tools, admin)
│   │   └── tenant/           # Primary template (chrisamaya.work, etc.)
│   ├── router.js             # JFactory proxy
│   └── scripts/              # Coolify config, run-schema-via-api
├── exports/                  # JSON seed data
├── docs/
└── README.md
```

## Quick Start

### 1. Configure

```bash
cd god-mode
cp .env.example .env.local
# Set DATABASE_URL, COOLIFY_TOKEN, ADMIN_KEY
```

### 2. Run god-mode API locally

```bash
cd god-mode/python-api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8200
```

### 3. Seed from exports

```bash
cd god-mode/python-api
python scripts/seed_from_exports.py
```

### 4. Deploy (Coolify)

```bash
cd god-mode
node scripts/configure-coolify-via-api.mjs --deploy
```

See [god-mode/JFACTORY_COOLIFY_CONFIG.md](god-mode/JFACTORY_COOLIFY_CONFIG.md) for Coolify setup.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/submit-lead` | POST | Submit lead form |
| `/api/submit-scaling-survey` | POST | Submit scaling survey |
| `/api/leads` | GET | List leads |
| `/api/locations` | GET/POST | Harris matrix locations |
| `/api/pseo-services` | GET/POST | pSEO services |
| `/api/content-matrix` | GET | Content matrix |
| `/api/run-schema` | POST | Apply schema (requires ADMIN_KEY) |

## License

MIT License - See LICENSE file for details.

---

Built with Astro, React, FastAPI, and PostgreSQL.
