# CTO ONBOARDING: Spark Platform Technical Leadership Guide

> **BLUF**: Spark is a multi-tenant content scaling platform. 30+ PostgreSQL tables, 30+ API endpoints, 182 React components. Self-hosted via Docker Compose on Coolify. This document provides the 30,000ft view for technical leadership.

---

## 1. System Overview

### 1.1 What Spark Does
1. Ingests buyer personas, location data, content templates
2. Computes Cartesian products of variations
3. Generates unique SEO articles at scale
4. Manages multi-site content distribution

### 1.2 Key Metrics
| Metric | Value |
|--------|-------|
| Max articles per campaign config | 50,000+ |
| Database collections | 30+ |
| API endpoints | 30+ |
| React components | 182 |
| Admin pages | 25 directories |

---

## 2. Repository Structure

```
spark/
├── frontend/                 # Astro SSR + React
│   ├── src/
│   │   ├── components/      # 182 React components
│   │   │   ├── admin/      # Admin dashboard (95 files)
│   │   │   ├── blocks/     # Page builder (25 files)
│   │   │   ├── ui/         # Shadcn-style (18 files)
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── admin/      # 25 admin directories
│   │   │   ├── api/        # 15 API directories
│   │   │   └── preview/    # 4 preview routes
│   │   ├── lib/
│   │   │   ├── directus/   # SDK client, fetchers
│   │   │   └── schemas.ts  # TypeScript types
│   │   └── hooks/          # React hooks
│   ├── Dockerfile
│   └── package.json
│
├── directus-extensions/      # Custom Directus code
│   ├── endpoints/           # 4 custom endpoints
│   └── hooks/              # 2 event hooks
│
├── docs/                     # Documentation (this folder)
├── scripts/                  # Utility scripts
├── complete_schema.sql       # Golden Schema
├── docker-compose.yaml       # Infrastructure
└── start.sh                  # Directus startup
```

---

## 3. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Frontend | Astro | 4.7 | SSR + Islands = optimal performance |
| UI | React | 18.3 | Component ecosystem, team familiarity |
| Styling | Tailwind | 3.4 | Utility-first, fast iteration |
| State | React Query | 5.x | Server state management, caching |
| Backend | Directus | 11 | Headless CMS, auto-generated API |
| Database | PostgreSQL | 16 | ACID, JSON support, extensible |
| Geo | PostGIS | 3.4 | Spatial queries for location data |
| Cache | Redis | 7 | Session + queue backing store |
| Queue | BullMQ | - | Robust job processing |
| Deploy | Coolify | - | Self-hosted PaaS, Docker-native |

---

## 4. Database Schema Summary

### 4.1 Creation Order (Harris Matrix)

| Batch | Description | Tables |
|-------|-------------|--------|
| 1: Foundation | Zero dependencies | sites, campaign_masters, avatar_intelligence, avatar_variants, cartesian_patterns, geo_intelligence, offer_blocks |
| 2: Walls | Depend on Batch 1 | generated_articles, generation_jobs, pages, posts, leads, headline_inventory, content_fragments |
| 3: Roof | Complex dependencies | link_targets, globals, navigation, work_log, hub_pages, forms, form_submissions, site_analytics, events, pageviews, conversions, locations_* |

### 4.2 Parent Tables

| Table | Purpose | Children |
|-------|---------|----------|
| `sites` | Multi-tenant root | 10+ tables reference via `site_id` |
| `campaign_masters` | Campaign config | 3 tables reference via `campaign_id` |

### 4.3 Key Relationships

```
sites ──┬── pages
        ├── posts
        ├── generated_articles
        ├── leads
        ├── navigation
        ├── globals (singleton per site)
        └── site_analytics

campaign_masters ──┬── headline_inventory
                   ├── content_fragments
                   └── generated_articles
```

Full schema: See `docs/DATABASE_SCHEMA.md`

---

## 5. API Surface

