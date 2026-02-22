# God Mode / JFactory — Tech Stack

Reference for languages, frameworks, infrastructure, and deployment. Companion to [HARRIS_MATRIX.md](./HARRIS_MATRIX.md).

---

## 1. Overview

| Layer | Technology |
|-------|------------|
| **Backend API** | FastAPI (Python 3.x), uvicorn, asyncpg |
| **Database** | PostgreSQL (uuid-ossp extension) |
| **Frontend (admin)** | Astro 5, React 19, Tailwind CSS 4, Vite 6 |
| **Sites** | jumpstartscaling (static), chrisamaya (SSR with React) |
| **Deployment** | Coolify, Docker (node:20-alpine), GitHub (caw-jump/spark) |

---

## 2. Backend — God Mode API

| Component | Version / Package |
|-----------|-------------------|
| Python | 3.11+ (recommended) |
| FastAPI | ≥ 0.109.0 |
| uvicorn | ≥ 0.27.0 |
| asyncpg | ≥ 0.29.0 |
| pydantic | ≥ 2.0.0 |
| python-dotenv | ≥ 1.0.0 |
| passlib[bcrypt] | ≥ 1.7.4 |
| itsdangerous | ≥ 2.1.0 |

**Location:** `god-mode/python-api/`  
**Entry:** `uvicorn app.main:app --host 0.0.0.0 --port 8200`

---

## 3. Frontend — Sites

### jumpstartscaling (Jumpstart Scaling)

| Component | Version |
|-----------|---------|
| Astro | ^5.16.8 |
| output | `static` |
| React | ^19.2.4 |
| Tailwind CSS | ^4.1.18 |
| Vite | ^6.4.1 |
| MDX | @astrojs/mdx ^4.3.13 |

**Location:** `god-mode/sites/jumpstartscaling/`  
**Path:** `/jumpstart` on factory.jumpstartscaling.com

### chrisamaya (Chris Amaya)

| Component | Version |
|-----------|---------|
| Astro | ^5.16.8 |
| output | `server` (SSR) |
| React | ^19.2.4 |
| React DOM | ^19.2.3 |
| Three.js ecosystem | @react-three/fiber, drei, postprocessing |
| Rive, Spline | @rive-app/react-canvas, @splinetool/react-spline |

**Location:** `god-mode/sites/chrisamaya/`  
**Path:** `/chrisamaya` on factory.jumpstartscaling.com; domains chrisamaya.work, www.chrisamaya.work

**SSR requirement:** `chrisamaya/node_modules` must be present at runtime (React, etc.) — Dockerfile copies them.

---

## 4. Router

| Component | Details |
|-----------|---------|
| Runtime | Node 20 |
| Role | Path-based routing: `/jumpstart`, `/chrisamaya`, `/admin`, `/api` |
| Port | 8100 (main), chrisamaya Astro SSR on 8101 |
| Entry | `router.js` → `start.sh` (chrisamaya SSR + router) |

---

## 5. Database

| Component | Details |
|-----------|---------|
| Engine | PostgreSQL |
| Extension | uuid-ossp |
| Connection | DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME |
| Schema | `god-mode/python-api/app/db/schema.sql` |

---

## 6. Deployment — Coolify

| App | Base Dir | Port | Domain(s) |
|-----|----------|------|-----------|
| **JFactory** | `god-mode` | 8100 | factory.jumpstartscaling.com, www.factory.jumpstartscaling.com, chrisamaya.work, www.chrisamaya.work |
| **god-mode-api** | `god-mode/python-api` | 8200 | api.jumpstartscaling.com |

| Build | Details |
|-------|---------|
| Image | node:20-alpine |
| Build pack | Dockerfile |
| Repo | https://github.com/caw-jump/spark |
| Branch | main (configurable via JFACTORY_BRANCH) |

---

## 7. External Integrations

| Service | Purpose |
|---------|---------|
| n8n | Webhooks for lead / automation flows |
| Cloudflare | DNS, tunnels (legacy Oracle setup) |
| Namecheap | DNS for jumpstartscaling.com |

---

## 8. Key File Map

| Purpose | Path |
|---------|------|
| Schema | `python-api/app/db/schema.sql` |
| Admin router | `python-api/app/routers/admin.py` |
| Main API app | `python-api/app/main.py` |
| JFactory Dockerfile | `Dockerfile` |
| Router + start | `router.js`, `start.sh` |
| Coolify config script | `scripts/configure-coolify-via-api.mjs` |
| Harris Matrix | `docs/HARRIS_MATRIX.md` |
