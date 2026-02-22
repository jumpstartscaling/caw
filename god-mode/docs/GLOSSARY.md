# GLOSSARY: Spark Platform Terminology

> **BLUF**: This glossary defines all platform-specific terms. Reference before reading other documentation.

---

## Core Concepts

| Term | Definition | Context |
|------|------------|---------|
| **Spintax** | Syntax for text variation using braces and pipes: `{word1\|word2\|word3}`. Processor randomly selects one option per instance. | Used in headline generation, content fragments |
| **Cartesian Pattern** | Mathematical product of spintax elements. Given `{a\|b}` × `{1\|2}`, produces: `a1`, `a2`, `b1`, `b2`. | Campaign headline permutations |
| **Avatar** | Buyer persona profile containing demographics, psychographics, pain points, and pronoun variations. | Content personalization layer |
| **Fragment** | Modular content block (~200-300 words) for article assembly. One fragment per content pillar. | SEO article structure |
| **Pillar** | One of 6 content sections in SEO articles: intro_hook, keyword, uniqueness, relevance, quality, authority. | Article assembly order |
| **Hub Page** | Parent page linking to related child articles. Creates topical authority clusters. | Internal linking strategy |

---

## System Modules

| Term | Definition | Location |
|------|------------|----------|
| **Intelligence Library** | Data asset storage: Avatars, Geo clusters, Spintax dictionaries, Cartesian patterns. | `/admin/intelligence/*` |
| **Content Factory** | Article generation pipeline: Kanban workflow, queue processing, batch operations. | `/admin/factory/*` |
| **Launchpad** | Site builder module: Sites, Pages, Navigation, Theme settings. | `/admin/sites/*` |
| **SEO Engine** | Content optimization: Headlines, Fragments, Link insertion, Duplicate detection. | `/admin/seo/*` |
| **Campaign Master** | SEO campaign configuration: target locations, avatars, spintax roots, word counts. | `campaign_masters` collection |

---

## Schema Terms

| Term | Definition |
|------|------------|
| **Golden Schema** | Canonical database structure. 30+ collections in Harris Matrix order. |
| **Harris Matrix** | Dependency ordering for schema creation. Foundation → Walls → Roof. Prevents FK constraint failures. |
| **Batch 1** | Foundation tables: `sites`, `campaign_masters`, `avatar_intelligence`, `avatar_variants`, `cartesian_patterns`, `geo_intelligence`, `offer_blocks`. Zero dependencies. |
| **Batch 2** | First-level children: `generated_articles`, `generation_jobs`, `pages`, `posts`, `leads`, `headline_inventory`, `content_fragments`. Depend only on Batch 1. |
| **Batch 3** | Complex children: `link_targets`, `globals`, `navigation`. Multiple dependencies or self-referential. |

---

## Architecture Terms

| Term | Definition |
|------|------------|
| **SSR** | Server-Side Rendering. HTML generated on server per request. Astro default mode. |
| **Islands Architecture** | Astro's partial hydration model. Static HTML with isolated interactive React components. Reduces JS bundle. |
| **Multi-Tenant** | Single codebase serves multiple isolated sites. `site_id` FK on all content tables. |
| **SSR URL Detection** | Logic to select Directus URL: Docker internal (`http://directus:8055`) for server requests, public HTTPS for browser requests. |
| **God-Mode API** | Admin-only endpoints at `/god/*` for schema operations. Protected by `X-God-Token` header. |

---

## Infrastructure Terms

| Term | Definition |
|------|------------|
| **Coolify** | Self-hosted PaaS for Docker deployments. Manages containers, SSL, and domains. |
| **Traefik** | Reverse proxy in Coolify stack. Routes requests to containers by domain/path. |
| **BullMQ** | Redis-based job queue for Node.js. Handles async article generation, image processing. |
| **PostGIS** | PostgreSQL extension for geographic data. Enables spatial queries on location data. |

---

## Content Terms

| Term | Definition |
|------|------------|
| **Headline Inventory** | Database of generated headline variations from spintax permutations. |
| **Velocity Mode** | Article scheduling strategy: `RAMP_UP` (increasing), `STEADY` (constant), `SPIKES` (burst patterns). |
| **Sitemap Drip** | Gradual sitemap exposure strategy: `ghost` → `queued` → `indexed`. |
| **Offer Block** | Promotional content template with token placeholders: `{{CITY}}`, `{{NICHE}}`, `{{AVATAR}}`. |
| **Geo Intelligence** | Location targeting data: states, counties, cities with population data. |
| **Wealth Cluster** | Geographic grouping by economic profile: Tech-Native, Financial Power, etc. |

---

## UI/UX Terms

| Term | Definition |
|------|------------|
| **Titanium Pro Design** | Design system: Zinc-950 background, Yellow-500/Green-500/Purple-500 accents. |
| **Shadcn/UI** | Component library pattern. Unstyled primitives with Tailwind classes. |
| **Kanban Board** | Workflow visualization: Queued → Processing → QC → Approved → Published. |
| **Block Renderer** | Component that converts JSON block definitions to HTML. Core of page builder. |

---

## Acronyms

| Acronym | Expansion |
|---------|-----------|
| **BLUF** | Bottom Line Up Front |
| **CMS** | Content Management System |
| **CORS** | Cross-Origin Resource Sharing |
| **CRUD** | Create, Read, Update, Delete |
| **FK** | Foreign Key |
| **M2O** | Many-to-One (relation type) |
| **M2M** | Many-to-Many (relation type) |
| **PK** | Primary Key |
| **SDK** | Software Development Kit |
| **UUID** | Universally Unique Identifier |
