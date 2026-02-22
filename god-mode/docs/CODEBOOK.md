# God Mode — Codebook

Definitions for tables, columns, status values, API conventions, and JSONB structures. Companion to [HARRIS_MATRIX.md](./HARRIS_MATRIX.md).

---

## 1. Status Enums

### generation_jobs.status

| Value | Meaning |
|-------|---------|
| `pending` | Job queued, not yet started |
| `running` | Worker is processing |
| `completed` | Finished successfully |
| `failed` | Error during processing |

### generated_articles.status

| Value | Meaning |
|-------|---------|
| `queued` | Waiting for generation |
| `drafting` | Generation in progress |
| `review` | Ready for human review |
| `approved` | Approved for publish |
| `published` | Live on site |
| `archived` | Hidden / removed from rotation |

### sites.status, campaign_masters.status

| Value | Meaning |
|-------|---------|
| `active` | In use |
| `inactive` | Paused or disabled |
| `draft` | Not yet live |

### scheduled_tasks.status

| Value | Meaning |
|-------|---------|
| `pending` | Scheduled, not run |
| `running` | Executing |
| `completed` | Done |
| `failed` | Error |
| `cancelled` | Cancelled |

### content_refresh_schedule.refresh_mode

| Value | Meaning |
|-------|---------|
| `light` | Minor edits, keep structure |
| `full` | Full regeneration |
| `meta_only` | Only meta_title, meta_description, schema_json |

---

## 2. Table Field Reference

### Foundation (no FKs to new tables)

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| **sites** | id | UUID | Primary key |
| | status | VARCHAR(50) | active, inactive, draft |
| | name | VARCHAR(255) | Display name |
| | url | VARCHAR(500) | Base URL |
| | theme_config | JSONB | palette, content_structure, scripts — see below |
| **avatar_intelligence** | avatar_key | VARCHAR(255) | Identifier for avatar |
| | base_name | VARCHAR(255) | Human-readable name |
| | wealth_cluster | VARCHAR(255) | Income/wealth segment |
| | business_niches | JSONB | Array of niches |
| | data | JSONB | Extra avatar attributes |
| **avatar_variants** | avatar_key | VARCHAR(255) | Links to avatar_intelligence |
| | variant_type | VARCHAR(100) | default, premium, etc. |
| | data | JSONB | Variant-specific overrides |
| **geo_intelligence** | cluster_key | VARCHAR(255) | Geo cluster identifier |
| | data | JSONB | Geo attributes |
| **cartesian_patterns** | pattern_key | VARCHAR(255) | Pattern identifier |
| | pattern_type | VARCHAR(100) | Pattern category |
| | data | JSONB | Pattern config |
| **spintax_dictionaries** | category | VARCHAR(255) | Spintax category |
| | data | JSONB | Array of spin options `[]` |
| **offer_blocks** | block_type | VARCHAR(100) | CTA, testimonial, etc. |
| | avatar_key | VARCHAR(255) | Optional avatar tie-in |
| | data | JSONB | Block content |
| **page_blocks** | block_type | VARCHAR(100) | Block type |
| | name | VARCHAR(255) | Block name |
| | data | JSONB | Block content |
| **synonym_groups** | category | VARCHAR(255) | Synonym category |
| | terms | JSONB | Array of interchangeable terms `[]` |

### Walls (depend on sites or campaign_masters)

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| **campaign_masters** | site_id | UUID FK | Parent site |
| | headline_spintax_root | TEXT | Root spintax template |
| | target_word_count | INTEGER | Default 1500 |
| | niche_variables | JSONB | Campaign variables |
| **generation_jobs** | site_id, campaign_id | UUID FK | Scope |
| | target_quantity | INTEGER | Number of articles to generate |
| | progress | INTEGER | Articles produced so far |
| | source_type | VARCHAR(20) | `new` or `redo` |
| | source_article_ids | JSONB | For redo: article UUIDs |
| | filters | JSONB | Generation filters |
| | current_offset | INTEGER | Pagination for job |
| **generated_articles** | uniqueness_score | DECIMAL | Must be ≥ 80 (worker enforced) |
| | readability_score | DECIMAL | Flesch-Kincaid or similar |
| | generation_hash | VARCHAR(255) | Dedupe / change detection |
| | last_refreshed_at | TIMESTAMP | Auto-rotation tracking |
| | refresh_count | INTEGER | Number of refreshes |
| | is_published | BOOLEAN | Live flag |
| | sync_status, sitemap_status | VARCHAR(50) | External sync state |
| **headline_inventory** | used_on_article | UUID FK | Links to generated_articles |
| **article_usage** | article_id | UUID FK | generated_articles |
| | component_type | VARCHAR(50) | fragment, headline, etc. |
| | component_id | TEXT | ID of used component |
| | slot | INTEGER | Position in article |

