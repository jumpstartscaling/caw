# DATABASE SCHEMA: Spark Platform

> **BLUF**: 30+ PostgreSQL tables in Harris Matrix order. `sites` and `campaign_masters` are super parents. All content tables FK to `site_id`.

---

## 1. Schema Creation Order

### Harris Matrix Dependency Layers

| Batch | Layer | Description |
|-------|-------|-------------|
| 1 | Foundation | Zero dependencies. Create first. |
| 2 | Walls | Depend only on Batch 1. |
| 3 | Roof | Multiple dependencies or self-referential. |

---

## 2. Batch 1: Foundation Tables

### 2.1 sites (SUPER PARENT)

**Purpose**: Multi-tenant root. All content tables reference this.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| status | VARCHAR(50) | DEFAULT 'active' | active, inactive, archived |
| name | VARCHAR(255) | NOT NULL | Site display name |
| url | VARCHAR(500) | | Site domain URL |
| date_created | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| date_updated | TIMESTAMP | DEFAULT NOW() | Last update |

**Children**: 10+ tables reference via `site_id`

---

### 2.2 campaign_masters (SUPER PARENT)

**Purpose**: SEO campaign configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'active' | active, inactive, completed |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| name | VARCHAR(255) | NOT NULL | Campaign name |
| headline_spintax_root | TEXT | | Spintax template |
| target_word_count | INTEGER | DEFAULT 1500 | Target article length |
| location_mode | VARCHAR(50) | | city, county, state |
| batch_count | INTEGER | | Articles per batch |
| date_created | TIMESTAMP | DEFAULT NOW() | |
| date_updated | TIMESTAMP | DEFAULT NOW() | |

**Children**: headline_inventory, content_fragments, (ref by generated_articles)

---

### 2.3 avatar_intelligence

**Purpose**: Buyer persona profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'published' | published, draft |
| base_name | VARCHAR(255) | | Persona name |
| wealth_cluster | VARCHAR(100) | | Economic profile |
| pain_points | JSONB | | Array of pain points |
| demographics | JSONB | | Demographic data |

---

### 2.4 avatar_variants

**Purpose**: Gender/style variations of avatars.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'published' | |
| name | VARCHAR(255) | | Variant name |
| prompt_modifier | TEXT | | AI prompt adjustments |

---

### 2.5 cartesian_patterns

**Purpose**: Title/hook formula combinations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'published' | |
| name | VARCHAR(255) | | Pattern name |
| pattern_logic | TEXT | | Formula definition |

---

### 2.6 geo_intelligence

**Purpose**: Geographic targeting data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'published' | |
| city | VARCHAR(255) | | City name |
| state | VARCHAR(255) | | State name |
| population | INTEGER | | Population count |

---

### 2.7 offer_blocks

**Purpose**: Promotional content templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'published' | |
| name | VARCHAR(255) | | Block name |
| html_content | TEXT | | Template HTML |

---

## 3. Batch 2: First-Level Children

### 3.1 generated_articles

**Purpose**: SEO articles created by Content Factory.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'draft' | draft, published, archived |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| campaign_id | UUID | FK → campaign_masters(id) SET NULL | Source campaign |
| title | VARCHAR(255) | | Article title |
| content | TEXT | | Full HTML body |
| slug | VARCHAR(255) | | URL slug |
| is_published | BOOLEAN | | Publication flag |
| schema_json | JSONB | | Schema.org data |
| date_created | TIMESTAMP | DEFAULT NOW() | |
| date_updated | TIMESTAMP | | |

---

### 3.2 generation_jobs

**Purpose**: Content generation queue.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'pending' | pending, processing, completed, failed |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| batch_size | INTEGER | DEFAULT 10 | Items per batch |
| target_quantity | INTEGER | | Total target |
| filters | JSONB | | Query filters |
| current_offset | INTEGER | | Progress marker |
| progress | INTEGER | DEFAULT 0 | Percentage |

---

### 3.3 pages

**Purpose**: Site pages (blocks-based content).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'published' | published, draft |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| title | VARCHAR(255) | | Page title |
| slug | VARCHAR(255) | | URL slug |
| permalink | VARCHAR(255) | | Full path |
| content | TEXT | | Legacy HTML |
| blocks | JSONB | | Block definitions |
| schema_json | JSONB | | Schema.org data |
| seo_title | VARCHAR(255) | | Meta title |
| seo_description | TEXT | | Meta description |
| seo_image | UUID | FK → directus_files | OG image |
| date_created | TIMESTAMP | | |
| date_updated | TIMESTAMP | | |

---

### 3.4 posts

**Purpose**: Blog posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'published' | published, draft |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| title | VARCHAR(255) | | Post title |
| slug | VARCHAR(255) | | URL slug |
| excerpt | TEXT | | Summary text |
| content | TEXT | | Full HTML body |
| featured_image | UUID | FK → directus_files | Hero image |
| published_at | TIMESTAMP | | Publication date |
| category | VARCHAR(100) | | Post category |
| author | UUID | FK → directus_users | Author |
| schema_json | JSONB | | Schema.org data |
| date_created | TIMESTAMP | | |
| date_updated | TIMESTAMP | | |

---

### 3.5 leads

