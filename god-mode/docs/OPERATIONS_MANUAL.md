# God Mode — Operations Manual

Day-to-day procedures, deployment, verification, and troubleshooting. Companion to [HARRIS_MATRIX.md](./HARRIS_MATRIX.md) and [TECH_STACK.md](./TECH_STACK.md).

---

## 1. Pre-Deploy Checklist

- [ ] Schema applied (`POST /api/run-schema` or `run_schema()` locally)
- [ ] `DATABASE_URL` set in god-mode-api (Coolify env vars)
- [ ] `ADMIN_KEY` set for both JFactory and god-mode-api (same value)
- [ ] `GOD_MODE_API_URL=https://api.jumpstartscaling.com` in JFactory env
- [ ] DNS records point to Coolify server (factory, www.factory, chrisamaya.work, api)

---

## 2. Deployment Procedure

### 2.1 Push to GitHub

```bash
cd /path/to/spark
git add -A
git status   # Ensure .env.local not staged
git commit -m "Descriptive message"
git push spark main
```

### 2.2 Configure and Deploy via Coolify API

```bash
cd god-mode
# COOLIFY_TOKEN from Coolify → Keys & Tokens
COOLIFY_TOKEN=xxx node scripts/configure-coolify-via-api.mjs --deploy
```

Or configure only (no deploy):

```bash
node scripts/configure-coolify-via-api.mjs
```

### 2.3 Deploy Specific Branch (JFactory)

```bash
JFACTORY_BRANCH=fix/your-branch node scripts/configure-coolify-via-api.mjs --deploy
```

### 2.4 Monitor Deployment

```bash
# One-time status
node scripts/monitor-coolify-deploy.mjs

# Poll every 15s until done
node scripts/monitor-coolify-deploy.mjs --watch
```

### 2.5 Manual Deploy (Coolify UI)

1. Coolify → JFactory → Deploy
2. Coolify → god-mode-api → Deploy

---

## 3. Schema Management

### 3.1 Apply Schema (Remote)

```bash
curl -X POST "https://api.jumpstartscaling.com/api/run-schema" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

Or with query param:

```bash
curl -X POST "https://api.jumpstartscaling.com/api/run-schema?key=YOUR_ADMIN_KEY"
```

### 3.2 Apply Schema (Local)

```bash
cd god-mode/python-api
# Set DATABASE_URL (e.g. via .env or SSH tunnel)
python -c "
from app.db.connection import run_schema
import asyncio
asyncio.run(run_schema())
"
```

### 3.3 Schema File

Location: `god-mode/python-api/app/db/schema.sql`  
Order: Foundation → Walls → Analytics → System → Assembly Line (per Harris Matrix)

---

## 4. Verification

### 4.1 Health Checks

| Endpoint | Expected |
|----------|----------|
| `GET https://factory.jumpstartscaling.com/health` | `{"status":"ok","service":"jfactory-router"}` |
| `GET https://api.jumpstartscaling.com/health` | `{"status":"ok"}` |

### 4.2 Admin Pages Load

- [ ] `https://factory.jumpstartscaling.com/jumpstart/admin` — admin dashboard
- [ ] `https://factory.jumpstartscaling.com/chrisamaya` — chrisamaya site
- [ ] `https://api.jumpstartscaling.com/admin/leads` — leads HTML
- [ ] `https://api.jumpstartscaling.com/api/counts` — JSON counts

### 4.3 Dashboard Stats

- [ ] Counts show numbers (0 when empty, not "?")
- [ ] No "API error" or blank lists on admin pages

---

## 5. Troubleshooting

### 5.1 "No Available Server" (503)

**Cause:** Traefik can’t find healthy containers.

**JFactory:**
1. Port must be 8100 (Coolify → JFactory → Configuration → Advanced)
2. Optionally disable Health Check (Configuration → Health Check → Off)
3. Restart proxy: Coolify → Servers → [Server] → Proxy → Restart Proxy
4. Verify container: `docker run -p 8100:8100 <image>` then `curl http://localhost:8100/health`

**god-mode-api:**
1. Check container logs for crash (Coolify logs or `docker logs <container>`)
2. Ensure DATABASE_URL is set if DB routes are used
3. Disable Health Check if it fails; app can start without DB
4. Restart proxy

### 5.2 Dockerfile: no such file or directory

**Cause:** Coolify looks for `Dockerfile` at repo root, but JFactory’s Dockerfile is in `god-mode/`.

**Fix:** JFactory must have Base Directory = `god-mode`. Run:
```bash
node scripts/configure-coolify-via-api.mjs --deploy
```
The script sets `base_directory: 'god-mode'`. Or set it manually in Coolify → JFactory → Configuration → Base Directory.

### 5.3 chrisamaya.work — SSR Tenant (8101)

**chrisamaya** runs as an Astro SSR server on port 8101. The router resolves chrisamaya.work via `GET /api/sites/resolve?domain=chrisamaya.work` (60s TTL cache) and proxies to 127.0.0.1:8101 with `x-tenant-site-id`, `x-tenant-domain`, `x-tenant-theme-config`. No per-domain redeploy needed.

