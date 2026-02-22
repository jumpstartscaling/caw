# JFactory — Coolify Configuration

Use these values to configure the JFactory app in Coolify.

---

## Oracle Reference (What Was Working)

On Oracle (150.136.117.198), the **frontend pages worked**; the backend did not.

| Oracle (PM2)        | Port | URL                        | Status   |
|---------------------|------|----------------------------|----------|
| jumpstart-prod      | 8100 | jumpstartscaling.com       | ✅ Worked |
| chrisamaya-prod     | 8101 | chrisamaya.work            | ✅ Worked |
| god-mode-api        | 8200 | api.jumpstartscaling.com   | ❌ Backend didn't work |

**Oracle routing** (Cloudflare Tunnel → localhost):
- `jumpstartscaling.com` → `http://127.0.0.1:8100`
- `chrisamaya.work` → `http://127.0.0.1:8101`
- `api.jumpstartscaling.com` → `http://127.0.0.1:8200`

**Coolify equivalent:** JFactory = jumpstartscaling + chrisamaya in one container (port 8100). god-mode-api is a separate app (port 8200). See `spare-parts/docs-outdated/ORACLE_SERVER_HANDOFF.md` and `ORACLE_SERVER_SETUP.md`.

---

**Quick configure via API (recommended — sets env vars for both JFactory and god-mode-api):**
```bash
# Requires COOLIFY_TOKEN in .env.local (Coolify → Keys & Tokens)
node scripts/configure-coolify-via-api.mjs          # Configure only
node scripts/configure-coolify-via-api.mjs --deploy # Configure + trigger deploy

# Deploy JFactory fix (router port 8100 + chrisamaya React SSR)
JFACTORY_BRANCH=fix/jfactory-deploy node scripts/configure-coolify-via-api.mjs --deploy
```

**Legacy (JFactory only):** `COOLIFY_TOKEN=xxx ./configure-jfactory-coolify.sh`

---

## General

| Field | Value |
|-------|-------|
| **Name** | JFactory |
| **Description** | God-mode router + jumpstartscaling + chrisamaya sites |
| **Build Pack** | Dockerfile |

**Routing (path-based preview):**
- `factory.jumpstartscaling.com/` → redirects to `/jumpstart/admin`
- `factory.jumpstartscaling.com/jumpstart` → main site (Jumpstart Scaling)
- `factory.jumpstartscaling.com/chrisamaya` → tenant site (Chris Amaya)
- `factory.jumpstartscaling.com/jumpstart/admin` → God Mode admin

---

## Domains

**Preview (path-based):** `factory.jumpstartscaling.com` only — sites at `/jumpstart` and `/chrisamaya`.

**Production (when ready):** Add tenant domains:

| Domain |
|--------|
| `factory.jumpstartscaling.com` |
| `www.factory.jumpstartscaling.com` |
| `chrisamaya.work` (when tenant goes live) |
| `www.chrisamaya.work` |

**Note:** Sites use preview paths until ready for production; then point domain to tenant.

---

## Build