### 5.1 Public Endpoints (No Auth)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/lead` | POST | Lead form submission |
| `/api/forms/submit` | POST | Generic form handler |
| `/api/track/*` | POST | Analytics tracking |

### 5.2 Admin Endpoints (Token Required)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/seo/generate-*` | POST | Content generation |
| `/api/seo/approve-batch` | POST | Workflow advancement |
| `/api/campaigns` | GET/POST | Campaign CRUD |
| `/api/admin/*` | Various | Administrative ops |

### 5.3 God-Mode Endpoints (Elevated Token)

| Endpoint | Purpose |
|----------|---------|
| `/god/schema/collections/create` | Create new collection |
| `/god/schema/snapshot` | Export schema YAML |
| `/god/data/bulk-insert` | Mass data insert |

Full API reference: See `docs/API_REFERENCE.md`

---

## 6. Extension Points

### 6.1 Adding New Features

| Extension Type | Location | Process |
|---------------|----------|---------|
| New Collection | `complete_schema.sql` | Add table, update schemas.ts, add admin page |
| New API Endpoint | `frontend/src/pages/api/` | Export async handler |
| New Admin Page | `frontend/src/pages/admin/` | Create .astro file, add component |
| New Block Type | `frontend/src/components/blocks/` | Create component, register in BlockRenderer |
| New Directus Extension | `directus-extensions/` | Add endpoint or hook, restart container |

### 6.2 Schema Modification Process

1. Update `complete_schema.sql` (maintain Harris Matrix order)
2. Update `frontend/src/lib/schemas.ts` (TypeScript types)
3. Run `npm run build` to verify types
4. Deploy with `FORCE_FRESH_INSTALL=true` (CAUTION: wipes DB)

### 6.3 API Modification Process

1. Create/edit file in `frontend/src/pages/api/`
2. Export handler: `export async function POST({ request })`
3. Test locally: `npm run dev`
4. Update `docs/API_REFERENCE.md`
5. Git push triggers deploy

---

## 7. Security Model

### 7.1 Authentication Layers

| Layer | Method | Protection |
|-------|--------|------------|
| Directus Admin | Email/Password | Full CMS access |
| API Tokens | Static Bearer | Scoped collection access |
| God-Mode | X-God-Token header | Schema operations only |
| Public | No auth | Read-only published content |

### 7.2 Multi-Tenant Isolation

- All content tables have `site_id` FK
- Queries filter by `site_id` automatically
- No cross-tenant data leakage possible via standard API

### 7.3 CORS Configuration

```yaml
CORS_ORIGIN: 'https://spark.jumpstartscaling.com,https://launch.jumpstartscaling.com,http://localhost:4321'
```

Modify in `docker-compose.yaml` for additional origins.

---

## 8. Performance Considerations

### 8.1 Current Optimizations

| Area | Technique |
|------|-----------|
| SSR | Islands Architecture (minimal JS) |
| Database | Indexed FKs, status fields |
| API | Field selection, pagination |
| Build | Brotli compression, code splitting |

### 8.2 Scaling Paths

| Constraint | Solution |
|------------|----------|
| Database load | Read replicas, connection pooling |
| API throughput | Horizontal frontend replicas |
| Queue depth | Additional BullMQ workers |
| Storage | Object storage (S3-compatible) |

### 8.3 Known Bottlenecks

| Area | Issue | Mitigation |
|------|-------|------------|
| Article generation | CPU-bound spintax | Parallelized in BullMQ |
| Large campaigns | Memory for Cartesian | Streaming/batched processing |
| Image generation | Canvas rendering | Queue-based async |

---

## 9. Operational Runbook

### 9.1 Deployment

```bash
git push origin main  # Coolify auto-deploys
```

### 9.2 Logs Access

Via Coolify UI: Services → [container] → Logs

### 9.3 Database Access

