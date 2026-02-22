# Coolify Deployment Guide - "Quick Fix" Method

## Environment Variables (Add in Coolify UI)

```
ADMIN_EMAIL=admin@sparkplatform.com
ADMIN_PASSWORD=SecurePass2024!Change
DB_USER=sparkuser
DB_PASSWORD=DbPass2024!Change
DB_DATABASE=directus
KEY=nGs2S6Ue/tl03SNao1BIkXPxQtoEIZoUs+roKurD3UlSK8x9XrjyKySWf7tr0ABPkH7SB9wEzYnCDEX4ycB01Q==
SECRET=bVu+i1Yqp6aoxpe/o0ySfeE4GSAQCdlitOVCBZklQFcayXPQ1Nwc5jhLUjjrSIJsI1CH6UyRMsLo/fVSIf997w==
DIRECTUS_ADMIN_TOKEN=
```

## Deployment Steps

1. **In Coolify:** Create new Docker Compose deployment
2. **Paste the docker-compose.yaml** from this repo
3. **Add environment variables** (above)
4. **CRUCIAL:** After saving, go to **Service Configuration**:
   - For `directus` service: Set domain to `spark.jumpstartscaling.com`
   - For `frontend` service: Set domain to `launch.jumpstartscaling.com`
5. **Deploy!**

## Login

- URL: https://spark.jumpstartscaling.com
- Email: `admin@sparkplatform.com`
- Password: `SecurePass2024!Change`

---

# "Pro" Method (Recommended for Production)

## Why Split Services?

- ✅ Automated database backups to S3/R2
- ✅ Independent scaling
- ✅ Data persists even if you delete the app
- ✅ One-click version upgrades

## Architecture

1. **PostgreSQL** (Coolify Managed Database)
2. **Redis** (Coolify Managed Database)
3. **Directus** (Docker Service)
4. **Frontend** (Public Repository)

## Setup Steps

### 1. Create Databases

**PostgreSQL:**
- Coolify → Add Resource → PostgreSQL
- After creation: Settings → Change image to `postgis/postgis:16-3.4-alpine`
- Note the internal URL (e.g., `tcp://uuid:5432`)

**Redis:**
- Coolify → Add Resource → Redis
- Note the internal URL (e.g., `tcp://uuid:6379`)

### 2. Deploy Directus

- Add Resource → Docker-based
- **Environment Variables:**
  ```
  KEY=nGs2S6Ue/tl03SNao1BIkXPxQtoEIZoUs+roKurD3UlSK8x9XrjyKySWf7tr0ABPkH7SB9wEzYnCDEX4ycB01Q==
  SECRET=bVu+i1Yqp6aoxpe/o0ySfeE4GSAQCdlitOVCBZklQFcayXPQ1Nwc5jhLUjjrSIJsI1CH6UyRMsLo/fVSIf997w==
  ADMIN_EMAIL=admin@sparkplatform.com
  ADMIN_PASSWORD=SecurePass2024!Change
  DB_CLIENT=postgres
  DB_HOST=<postgres-internal-host>
  DB_PORT=5432
  DB_DATABASE=directus
  DB_USER=<from-postgres-service>
  DB_PASSWORD=<from-postgres-service>
  PUBLIC_URL=https://spark.jumpstartscaling.com
  CORS_ENABLED=true
  CORS_ORIGIN=https://launch.jumpstartscaling.com
  ```
- **Domain:** `spark.jumpstartscaling.com`

### 3. Deploy Frontend

- Add Resource → Public Repository
- Point to: `https://gitthis.jumpstartscaling.com/gatekeeper/net.git`
- **Build Pack:** Nixpacks or Dockerfile
- **Build Environment Variables:**
  ```
  PUBLIC_DIRECTUS_URL=https://spark.jumpstartscaling.com
  PUBLIC_PLATFORM_DOMAIN=launch.jumpstartscaling.com
  ```
- **Domain:** `launch.jumpstartscaling.com`

## Traffic Flow

```
User Browser → launch.jumpstartscaling.com (Frontend)
             → spark.jumpstartscaling.com (Directus API)
             
Directus → tcp://postgres-uuid:5432 (Internal)
        → tcp://redis-uuid:6379 (Internal)
```

## Next Steps

Would you like me to help migrate your existing data from the docker-compose volumes to Coolify Managed Databases?
