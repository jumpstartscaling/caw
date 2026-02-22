# Domain Launch Guide — ion-arc.biz & ion-arc.online

Simple instructions to turn these domains into massive article sites (niche + location-based blogs with lead capture).

**See also:** [TENANT_PSEO_CHECKLIST.md](./TENANT_PSEO_CHECKLIST.md) (readiness checklist), [FACTORY_OVERVIEW.md](./FACTORY_OVERVIEW.md) (how factory components connect).

---

## Your Domains

| Domain | Purpose |
|--------|---------|
| **ion-arc.biz** | Primary article site |
| **ion-arc.online** | Secondary / niche variant or geographic split |

---

## Admin Page URLs

**Base:** `https://factory.jumpstartscaling.com/jumpstart/admin`  
**API Admin:** `https://api.jumpstartscaling.com/admin`

| Page | URL |
|------|-----|
| Dashboard | https://factory.jumpstartscaling.com/jumpstart/admin |
| **Sites** (add your domains) | https://factory.jumpstartscaling.com/jumpstart/admin/sites |
| **Locations** (pSEO cities) | https://api.jumpstartscaling.com/admin/locations |
| **pSEO Services** (niches) | https://api.jumpstartscaling.com/admin/pseo-services |
| **Content Matrix** | https://api.jumpstartscaling.com/admin/content-matrix |
| **SEO Campaigns** | https://factory.jumpstartscaling.com/jumpstart/admin/seo/campaigns |
| **Content Factory** (launch jobs) | https://factory.jumpstartscaling.com/jumpstart/admin/content-factory |
| **Factory Articles** | https://factory.jumpstartscaling.com/jumpstart/admin/factory/articles |
| **Intelligence** (avatars, spintax, patterns) | https://factory.jumpstartscaling.com/jumpstart/admin/intelligence |
| **Collections** (headlines, fragments) | https://factory.jumpstartscaling.com/jumpstart/admin/collections |
| **Leads** | https://api.jumpstartscaling.com/admin/leads |
| **Debug** | https://api.jumpstartscaling.com/admin/debug |

---

## Step-by-Step Instructions

### Phase 1: DNS & Infrastructure

1. **Point DNS to your server**
   - In your registrar (Namecheap, etc.):
   - Add A records: `ion-arc.biz`, `www.ion-arc.biz` → your Coolify server IP
   - Add A records: `ion-arc.online`, `www.ion-arc.online` → same IP
   - Enable **Domain Privacy** if desired (you already have it)

2. **Add domains in Coolify (optional)**  
   With Traefik catch-all, new domains can be added without Coolify domain config. Ensure JFactory has the catch-all label. Otherwise: Coolify → JFactory → Domains → add your domains.

3. **Add each domain as a Site**
   - Go to: [Sites](https://factory.jumpstartscaling.com/jumpstart/admin/sites)
   - Create Site 1: name `ion-arc-biz`, url `https://ion-arc.biz`, status `active`
   - Create Site 2: name `ion-arc-online`, url `https://ion-arc.online`, status `active`

---

### Phase 2: Niche + Location Foundation

4. **Add Locations** (cities/areas you target)
   - Go to: [Locations](https://api.jumpstartscaling.com/admin/locations)
   - Add rows: city, state, zip, neighborhood, slug (e.g. `austin-tx`, `dallas-tx`)
   - Start with 10–50 high-value locations; scale to hundreds later

5. **Add pSEO Services** (your niches)
   - Go to: [pSEO Services](https://api.jumpstartscaling.com/admin/pseo-services)
   - Add service_type + sub_niche: e.g. `HVAC`, `Plumbing`, `Landscaping`
   - Or: `Software Consulting`, `Digital Marketing`, etc. — match your niche

6. **Fill Content Matrix** (location × service)
   - Go to: [Content Matrix](https://api.jumpstartscaling.com/admin/content-matrix)
   - Each row = one location + one service = one target page
   - Add slug, title, meta_description, content_json
   - Use API or seed script for bulk import (location_id, service_id, slug, title, content)

---

### Phase 3: Campaigns + Intelligence

7. **Create Campaigns per site**
   - Go to: [SEO Campaigns](https://factory.jumpstartscaling.com/jumpstart/admin/seo/campaigns)
   - Create campaign: site = ion-arc-biz, name e.g. `Local HVAC`, headline_spintax_root, target_word_count 1500
   - Repeat for ion-arc-online and other niches

8. **Seed Intelligence** (optional but powerful)
   - [Intelligence → Avatars](https://factory.jumpstartscaling.com/jumpstart/admin/intelligence/avatars): audience personas
   - [Intelligence → Spintax](https://factory.jumpstartscaling.com/jumpstart/admin/intelligence/spintax): headline variation
   - [Intelligence → Patterns](https://factory.jumpstartscaling.com/jumpstart/admin/intelligence/patterns): article templates
   - [Collections → Content Fragments](https://factory.jumpstartscaling.com/jumpstart/admin/collections/content-fragments): reusable blocks
   - [Collections → Headline Inventory](https://factory.jumpstartscaling.com/jumpstart/admin/collections/headline-inventory): headline pool

---

### Phase 4: Generate Articles at Scale

9. **Launch Generation Jobs**
   - Go to: [Content Factory](https://factory.jumpstartscaling.com/jumpstart/admin/content-factory)
   - Create job: site, campaign, target_quantity (e.g. 100, 500, 1000)
   - Worker processes jobs; articles appear in [Factory Articles](https://factory.jumpstartscaling.com/jumpstart/admin/factory/articles)

10. **Monitor & Approve**
    - Factory Articles: move articles through stations (queued → drafting → review → approved → published)
    - Use PATCH to set `status` and `is_published`
    - Bulk delete if needed via API: `POST /api/generated-articles/bulk-delete`

---

### Phase 5: Lead Capture on Every Article

11. **Add lead capture to article template**
    - Each article page needs: contact form, CTA, or “Get a quote” block
    - Lead form posts to `https://api.jumpstartscaling.com/api/submit-lead` (or your lead endpoint)
    - Set `source` to `ion-arc.biz` or `ion-arc.online` for tracking

12. **Track leads**
    - Go to: [Leads](https://api.jumpstartscaling.com/admin/leads)
    - Filter by source = ion-arc.biz / ion-arc.online
    - Export or pipe to CRM/n8n

---

## Scale Targets

| Metric | Starter | Growth | Massive |
|--------|---------|--------|---------|
| Locations | 20 | 100 | 500+ |
| Services/niches | 3 | 10 | 30+ |
| Articles per site | 100 | 500 | 5,000+ |
| Total articles (both domains) | 200 | 1,000 | 10,000+ |

---

## Quick Reference

- **Locations + Services + Content Matrix** = the pSEO engine (location × niche combos)
- **Campaigns** = tie articles to a site + niche
- **Generation jobs** = bulk create articles (up to 1000 per job)
- **Lead forms** on every article = capture intent
- **80% uniqueness** = enforced by worker; use spintax + synonym_groups for variation
- **Run the checklist** = [TENANT_PSEO_CHECKLIST.md](./TENANT_PSEO_CHECKLIST.md) before launching jobs
