# 🏭 Spark Content Factory - Implementation Plan

## Overview

Transform the three intelligence files into a fully automated content generation system that creates **hyper-personalized articles** by combining:
- **WHO** (Avatar + Niche) 
- **WHERE** (City + Wealth Cluster)
- **WHAT** (Offer Block + Spintax)

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DIRECTUS SCHEMA                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐            │
│  │   SITES     │────▶│  CAMPAIGNS  │────▶│  ARTICLES   │            │
│  │ (Your Sites)│     │(What to build│     │(Generated)  │            │
│  └─────────────┘     └─────────────┘     └─────────────┘            │
│         │                   │                    │                   │
│         │            ┌──────┴──────┐             │                   │
│         │            ▼             ▼             ▼                   │
│         │     ┌───────────┐ ┌───────────┐ ┌───────────┐             │
│         │     │  AVATARS  │ │  NICHES   │ │ LOCATIONS │             │
│         │     │ (Who)     │ │ (Industry)│ │ (Where)   │             │
│         │     └───────────┘ └───────────┘ └───────────┘             │
│         │            │             │             │                   │
│         │            └──────┬──────┘             │                   │
│         │                   ▼                    │                   │
│         │           ┌─────────────┐              │                   │
│         └──────────▶│OFFER BLOCKS │◀─────────────┘                   │
│                     │(Messaging)  │                                  │
│                     └─────────────┘                                  │
│                            │                                         │
│                            ▼                                         │
│                     ┌─────────────┐                                  │
│                     │ SEO ENGINE  │                                  │
│                     │• Meta Title │                                  │
│                     │• Meta Desc  │                                  │
│                     │• Schema.org │                                  │
│                     └─────────────┘                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directus Collections to Create

### 1. **avatars** (FROM: avatar_intelligence.json)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| slug | string | `scaling_founder`, `elite_consultant`, etc. |
| base_name | string | "The Tech Titan / Scaling Founder" |
| wealth_cluster | string | "Tech-Native" |
| psychographics | text | Long description of mindset |
| tech_stack | json | ["Zapier", "Slack", "AWS"] |
| pronoun_male | string | "he" |
| pronoun_female | string | "she" |
| identity_male | string | "bottlenecked technical founder" |
| identity_female | string | "bottlenecked technical founder" |

### 2. **niches** (FROM: avatar_intelligence.json → business_niches)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | string | "Vertical SaaS (B2B)" |
| slug | string | "vertical-saas-b2b" |
| avatar | m2o → avatars | Which avatar owns this niche |
| keywords | json | SEO keywords for this niche |
| pain_points | json | Common pains in this niche |

### 3. **wealth_clusters** (FROM: geo_intelligence.json)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| slug | string | `tech_native`, `financial_power` |
| name | string | "The Silicon Valleys" |
| tech_adoption_score | integer | 1-10 |
| primary_need | string | "Advanced Custom Automation & SaaS" |
| matching_avatars | m2m → avatars | Which avatars match this cluster |

### 4. **elite_cities** (FROM: geo_intelligence.json → cities)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | string | "Atherton" |
| state | string | "CA" |
| full_name | string | "Atherton, CA" |
| wealth_cluster | m2o → wealth_clusters | Which cluster |
| landmarks | json | Local landmarks for spintax |

### 5. **offer_blocks** (FROM: offer_engine.json)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| slug | string | `block_01_zapier_fix` |
| title | string | "The $1,000 Fix" |
| hook | text | "Stop the bleeding in your {{NICHE}} business." |
| spintax | text | Full spintax template |
| avatar_pains | json | { avatar_slug: [pain1, pain2, pain3] } |
| meta_title_template | string | "{{OFFER}} for {{NICHE}} in {{CITY}}" |
| meta_desc_template | text | SEO description template |

### 6. **content_campaigns** (User creates these)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| site | m2o → sites | Which site to publish to |
| name | string | "Q1 2025 - Tech Founders" |
| target_avatars | m2m → avatars | Which avatars to target |
| target_niches | m2m → niches | Which niches |
| target_cities | m2m → elite_cities | Which cities |
| offer_blocks | m2m → offer_blocks | Which offers to use |
| velocity_mode | select | RAMP_UP, STEADY, SPIKES |
| target_count | integer | How many articles |

### 7. **generated_articles** (Factory output)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| site | m2o → sites | Published to this site |
| campaign | m2o → content_campaigns | Source campaign |
| avatar | m2o → avatars | Target avatar |
| niche | m2o → niches | Target niche |
| city | m2o → elite_cities | Target city |
| offer | m2o → offer_blocks | Offer used |
| headline | string | Generated headline |
| meta_title | string | SEO title (60 chars) |
| meta_description | string | SEO desc (160 chars) |
| full_html_body | text | The article content |
| schema_json | json | Schema.org markup |
| sitemap_status | select | ghost, queued, indexed |
| date_published | datetime | Backdate or now |

---

## 🔄 How It All Connects

### Page Generation Flow

```
USER SELECTS:
┌─────────────────────────────────────────────┐
│ Site: la.christopheramaya.work              │
│ Avatar: scaling_founder                     │
│ Niche: Vertical SaaS (B2B)                  │
│ City: Palo Alto, CA                         │
│ Offer: The $1,000 Fix                       │
│ Count: 50 articles                          │
└─────────────────────────────────────────────┘
                    │
                    ▼
FACTORY GENERATES:
┌─────────────────────────────────────────────┐
│ FOR EACH COMBINATION:                       │
│                                             │
│ 1. Pull avatar psychographics               │
│ 2. Pull niche-specific pains                │
│ 3. Pull city landmarks                      │
│ 4. Pull offer spintax                       │
│ 5. Replace all {{TOKENS}}                   │
│ 6. Spin the spintax                         │
│ 7. Generate SEO meta                        │
│ 8. Create schema.org JSON                   │
│ 9. Save to generated_articles               │
│ 10. Apply Gaussian scheduling               │
└─────────────────────────────────────────────┘
```

### Token Replacement Map

| Token | Source | Example |
|-------|--------|---------|
| `{{NICHE}}` | niches.name | "Vertical SaaS" |
| `{{CITY}}` | elite_cities.name | "Palo Alto" |
| `{{STATE}}` | elite_cities.state | "CA" |
| `{{AVATAR}}` | avatars.identity_male | "bottlenecked technical founder" |
| `{{PRONOUN}}` | avatars.pronoun_male | "he" |
| `{{TECH_STACK}}` | avatars.tech_stack[random] | "Zapier" |
| `{{LANDMARK}}` | elite_cities.landmarks[random] | "Stanford University" |
| `{{AGENCY_NAME}}` | sites.name | "Spark Digital" |
| `{{AGENCY_URL}}` | sites.domain | "sparkdigital.com" |
| `{{CURRENT_YEAR}}` | context | "2024" |
| `{{WEALTH_VIBE}}` | wealth_clusters.primary_need | "Advanced Custom Automation" |

---

## 📋 SEO Meta Generation

For each article, auto-generate:

### Meta Title (60 chars)
```
{{OFFER_TITLE}} for {{NICHE}} Businesses in {{CITY}}, {{STATE}}
```
Example: "The $1,000 Fix for Vertical SaaS Businesses in Palo Alto, CA"

### Meta Description (160 chars)
```
{{AVATAR_IDENTITY}} in {{CITY}}? {{OFFER_HOOK}} We {{SOLUTION}}. Get your free audit today.
```
Example: "Bottlenecked technical founder in Palo Alto? Stop the bleeding in your SaaS business. We rebuild broken automation. Get your free audit today."

### Schema.org JSON-LD
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{META_TITLE}}",
  "description": "{{META_DESC}}",
  "author": {
    "@type": "Organization",
    "name": "{{AGENCY_NAME}}"
  },
  "datePublished": "{{DATE_PUBLISHED}}",
  "dateModified": "{{DATE_MODIFIED}}",
  "publisher": {
    "@type": "Organization",
    "name": "{{AGENCY_NAME}}"
  }
}
```

---

## 🚀 User Workflow in Directus

### Step 1: Add Your Site
```
Sites → + New
- Name: "Spark Digital LA"
- Domain: "la.christopheramaya.work"
```

### Step 2: Create Campaign
```
Content Campaigns → + New
- Site: (dropdown) Spark Digital LA
- Target Avatars: ☑️ scaling_founder ☑️ saas_overloader
- Target Niches: ☑️ Vertical SaaS ☑️ Fintech
- Target Cities: ☑️ Palo Alto ☑️ Austin ☑️ Seattle
- Offer Blocks: ☑️ Zapier Fix ☑️ Market Domination
- Velocity: RAMP_UP
- Target Count: 100
```

### Step 3: Click "Generate"
```
→ Factory creates 100 unique articles
→ Each article = unique combo
→ SEO meta auto-generated
→ Gaussian scheduling applied
```

### Step 4: Review & Publish
```
Generated Articles → Filter by Campaign
→ Preview any article
→ Approve test batch
→ Click "Publish to Site"
→ Articles go live
```

---

## 📊 Combination Math

With full data:
- 10 Avatars × 10 Niches each = 100 Avatar-Niche combos
- 50 Elite Cities
- 10 Offer Blocks

**Maximum unique articles: 100 × 50 × 10 = 50,000 pages**

For a focused campaign:
- 2 Avatars × 3 Niches × 10 Cities × 2 Offers = **120 articles**

---

## ✅ Implementation Tasks

### Phase 1: Schema Setup
- [ ] Create `avatars` collection
- [ ] Create `niches` collection
- [ ] Create `wealth_clusters` collection
- [ ] Create `elite_cities` collection
- [ ] Create `offer_blocks` collection
- [ ] Update `content_campaigns` with relations
- [ ] Update `generated_articles` with relations

### Phase 2: Data Import
- [ ] Import 10 avatars
- [ ] Import 100 niches (10 per avatar)
- [ ] Import 5 wealth clusters
- [ ] Import 50 elite cities
- [ ] Import offer blocks

### Phase 3: Factory Engine
- [ ] Update token processor
- [ ] Build campaign generator
- [ ] Add SEO meta templates
- [ ] Add schema.org generator

### Phase 4: Testing
- [ ] Generate test batch
- [ ] Verify token replacement
- [ ] Verify SEO meta quality
