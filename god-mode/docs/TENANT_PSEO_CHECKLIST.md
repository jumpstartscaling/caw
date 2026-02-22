# Tenant pSEO Readiness Checklist

Confirm that every tenant can run the programmatic SEO case study (template × dataset = pages at scale). Use this checklist before launching generation jobs.

---

## 1. Foundation

| Check | Description |
|-------|-------------|
| [ ] Site in `sites` | Record with `url`, `status=active` |
| [ ] Campaign in `campaign_masters` | Linked to site via `site_id` |
| [ ] Locations (X-axis) | Cities/areas seeded in `locations` |
| [ ] pseo_services (Y-axis) | Niches seeded in `pseo_services` |
| [ ] content_matrix populated | Location × service combos (Cartesian) |

---

## 2. Uniqueness Engine

| Check | Description |
|-------|-------------|
| [ ] spintax_dictionaries | Categories: urgency_hooks, trust_signals, call_to_action |
| [ ] synonym_groups | Terms for 80% uniqueness (worker enforces) |

---

## 3. Building Blocks

| Check | Description |
|-------|-------------|
| [ ] content_fragments | Reusable blocks for campaign |
| [ ] headline_inventory | Headlines for campaign |
| [ ] offer_blocks | CTAs / lead capture blocks |

---

## 4. Geo Intelligence (optional but recommended)

| Check | Description |
|-------|-------------|
| [ ] geo_intelligence | Landmark, lat/long per location cluster |

---

## 5. Generation Pipeline

| Check | Description |
|-------|-------------|
| [ ] Can create generation_job | `site_id`, `campaign_id`, `target_quantity` |
| [ ] Worker processes jobs | External worker or scheduled job |
| [ ] Articles route to tenant | Front-end renders `generated_articles` |

---

## 6. Lead Capture

| Check | Description |
|-------|-------------|
| [ ] Lead form posts to `/api/submit-lead` | With `source` = tenant domain |
| [ ] Leads visible in admin/leads | Filter by source |

---

## Quick Verification

Run from **spark repo root**. See [TERMINAL_COMMANDS.md](./TERMINAL_COMMANDS.md) for full list.

```bash
# Run base seed (chrisamaya)
cd god-mode/python-api && python3 scripts/seed_chrisamaya.py

# Run chrisamaya.work v4 seed (50 locs × 35 svcs = 1,750 matrix)
cd god-mode/python-api && python3 scripts/seed_chrisamaya_v4.py

# Launch first campaign (target_quantity=2000)
cd god-mode/python-api && python3 scripts/launch_chrisamaya_campaign.py --quantity=2000

# Or via API (uses ADMIN_KEY from .env.local)
cd god-mode && node scripts/launch-chrisamaya-campaign.mjs --quantity=2000

# Check counts
curl -s https://api.jumpstartscaling.com/api/counts | jq
```

See [FACTORY_OVERVIEW.md](./FACTORY_OVERVIEW.md) for how components connect.