| Field | Value |
|-------|-------|
| **Base Directory** | `god-mode` (JFactory lives in god-mode/ in Spark repo) |
| **Dockerfile Location** | `Dockerfile` |
| **Docker Build Stage Target** | (leave empty) |
| **Custom Docker Options** | (leave empty — remove the long SYS_ADMIN/fuse string; our app doesn't need it) |

---

## Git Source

- **Repository:** `https://github.com/caw-jump/spark`
- **Branch:** `main`

| App | Base Directory |
|-----|----------------|
| JFactory | `god-mode` |
| god-mode-api | `god-mode/python-api` |

---

## jumpstartscaling-site (production, separate app)

**jumpstartscaling.com** runs on a separate Coolify app container. It has no Node router, so form submissions cannot use same-origin `/api`. The API client posts directly to the godmode API when `PUBLIC_GOD_MODE_API_URL` is set.

**Required env var (build-time):**

| Variable | Value |
|----------|-------|
| `PUBLIC_GOD_MODE_API_URL` | `https://api.jumpstartscaling.com` |

Add this in Coolify → jumpstartscaling-site → Environment Variables, then redeploy. This bakes the API URL into the static build so ContactForm and ScalingSurvey POST to `api.jumpstartscaling.com/api/submit-lead` and save to the database.

---

## Environment Variables

Add these (replace placeholders with real values):

| Variable | Value |
|----------|-------|
| `GOD_MODE_API_URL` | `https://api.jumpstartscaling.com` |
| `SITES_BASE_PATH` | `/app` |
| `ADMIN_KEY` | Generate: `openssl rand -hex 24` |
| `PUBLIC_N8N_WEBHOOK` | `https://n8n.jumpstartscaling.com/webhook/d282e622-9c83-4936-9d93-05c37eaa7b68` |

---

## Prerequisites

1. **God-mode API** must be deployed first at `api.jumpstartscaling.com` (separate Coolify app).
2. **DNS (manual):** jumpstartscaling.com uses Namecheap DNS. In Namecheap → Domain List → Manage → Advanced DNS, add A records: `factory` and `www.factory` (or `*.factory`) → your Coolify server IP (e.g. `86.48.23.38`). For chrisamaya.work, add records in its DNS provider.

---

## Manual configuration steps (Coolify UI)

1. **Configuration → General**
   - Build Pack: `Dockerfile`
   - **Git Repository:** `https://github.com/caw-jump/spark`
   - **Branch:** `main`
   - **Base Directory:** `god-mode`
   - Dockerfile Location: `Dockerfile`
   - Custom Docker Options: **clear completely** (delete the SYS_ADMIN/fuse string)

2. **Configuration → Domains**
   - Remove `https://coolify.io`
   - Add: `factory.jumpstartscaling.com`
   - Add: `www.factory.jumpstartscaling.com`
   - Add: `chrisamaya.work`
   - Add: `www.chrisamaya.work`
   - Direction: Allow www & non-www

3. **Configuration → Environment Variables**
   - Add `GOD_MODE_API_URL` = `https://api.jumpstartscaling.com`
   - Add `SITES_BASE_PATH` = `/app`
   - Add `ADMIN_KEY` = (run `openssl rand -hex 24` locally, paste result)
   - Add `PUBLIC_N8N_WEBHOOK` = `https://n8n.jumpstartscaling.com/webhook/d282e622-9c83-4936-9d93-05c37eaa7b68`

4. **Configuration → Advanced** (if present)
   - Port: `8100`

5. **Save** → **Deploy**

---

## Deploy

Click **Deploy** after saving. The first build may take several minutes (builds both Astro sites).

---

## Troubleshooting: 404 on /admin/

If `https://factory.jumpstartscaling.com/admin/` returns 404:

1. **`GOD_MODE_API_URL` not set** — Add `GOD_MODE_API_URL=https://api.jumpstartscaling.com` in JFactory env vars, save, and redeploy. After the change, hitting `/admin/` without it will show a 503 with setup instructions instead of 404.
2. **God-mode API not deployed** — Deploy the `god-mode-api` app first at `api.jumpstartscaling.com`. Test: `curl -I https://api.jumpstartscaling.com/health` should return 200.
3. **Admin login** — Go to `/admin/login` and log in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` (god-mode-api env vars). `ADMIN_KEY` is for API access only (n8n, scripts).

---

## Troubleshooting: "No Available Server" (503)

Traefik can't find healthy containers. This affects both **JFactory** (factory.jumpstartscaling.com) and **god-mode-api** (api.jumpstartscaling.com).

### For JFactory (factory pages):

1. **Port must be 8100** — Coolify → JFactory → Configuration → Advanced → Port: `8100`
2. **Disable health check** — Coolify → JFactory → Configuration → Health Check → turn **Off**. Traefik excludes "unhealthy" containers; health checks often fail and cause "No available server" even when the app works.
3. **Restart proxy** — Coolify → Servers → [Your Server] → Proxy → Restart Proxy (often fixes 503 after a fresh deploy)
4. **Verify locally** — `docker run -p 8100:8100 <image>` then `curl http://localhost:8100/health` should return `{"status":"ok","service":"jfactory-router"}`

### For god-mode-api (api.jumpstartscaling.com returns 503):

**Root cause:** god-mode-api container is **restarting** (crash-loop). Verify via Coolify API or `docker ps` on server.

**Steps:**
1. **Get container logs** — SSH: `ssh root@86.48.23.38` then `docker ps -a | grep -E "d8ws|god-mode-api"` and `docker logs <container-name> --tail 50` to see crash reason.
2. **Fix DATABASE_URL** — Create PostgreSQL in Coolify (Add Resource → Database). Copy internal connection string. Format: `postgresql://USER:PASSWORD@COOLIFY_DB_CONTAINER:5432/god_mode`. Set in god-mode-api env vars.
3. **Or run without DB** — Ensure `python-api` has latest changes (connection timeout, LOG_REQUESTS=false). App starts without DB; DB routes return 503.
4. **Disable health check** — Coolify → god-mode-api → Configuration → Health Check → Off (if health check causes 503).
5. **Restart proxy** — Servers → [Your Server] → Proxy → Restart Proxy.
