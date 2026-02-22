# 🏭 Content Factory - Task Checklist

## Status Legend
- [ ] Not started
- [x] Complete
- [~] In progress

---

## Phase 1: Schema Setup in Directus

### New Collections
- [ ] **avatars** - Target customer personas
  - [ ] slug (string, unique)
  - [ ] base_name (string)
  - [ ] wealth_cluster (string)
  - [ ] psychographics (text)
  - [ ] tech_stack (json)
  - [ ] pronoun_male, pronoun_female (string)
  - [ ] identity_male, identity_female (string)

- [ ] **niches** - Business industries per avatar
  - [ ] name (string)
  - [ ] slug (string)
  - [ ] avatar (m2o → avatars)
  - [ ] keywords (json)
  - [ ] pain_points (json)

- [ ] **wealth_clusters** - Geographic wealth segments
  - [ ] slug (string)
  - [ ] name (string)
  - [ ] tech_adoption_score (integer)
  - [ ] primary_need (string)

- [ ] **elite_cities** - High-value target cities
  - [ ] name (string)
  - [ ] state (string)
  - [ ] full_name (string)
  - [ ] wealth_cluster (m2o → wealth_clusters)
  - [ ] landmarks (json)

- [ ] **offer_blocks** - Messaging templates
  - [ ] slug (string)
  - [ ] title (string)
  - [ ] hook (text)
  - [ ] spintax (text)
  - [ ] avatar_pains (json)
  - [ ] meta_title_template (string)
  - [ ] meta_desc_template (text)

### Update Existing Collections
- [ ] **content_campaigns** (was campaign_masters)
  - [ ] Add target_avatars (m2m → avatars)
  - [ ] Add target_niches (m2m → niches)
  - [ ] Add target_cities (m2m → elite_cities)
  - [ ] Add target_offers (m2m → offer_blocks)

- [ ] **generated_articles**
  - [ ] Add avatar (m2o → avatars)
  - [ ] Add niche (m2o → niches)
  - [ ] Add city (m2o → elite_cities)
  - [ ] Add offer (m2o → offer_blocks)
  - [ ] Add schema_json (json)

### Admin UI Organization
- [ ] Create "Intelligence" folder
  - [ ] Move avatars, niches, wealth_clusters, elite_cities
- [ ] Create "Messaging" folder
  - [ ] Move offer_blocks
- [ ] Update Site Content folder
  - [ ] Move content_campaigns, generated_articles

---

## Phase 2: Data Import

### Avatar Intelligence (10 avatars)
- [ ] scaling_founder - The Tech Titan
- [ ] elite_consultant - The Wall Street Elite
- [ ] ecom_high_roller - The New Money
- [ ] high_end_agency_owner - The Media Mogul
- [ ] multi_location_ceo - The Legacy Operator
- [ ] real_estate_power_player - The RE Power Player
- [ ] saas_overloader - The SaaS Overloader
- [ ] medical_practice_ceo - The Medical CEO
- [ ] coaching_empire_builder - The Coaching Empire
- [ ] enterprise_innovator - The Enterprise Innovator

### Niches (100 total, 10 per avatar)
- [ ] Import all niches linked to avatars

### Geo Intelligence
- [ ] Import 5 wealth clusters
  - [ ] tech_native (Silicon Valleys)
  - [ ] financial_power (Wall Street Corridors)
  - [ ] media_influence (Hollywood & Brand Hubs)
  - [ ] new_money_growth (Growth & Tax Havens)
  - [ ] legacy_sovereign (Old Money & Quiet Wealth)
- [ ] Import 50 elite cities linked to clusters

### Offer Blocks
- [ ] block_01_zapier_fix - The $1,000 Fix
- [ ] block_04_market_domination - Market Domination
- [ ] block_09_sovereign_capi - Sovereign CAPI
- [ ] (More blocks as provided)

---

## Phase 3: Factory Engine Updates

### Token Processor
- [ ] Add {{NICHE}} token replacement
- [ ] Add {{AVATAR}} token replacement
- [ ] Add {{PRONOUN}} token replacement
- [ ] Add {{TECH_STACK}} token replacement
- [ ] Add {{WEALTH_VIBE}} token replacement
- [ ] Add {{AGENCY_NAME}} from site
- [ ] Add {{AGENCY_URL}} from site

### SEO Meta Generator
- [ ] Create meta_title from template (60 chars max)
- [ ] Create meta_description from template (160 chars max)
- [ ] Generate schema.org JSON-LD
- [ ] Add canonical URL generation

### Campaign Generator
- [ ] Accept avatar multi-select
- [ ] Accept niche multi-select
- [ ] Accept city multi-select
- [ ] Accept offer multi-select
- [ ] Generate all valid combinations
- [ ] Deduplicate combinations
- [ ] Apply Gaussian scheduling
- [ ] Create articles with full SEO

### API Endpoints
- [ ] POST /api/factory/generate-campaign
- [ ] GET /api/factory/preview-article
- [ ] POST /api/factory/publish-batch

---

## Phase 4: Testing & Validation

### Test Batch
- [ ] Create test campaign with:
  - [ ] 1 avatar (scaling_founder)
  - [ ] 2 niches
  - [ ] 3 cities
  - [ ] 1 offer
  - [ ] = 6 articles
- [ ] Verify all tokens replaced
- [ ] Verify SEO meta quality
- [ ] Verify schema.org valid
- [ ] Verify no duplicate content
- [ ] Check slug uniqueness

### Full Campaign Test
- [ ] Generate 50+ articles
- [ ] Verify Gaussian distribution
- [ ] Verify sitemap drip works
- [ ] Test publish to site

---

## Phase 5: Documentation

- [ ] Update README with factory usage
- [ ] Document token reference
- [ ] Document campaign workflow
- [ ] Create video walkthrough (optional)

---

## Estimated Timeline

| Phase | Time |
|-------|------|
| Schema Setup | 1 hour |
| Data Import | 30 mins |
| Factory Engine | 2 hours |
| Testing | 30 mins |
| Documentation | 30 mins |
| **Total** | **~4.5 hours** |

---

## Notes

_Add any notes or blockers here during implementation_

