# God Mode API

FastAPI backend for the Spark Platform. Handles leads, scaling surveys, and admin. **Replaces Django.**

## Run locally

```bash
cd python-api
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with DATABASE_URL
uvicorn app.main:app --reload --port 8200
```

## Environment

| Var | Description |
|-----|-------------|
| `DATABASE_URL` | Postgres connection string |
| `ADMIN_KEY` | Key for `/admin/leads?key=...` (default: spark) |
| `PORT` | Server port (default: 8200) |
| `LOG_REQUESTS` | Set to `false` to disable api_logs (default: true) |

## Endpoints

- `GET /` — Health check
- `POST /api/submit-lead` — Lead capture (contact, audit, n8n forms)
- `POST /api/submit-scaling-survey` — Moat Audit survey
- `GET /admin/leads?key=spark` — Leads dashboard (HTML)
- `GET /admin/leads/json?key=spark` — Leads API (JSON)

## Router integration

Set `GOD_MODE_API_URL=http://localhost:8200` (or `https://api.jumpstartscaling.com`) in the router env. The router proxies `/api/*` and `/admin/*` to this API.

## Seeding content (Harris matrix)

Content for pSEO (locations, services, content_matrix) lives in **`spark/exports/`** (Directus exports). After the Harris matrix schema is applied, seed the database:

```bash
python scripts/seed_from_exports.py
```

Options: `--exports-dir /path`, `--dry-run`, `--no-schema` (if tables exist).

## Docker

```bash
docker build -t god-mode-api .
docker run -p 8200:8200 -e DATABASE_URL=... god-mode-api
```