**Purpose**: Lead capture data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'new' | new, contacted, qualified, converted |
| site_id | UUID | FK → sites(id) SET NULL | Source site |
| email | VARCHAR(255) | | Contact email |
| name | VARCHAR(255) | | Contact name |
| source | VARCHAR(100) | | Lead source |

---

### 3.6 headline_inventory

**Purpose**: Generated headline variations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'active' | active, used, archived |
| campaign_id | UUID | FK → campaign_masters(id) CASCADE | Source campaign |
| headline_text | VARCHAR(255) | | Generated headline |
| is_used | BOOLEAN | DEFAULT FALSE | Usage flag |

---

### 3.7 content_fragments

**Purpose**: Modular content blocks for article assembly.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'active' | active, archived |
| campaign_id | UUID | FK → campaign_masters(id) CASCADE | Source campaign |
| fragment_text | TEXT | | Fragment content |
| fragment_type | VARCHAR(50) | | Pillar: intro_hook, pillar_1, etc. |

---

## 4. Batch 3: Complex Children

### 4.1 link_targets

**Purpose**: Internal linking configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| status | VARCHAR(50) | DEFAULT 'active' | active, inactive |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| target_url | VARCHAR(500) | | Link destination |
| anchor_text | VARCHAR(255) | | Link text |
| keyword_focus | VARCHAR(255) | | Target keyword |

---

### 4.2 globals

**Purpose**: Site-wide settings (singleton per site).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| title | VARCHAR(255) | | Site title |
| description | TEXT | | Site description |
| logo | UUID | FK → directus_files | Logo image |

---

### 4.3 navigation

**Purpose**: Site menu structure.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| site_id | UUID | FK → sites(id) CASCADE | Owning site |
| label | VARCHAR(255) | NOT NULL | Link text |
| url | VARCHAR(500) | NOT NULL | Link URL |
| parent | UUID | FK → navigation(id) | Parent item |
| target | VARCHAR(20) | | _self, _blank |
| sort | INTEGER | | Display order |

---

## 5. Analytics & System Tables

### 5.1 work_log

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| site_id | UUID | Related site |
| action | VARCHAR | Action type |
| entity_type | VARCHAR | Affected entity |
| entity_id | VARCHAR | Entity UUID |
| details | JSONB | Additional data |
| level | VARCHAR | debug, info, warning, error |
| status | VARCHAR | Status text |
| timestamp | TIMESTAMP | Event time |
| user | UUID | Acting user |

---

### 5.2 forms

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| site_id | UUID | Owning site |
| name | VARCHAR | Form name |
| fields | JSONB | Field definitions |
| submit_action | VARCHAR | webhook, email, store |
| success_message | TEXT | Confirmation text |
| redirect_url | VARCHAR | Post-submit redirect |

---

### 5.3 form_submissions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| form | UUID | FK → forms |
| data | JSONB | Submitted values |
| date_created | TIMESTAMP | Submission time |

---

### 5.4 Location Tables

**locations_states**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | State name |
| code | VARCHAR(2) | State abbreviation |

**locations_counties**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | County name |
| state | UUID | FK → locations_states |
| population | INTEGER | Population count |

**locations_cities**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | City name |
| state | UUID | FK → locations_states |
| county | UUID | FK → locations_counties |
| population | INTEGER | Population count |

---

### 5.5 Analytics Tables

**site_analytics**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| site_id | UUID | FK → sites |
| google_ads_id | VARCHAR | GA4 property ID |
| fb_pixel_id | VARCHAR | Meta pixel ID |

**events**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| site_id | UUID | FK → sites |
| event_name | VARCHAR | Event identifier |
| page_path | VARCHAR | URL path |
| timestamp | TIMESTAMP | Event time |

**pageviews**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| site_id | UUID | FK → sites |
| page_path | VARCHAR | URL path |
| session_id | VARCHAR | Anonymous session |
| timestamp | TIMESTAMP | View time |

**conversions**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| site_id | UUID | FK → sites |
| lead | UUID | FK → leads |
| conversion_type | VARCHAR | Type identifier |
| value | DECIMAL | Monetary value |

---

## 6. Relationship Diagram

```
sites ─────────────────────────────────────────────────────────┐
  │                                                            │
  ├── campaign_masters ─┬── headline_inventory                 │
  │                     ├── content_fragments                  │
  │                     └── (ref) generated_articles           │
  │                                                            │
  ├── generated_articles                                       │
  ├── generation_jobs                                          │
  ├── pages                                                    │
  ├── posts                                                    │
  ├── leads                                                    │
  ├── link_targets                                             │
  ├── globals (1:1)                                            │
  │                                                            │
  ├── navigation (self-referential via parent)                 │
  │                                                            │
  ├── forms ─── form_submissions                               │
  │                                                            │
  ├── site_analytics                                           │
  ├── events                                                   │
  ├── pageviews                                                │
  ├── conversions ─── leads                                    │
  │                                                            │
  └── work_log                                                 │
                                                               │
locations_states ─── locations_counties ─── locations_cities ──┘
```

---

## 7. SQL Reference

Full schema: [`complete_schema.sql`](file:///Users/christopheramaya/Downloads/spark/complete_schema.sql)

Extensions required:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

UUID generation:
```sql
DEFAULT gen_random_uuid()
```