```bash
# Via Coolify terminal
docker exec -it [postgres-container] psql -U postgres -d directus
```

### 9.4 Fresh Install (CAUTION)

Set in Coolify environment:
```
FORCE_FRESH_INSTALL=true
```
Deploys, wipes DB, runs schema. **Data loss warning**.

### 9.5 Health Checks

| Service | Endpoint | Expected |
|---------|----------|----------|
| Directus | `/server/health` | 200 OK |
| Frontend | `/` | 200 OK |

---

## 9A. Stability Patch & Permissions Protocol

### 9A.1 The Foundation Gap (RESOLVED)

**Issue**: TypeScript referenced 28 collections but SQL schema only had 15 tables.

**Solution**: Stability Patch v1.0 added 13 missing tables to `complete_schema.sql`:

| Category | Tables Added |
|----------|-------------|
| Analytics | site_analytics, events, pageviews, conversions |
| Geo-Intelligence | locations_states, locations_counties, locations_cities |
| Lead Capture | forms, form_submissions |
| Site Builder | navigation, globals, hub_pages |
| System | work_log |

### 9A.2 Permissions Grant Protocol

**Issue**: Creating tables in PostgreSQL does NOT grant Directus permissions. Admin sees empty sidebar.

**Solution**: `complete_schema.sql` now includes automatic permission grants.

**What it does**:
```sql
DO $$
DECLARE
    admin_policy_id UUID := (
        SELECT id FROM directus_policies 
        WHERE name = 'Administrator' 
        LIMIT 1
    );
BEGIN
    -- Grants CRUD to all 13 new collections
    INSERT INTO directus_permissions (policy, collection, action, ...) VALUES
    (admin_policy_id, 'forms', 'create', ...),
    (admin_policy_id, 'forms', 'read', ...),
    ...
END $$;
```

### 9A.3 Fresh Install Includes Everything

When deploying with `FORCE_FRESH_INSTALL=true`:

1. ✅ 28 tables created (Foundation → Walls → Roof + Stability Patch)
2. ✅ Directus UI configured (dropdowns, display templates)
3. ✅ Admin permissions auto-granted for all collections

### 9A.4 Manual Patch (For Existing Databases)

If you need to add the new tables to an existing database WITHOUT wiping:

```bash
# Connect to PostgreSQL
docker exec -it [postgres-container] psql -U postgres -d directus

# Run just the Stability Patch section (lines 170-335 of complete_schema.sql)
# Then run the Permissions Protocol section (lines 610-709)
```

### 9A.5 Verification

After patching, verify in Directus Admin:

1. **Settings → Data Model** should show all 28 collections
2. **Content → Forms** should be accessible
3. **Content → Analytics → Events** should be accessible
4. **Content → Locations → States** should be accessible

## 10. Critical Files

| File | Purpose | Change Impact |
|------|---------|---------------|
| `complete_schema.sql` | Database schema | Requires fresh install |
| `docker-compose.yaml` | Infrastructure | Requires redeploy |
| `frontend/src/lib/schemas.ts` | TypeScript types | Build failure if wrong |
| `frontend/src/lib/directus/client.ts` | API client | Connectivity issues |
| `start.sh` | Directus boot | Startup failure |

---

## 11. Team Onboarding Checklist

### For New Developers
- [ ] Clone repo, run `npm install` in frontend
- [ ] Copy `.env.example` to `.env`
- [ ] Run `docker-compose up -d` (or connect to staging)
- [ ] Run `npm run dev` in frontend
- [ ] Access `http://localhost:4321/admin`
- [ ] Read `docs/DEVELOPER_GUIDE.md`

### For Technical Leadership
- [ ] Review this document
- [ ] Review `docs/TECHNICAL_ARCHITECTURE.md`
- [ ] Review `docs/DATABASE_SCHEMA.md`
- [ ] Access Coolify dashboard
- [ ] Access Directus admin
- [ ] Review deployment history in Coolify