---

## 3. JSONB Structures

### avatar_intelligence.data, avatar_variants.data

```json
{
  "demographics": {},
  "pain_points": [],
  "goals": [],
  "custom": {}
}
```

### spintax_dictionaries.data

```json
["Option A", "Option B", "Option C"]
```

### synonym_groups.terms

```json
["term1", "term2", "term3"]
```

### generation_jobs.filters

```json
{
  "status": ["queued", "drafting"],
  "campaign_id": "uuid",
  "limit": 100
}
```

### generation_jobs.source_article_ids (redo jobs)

```json
["uuid1", "uuid2", "uuid3"]
```

### scheduled_tasks.payload

```json
{
  "target_quantity": 50,
  "campaign_id": "uuid",
  "source_type": "new"
}
```

### content_matrix.content_json

```json
{
  "sections": [],
  "headings": [],
  "cta": {}
}
```

### leads.data_json, scaling_survey_submissions.raw_data

Free-form: UTM params, industry, team_size, challenges, etc.

### sites.theme_config

```json
{
  "palette": "emerald",
  "content_structure": {
    "section_ids": { "hero": "hero", "about": "about", "services": "services", "faq": "faq", "contact": "contact", "survey": "survey" },
    "section_classes": { "default": "section dark", "alternate": "section light", "hero_full": "section section-hero section-hero-full" },
    "content_blocks": ["hero", "features", "cta", "faq", "contact", "calculator", "survey"]
  },
  "scripts": ["scroll-progress", "particles", "animation-observer", "clarity", "gtag"]
}
```

Palettes: `gold`, `emerald`, `sapphire`, `amber`, `rose`, `violet`, `slate`, `cyan`. Resolve returns `theme_config`; router passes it as `x-tenant-theme-config` (base64) to SSR.

---

## 4. API Conventions

### Auth (Admin Endpoints)

| Method | Header | Query | Use |
|--------|--------|-------|-----|
| X-Admin-Key | `X-Admin-Key: <ADMIN_KEY>` | - | Scripts, n8n |
| key | - | `?key=<ADMIN_KEY>` | Run-schema, one-off |

Protected: `POST /api/run-schema`

### List Endpoints (GET)

| Pattern | Example | Default limit |
|---------|---------|---------------|
| `/api/<resource>` | `/api/leads` | 50–200 |
| Query: `limit`, `offset` | `?limit=100&offset=0` | Varies |
| `/api/sites/resolve?domain=` | Resolve domain → site_id, theme_config (TTL 60s) | - |
| `/api/posts?site_id=` | Posts filtered by site | 200 |
| `/api/public/posts?site_url=` | Published posts for site (no auth) | 100 |

### Create (POST)

| Pattern | Body |
|---------|------|
| `/api/content-fragments` | `{ campaign_id, fragment_type, content_body }` |
| `/api/avatar-variants` | `{ avatar_key, variant_type, data }` |
| `/api/cartesian-patterns` | `{ pattern_key, pattern_type, data }` |
| `/api/campaign-masters` | `{ site_id, name, headline_spintax_root, target_word_count }` |
| `/api/scheduled-tasks` | `{ site_id, campaign_id, task_type, scheduled_at, payload }` |
| `/api/generation-jobs` | `{ site_id, campaign_id, target_quantity, source_type, source_article_ids }` |

### Delete (DELETE)

| Pattern | Example |
|---------|---------|
| `/api/<resource>/{pk}` | `DELETE /api/content-fragments/{uuid}` |

### Patch (PATCH)

| Endpoint | Allowed Fields |
|----------|----------------|
| `PATCH /api/generated-articles/{pk}` | status, title, slug, meta_title, meta_description, is_published |

### Bulk

| Endpoint | Body |
|----------|------|
| `POST /api/generated-articles/bulk-delete` | `{ "ids": ["uuid1", "uuid2"] }` |

---

## 5. Response Shapes

### Counts (`GET /api/counts`)

```json
{
  "avatar_intelligence": 12,
  "avatar_variants": 45,
  "geo_intelligence": 8,
  "spintax_dictionaries": 6,
  "cartesian_patterns": 20,
  "page_blocks": 15,
  "offer_blocks": 22,
  "headline_inventory": 100,
  "content_fragments": 50
}
```

### Analytics Summary (`GET /api/analytics/summary`)

```json
{
  "events": 1200,
  "pageviews": 5000,
  "conversions": 45
}
```

### Debug (`GET /api/debug`)

```json
{
  "config": { "DATABASE_URL": "...", "ADMIN_KEY": "***" },
  "health": "ok",
  "api_logs": [{ "id": 1, "endpoint": "/api/leads", "method": "GET", "status": 200 }]
}
```
