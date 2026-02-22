# INVESTOR BRIEF: Spark Platform

> **BLUF**: Spark is a multi-tenant content scaling platform that generates location-targeted SEO articles using spintax permutation and Cartesian pattern matching. Current capacity: 50,000+ unique articles per campaign configuration.

---

## 1. Platform Function

Spark automates SEO content production at scale. The system:
1. Ingests buyer personas (Avatars), location data, and content templates
2. Computes Cartesian products of location × persona × offer variations
3. Generates unique articles with geo-specific and persona-specific content
4. Manages multi-site content distribution with scheduling controls

**Core Problem Solved**: Manual SEO content creation produces ~2-5 articles/day. Spark produces 100-500 articles/hour with equivalent uniqueness and targeting precision.

---

## 2. Technical Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | Astro | 4.7 | SSR + Islands Architecture |
| UI | React | 18.3 | Interactive components |
| Backend | Directus | 11 | Headless CMS + REST/GraphQL |
| Database | PostgreSQL | 16 | Primary data store |
| Extensions | PostGIS | 3.4 | Geographic queries |
| Cache | Redis | 7 | Session + job queue backing |
| Queue | BullMQ | - | Async job processing |
| Deployment | Coolify | - | Docker orchestration |

**Infrastructure**: Self-hostable via Docker Compose. No external SaaS dependencies.

---

## 3. Data Assets

### 3.1 Location Database
| Dataset | Count | Source |
|---------|-------|--------|
| US States | 51 | Census data |
| US Counties | 3,143 | Census data |
| US Cities | ~50 per county | Population-ranked |

### 3.2 Intelligence Assets
| Asset Type | Description | IP Value |
|------------|-------------|----------|
| Avatar Intelligence | 10+ buyer personas with psychographics | Proprietary |
| Wealth Clusters | 5+ economic profile groupings | Proprietary |
| Spintax Dictionaries | Word/phrase variation libraries | Proprietary |
| Cartesian Patterns | Title/hook formula combinations | Proprietary |
| Offer Blocks | 10+ promotional templates | Proprietary |

---

## 4. Capacity Metrics

### 4.1 Theoretical Maximum
```
10 Avatars × 10 Niches × 50 Cities × 10 Offers = 50,000 unique articles
```

### 4.2 Practical Campaign
```
2 Avatars × 3 Niches × 10 Cities × 2 Offers = 120 articles
```

### 4.3 Generation Speed
| Operation | Throughput |
|-----------|------------|
| Headline permutation | 1,000/second |
| Article assembly | 100-500/hour |
| Queue processing | Configurable batch size |

---

## 5. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                              │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  TRAEFIK (Reverse Proxy)                                        │
│  Routes by domain/path to containers                            │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
┌───────────────┐                    ┌───────────────┐
│  FRONTEND     │                    │  DIRECTUS     │
│  Astro SSR    │◄──── REST API ────►│  Port 8055    │
│  Port 4321    │                    │  Headless CMS │
└───────────────┘                    └───────┬───────┘
                                             │
                                             ▼
                         ┌───────────────────────────────────┐
                         │  POSTGRESQL 16 + POSTGIS          │
                         │  30+ Collections                  │
                         │  Harris Matrix Schema Order       │
                         └───────────────────┬───────────────┘
                                             │
                                             ▼
                         ┌───────────────────────────────────┐
                         │  REDIS 7                          │
                         │  Session Cache + BullMQ Jobs      │
                         └───────────────────────────────────┘
```

---

## 6. Multi-Tenancy Model

| Isolation Level | Implementation |
|-----------------|----------------|
| Data | `site_id` FK on all content tables |
| Routes | Domain-based routing via Traefik |
| Authentication | Directus role-based access control |
| Permissions | Site-scoped API tokens |

**Tenant capacity**: Unlimited sites. Horizontal scaling via Docker replicas.

---

## 7. Feature Inventory

### 7.1 Intelligence Library (Data Management)
- Avatar Intelligence Manager
- Geo Intelligence Map (Leaflet integration)
- Spintax Dictionary Manager
- Cartesian Pattern Builder

### 7.2 Content Factory (Production)
- Kanban workflow board
- Campaign wizard (geo + spintax modes)
- Jobs queue with progress monitoring
- Scheduler with Gaussian distribution

### 7.3 Launchpad (Site Builder)
- Multi-site management
- Block-based page builder
- Navigation editor
- Theme customization

### 7.4 SEO Engine (Optimization)
- Headline generation (spintax permutation)
- Fragment assembly (6-pillar structure)
- Internal link insertion
- Duplicate content detection
- Sitemap drip scheduling

### 7.5 Analytics (Tracking)
- Pageview tracking
- Event tracking
- Conversion tracking
- Dashboard with aggregations

---

## 8. Competitive Position

| Capability | Spark | Generic CMS | AI Writers |
|------------|-------|-------------|------------|
| Multi-tenant | ✓ | Partial | ✗ |
| Geo-targeting | ✓ (3,143 counties) | ✗ | ✗ |
| Persona-targeting | ✓ (10+ avatars) | ✗ | Limited |
| Spintax processing | ✓ | ✗ | ✗ |
| Cartesian patterns | ✓ | ✗ | ✗ |
| Self-hostable | ✓ | Varies | ✗ |
| Queue-based scaling | ✓ | ✗ | ✗ |

---

## 9. Revenue Model Indicators

| Model | Mechanism |
|-------|-----------|
| SaaS per site | Monthly fee per managed site |
| Volume pricing | Tiered by articles generated |
| Enterprise | Self-hosted license + support |
| White-label | Reseller partnerships |

---

## 10. Development Status

| Milestone | Status | Description |
|-----------|--------|-------------|
| M1: Intelligence Library | ✓ Complete | Full CRUD + stats |
| M2: Content Factory | ✓ Complete | Kanban + queue |
| M3: All Collections | ✓ Complete | 30+ schemas |
| M4: Launchpad | ✓ Complete | Site builder |
| M5: Production | ✓ Deployed | Live on Coolify |

**Current Status**: Operational. Active development on feature enhancements.

---

## 11. Key Files

| File | Purpose |
|------|---------|
| `complete_schema.sql` | Golden Schema (Harris Matrix ordered) |
| `docker-compose.yaml` | Infrastructure definition |
| `frontend/src/lib/schemas.ts` | TypeScript type definitions |
| `frontend/src/pages/api/*` | 30+ API endpoints |