**Seed chrisamaya** (site, campaign, posts, pSEO foundation):
```bash
cd god-mode/python-api && python scripts/seed_chrisamaya.py
```
Requires `DATABASE_URL`. Idempotent; safe to re-run. Seeds locations, pseo_services, spintax, synonym_groups, offer_blocks, geo_intelligence, content_matrix. See [FACTORY_OVERVIEW.md](docs/FACTORY_OVERVIEW.md).

### 5.4 Traefik Catch-All (Zero-Redeploy New Tenants)

To add a new tenant without redeploying JFactory: add the site in DB (Sites admin), then add a Cloudflare A record to Coolify IP. No Coolify domain config needed. Router resolves unknown domains via API and proxies to the SSR tenant server.

### 5.5 ERR_MODULE_NOT_FOUND: Cannot find package 'react'

**Cause:** chrisamaya SSR runs but `node_modules` (React, etc.) not in final image.

**Fix:** Dockerfile must copy chrisamaya node_modules:

```dockerfile
COPY --from=builder-js /app/sites/chrisamaya/node_modules ./sites/chrisamaya/node_modules
```

Verify `start.sh` runs from `/app/sites/chrisamaya` so Node resolves `./node_modules`.

### 5.6 404 on /admin/

1. `GOD_MODE_API_URL` set in JFactory env
2. god-mode-api deployed and healthy at api.jumpstartscaling.com
3. Use `/jumpstart/admin` or `/admin` as configured in router

### 5.7 Database 503

- `DATABASE_URL` missing or wrong in god-mode-api
- Create Postgres in Coolify (Add Resource → Database), copy connection string
- Or run without DB: API starts; DB routes return 503

### 5.8 Build Fails (Docker)

- Check base directory: JFactory = `god-mode`, god-mode-api = `god-mode/python-api`
- Ensure `Dockerfile` exists in base dir
- Check GitHub branch (main vs feature branch)
- Inspect Coolify build logs for npm/python errors

---

## 6. Environment Variables

### JFactory

| Variable | Required | Purpose |
|----------|----------|---------|
| GOD_MODE_API_URL | Yes | https://api.jumpstartscaling.com |
| SITES_BASE_PATH | Yes | /app |
| ADMIN_KEY | Yes | Synced with god-mode-api |
| PUBLIC_N8N_WEBHOOK | No | n8n webhook URL |
| SSR_TENANT_PORT | No | 8101 (chrisamaya SSR) |

### god-mode-api

| Variable | Required | Purpose |
|----------|----------|---------|
| DATABASE_URL | Recommended | PostgreSQL connection string |
| ADMIN_KEY | Yes | API/admin auth |
| PORT | No | 8200 (default) |
| LOG_REQUESTS | No | true for Debug panel (logs to api_logs) |
| ADMIN_USERNAME | No | Session login |
| ADMIN_PASSWORD | No | Session login |
| SESSION_SECRET | No | Change in production |
| DEBUG | No | false |

---

## 7. Assembly Line Operations

### Bulk Delete Articles

```bash
curl -X POST "https://api.jumpstartscaling.com/api/generated-articles/bulk-delete" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \
  -d '{"ids":["uuid1","uuid2"]}'
```

### Create Generation Job

```bash
curl -X POST "https://api.jumpstartscaling.com/api/generation-jobs" \
  -H "Content-Type: application/json" \
  -d '{"site_id":"uuid","campaign_id":"uuid","target_quantity":100,"source_type":"new"}'
```

### Move Article to Station (PATCH)

```bash
curl -X PATCH "https://api.jumpstartscaling.com/api/generated-articles/{uuid}" \
  -H "Content-Type: application/json" \
  -d '{"status":"review"}'
```

---

## 8. Auto-Rotation (content_refresh_schedule)

| Field | Purpose |
|-------|---------|
| schedule_cron | Cron expression (e.g. `0 2 * * *` daily 2am) |
| refresh_mode | light, full, meta_only |
| min_age_days | Don’t refresh articles younger than this |
| is_active | Enable/disable schedule |

Worker (external) reads `content_refresh_schedule`, queues redo jobs, updates `last_refreshed_at` and `refresh_count`. Fully automated; no manual step required once configured.

---

## 9. Key File Locations

| Purpose | Path |
|---------|------|
| Schema | `python-api/app/db/schema.sql` |
| Coolify config | `scripts/configure-coolify-via-api.mjs` |
| JFactory config | `JFACTORY_COOLIFY_CONFIG.md` |
| Harris Matrix | `docs/HARRIS_MATRIX.md` |
| Tech Stack | `docs/TECH_STACK.md` |
| Codebook | `docs/CODEBOOK.md` |
| Tenant pSEO Checklist | `docs/TENANT_PSEO_CHECKLIST.md` |
| Factory Overview | `docs/FACTORY_OVERVIEW.md` |
