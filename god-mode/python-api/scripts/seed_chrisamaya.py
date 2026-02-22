#!/usr/bin/env python3
"""
Seed chrisamaya as first tenant: site, campaign, content_fragments, headline_inventory, posts,
plus pSEO factory foundation: locations, pseo_services, spintax, synonym_groups, offer_blocks,
geo_intelligence, content_matrix.

Usage:
  cd god-mode/python-api && python scripts/seed_chrisamaya.py

Requires: DATABASE_URL in env or .env
"""
import asyncio
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Default theme_config for chrisamaya
DEFAULT_THEME = {
    "palette": "emerald",
    "content_structure": {
        "section_ids": {
            "hero": "hero",
            "about": "about",
            "services": "services",
            "faq": "faq",
            "contact": "contact",
            "calculator": "calculator",
            "survey": "survey",
        },
        "section_classes": {
            "default": "section dark",
            "alternate": "section light",
            "hero_full": "section section-hero section-hero-full",
        },
        "content_blocks": ["hero", "features", "cta", "faq", "contact", "calculator", "survey"],
    },
    "scripts": ["scroll-progress", "particles", "animation-observer"],
}

SAMPLE_POSTS = [
    {
        "title": "From Zapier Glue to Solid Systems: Why I Built My Own Stack",
        "slug": "from-zapier-glue-to-solid-systems",
        "content": "<p>Most founders duct-tape their ops together. Here's how I replaced 47 Zapier zaps with one coherent backend.</p><p>The key was treating automation as architecture, not band-aids.</p>",
        "excerpt": "How I replaced 47 Zapier zaps with one coherent backend—and why automation should be architecture, not band-aids.",
    },
    {
        "title": "The Unicorn Developer Model: Why One Person Can Replace a Team",
        "slug": "unicorn-developer-model",
        "content": "<p>Full-stack, AI-ready, and automation-native. The 'unicorn' isn't a myth—it's the new default for scaling technical founders.</p>",
        "excerpt": "Full-stack, AI-ready, automation-native. Why the unicorn developer is the new default for scaling technical founders.",
    },
    {
        "title": "Private AI: Why Your Data Should Never Leave Your Stack",
        "slug": "private-ai-why-data-stays-in-house",
        "content": "<p>Public LLMs are convenient—and leaky. Private AI systems give you the same power without the compliance nightmares.</p>",
        "excerpt": "Public LLMs are convenient and leaky. Private AI keeps the power without the compliance nightmares.",
    },
]

# 20 high-value pSEO locations (X-axis)
LOCATIONS = [
    {"city": "Austin", "state": "TX", "zip": "73301", "slug": "austin-tx"},
    {"city": "Dallas", "state": "TX", "zip": "75201", "slug": "dallas-tx"},
    {"city": "Houston", "state": "TX", "zip": "77001", "slug": "houston-tx"},
    {"city": "Miami", "state": "FL", "zip": "33101", "slug": "miami-fl"},
    {"city": "Orlando", "state": "FL", "zip": "32801", "slug": "orlando-fl"},
    {"city": "Tampa", "state": "FL", "zip": "33601", "slug": "tampa-fl"},
    {"city": "Atlanta", "state": "GA", "zip": "30301", "slug": "atlanta-ga"},
    {"city": "Phoenix", "state": "AZ", "zip": "85001", "slug": "phoenix-az"},
    {"city": "Denver", "state": "CO", "zip": "80201", "slug": "denver-co"},
    {"city": "Las Vegas", "state": "NV", "zip": "89101", "slug": "las-vegas-nv"},
    {"city": "Charlotte", "state": "NC", "zip": "28201", "slug": "charlotte-nc"},
    {"city": "Raleigh", "state": "NC", "zip": "27601", "slug": "raleigh-nc"},
    {"city": "Nashville", "state": "TN", "zip": "37201", "slug": "nashville-tn"},
    {"city": "Chicago", "state": "IL", "zip": "60601", "slug": "chicago-il"},
    {"city": "Seattle", "state": "WA", "zip": "98101", "slug": "seattle-wa"},
    {"city": "Portland", "state": "OR", "zip": "97201", "slug": "portland-or"},
    {"city": "San Diego", "state": "CA", "zip": "92101", "slug": "san-diego-ca"},
    {"city": "Los Angeles", "state": "CA", "zip": "90001", "slug": "los-angeles-ca"},
    {"city": "San Antonio", "state": "TX", "zip": "78201", "slug": "san-antonio-tx"},
    {"city": "Columbus", "state": "OH", "zip": "43201", "slug": "columbus-oh"},
]

# 25 high-intent pSEO services (Y-axis)
PSEO_SERVICES = [
    {"service_type": "Plumbing", "sub_niche": "Emergency Repair", "slug": "plumbing-emergency-repair"},
    {"service_type": "Plumbing", "sub_niche": "Installation", "slug": "plumbing-installation"},
    {"service_type": "Plumbing", "sub_niche": "Maintenance", "slug": "plumbing-maintenance"},
    {"service_type": "Plumbing", "sub_niche": "Commercial", "slug": "plumbing-commercial"},
    {"service_type": "Plumbing", "sub_niche": "Leak Detection", "slug": "plumbing-leak-detection"},
    {"service_type": "HVAC", "sub_niche": "AC Repair", "slug": "hvac-ac-repair"},
    {"service_type": "HVAC", "sub_niche": "Heating Installation", "slug": "hvac-heating-installation"},
    {"service_type": "HVAC", "sub_niche": "Duct Cleaning", "slug": "hvac-duct-cleaning"},
    {"service_type": "HVAC", "sub_niche": "Commercial", "slug": "hvac-commercial"},
    {"service_type": "HVAC", "sub_niche": "Emergency 24/7", "slug": "hvac-emergency-24-7"},
    {"service_type": "Roofing", "sub_niche": "Leak Repair", "slug": "roofing-leak-repair"},
    {"service_type": "Roofing", "sub_niche": "Replacement", "slug": "roofing-replacement"},
    {"service_type": "Roofing", "sub_niche": "Inspection", "slug": "roofing-inspection"},
    {"service_type": "Roofing", "sub_niche": "Commercial Flat Roof", "slug": "roofing-commercial-flat-roof"},
    {"service_type": "Roofing", "sub_niche": "Emergency Tarping", "slug": "roofing-emergency-tarping"},
    {"service_type": "Electrical", "sub_niche": "Panel Upgrade", "slug": "electrical-panel-upgrade"},
    {"service_type": "Electrical", "sub_niche": "Rewiring", "slug": "electrical-rewiring"},
    {"service_type": "Electrical", "sub_niche": "Generator Install", "slug": "electrical-generator-install"},
    {"service_type": "Electrical", "sub_niche": "Commercial", "slug": "electrical-commercial"},
    {"service_type": "Electrical", "sub_niche": "Emergency Repair", "slug": "electrical-emergency-repair"},
    {"service_type": "Pest Control", "sub_niche": "Termite Treatment", "slug": "pest-control-termite-treatment"},
    {"service_type": "Pest Control", "sub_niche": "Rodent Removal", "slug": "pest-control-rodent-removal"},
    {"service_type": "Pest Control", "sub_niche": "Bed Bug Extermination", "slug": "pest-control-bed-bug-extermination"},
    {"service_type": "Pest Control", "sub_niche": "Commercial Prevention", "slug": "pest-control-commercial-prevention"},
    {"service_type": "Pest Control", "sub_niche": "Mosquito Control", "slug": "pest-control-mosquito-control"},
]

# Spintax for uniqueness engine
SPINTAX = [
    {"category": "urgency_hooks", "data": ["Need help right away?", "Looking for fast, reliable service?", "Don't wait until it becomes a disaster.", "Get it fixed today.", "Facing an emergency?"]},
    {"category": "trust_signals", "data": ["Top-rated local experts", "Licensed and fully insured professionals", "Years of hands-on experience", "Trusted by your neighbors", "Guaranteed satisfaction"]},
    {"category": "call_to_action", "data": ["Call now for a free estimate", "Fill out our form to get started", "Contact us today", "Claim your fast quote", "Speak with an expert instantly"]},
]

# Synonym groups for 80% uniqueness
SYNONYM_GROUPS = [
    {"category": "service_synonyms", "terms": ["service", "repair", "installation", "maintenance", "solutions"]},
    {"category": "location_synonyms", "terms": ["local", "nearby", "in the area", "in your neighborhood", "in your city"]},
]

# Offer blocks for lead capture
OFFER_BLOCKS = [
    {"block_type": "cta", "data": {"headline": "Get a Free Quote Today", "button_text": "Get Free Quote", "form_action": "/api/submit-lead"}},
    {"block_type": "cta", "data": {"headline": "Need Help? Contact Us Now", "button_text": "Contact Us", "form_action": "/api/submit-lead"}},
]

# Geo intelligence (25 cities with lat/long, landmark)
GEO_INTELLIGENCE = [
    {"cluster_key": "austin-tx", "data": {"city": "Austin", "state": "TX", "county": "Travis", "landmark": "Texas State Capitol", "latitude": 30.2672, "longitude": -97.7431}},
    {"cluster_key": "dallas-tx", "data": {"city": "Dallas", "state": "TX", "county": "Dallas", "landmark": "Reunion Tower", "latitude": 32.7767, "longitude": -96.7970}},
    {"cluster_key": "houston-tx", "data": {"city": "Houston", "state": "TX", "county": "Harris", "landmark": "Space Center Houston", "latitude": 29.7604, "longitude": -95.3698}},
    {"cluster_key": "miami-fl", "data": {"city": "Miami", "state": "FL", "county": "Miami-Dade", "landmark": "Art Deco Historic District", "latitude": 25.7617, "longitude": -80.1918}},
    {"cluster_key": "orlando-fl", "data": {"city": "Orlando", "state": "FL", "county": "Orange", "landmark": "Walt Disney World", "latitude": 28.5383, "longitude": -81.3792}},
    {"cluster_key": "tampa-fl", "data": {"city": "Tampa", "state": "FL", "county": "Hillsborough", "landmark": "Busch Gardens", "latitude": 27.9506, "longitude": -82.4572}},
    {"cluster_key": "atlanta-ga", "data": {"city": "Atlanta", "state": "GA", "county": "Fulton", "landmark": "Georgia Aquarium", "latitude": 33.7490, "longitude": -84.3880}},
    {"cluster_key": "phoenix-az", "data": {"city": "Phoenix", "state": "AZ", "county": "Maricopa", "landmark": "Camelback Mountain", "latitude": 33.4484, "longitude": -112.0740}},
    {"cluster_key": "denver-co", "data": {"city": "Denver", "state": "CO", "county": "Denver", "landmark": "Red Rocks Amphitheatre", "latitude": 39.7392, "longitude": -104.9903}},
    {"cluster_key": "las-vegas-nv", "data": {"city": "Las Vegas", "state": "NV", "county": "Clark", "landmark": "The Las Vegas Strip", "latitude": 36.1699, "longitude": -115.1398}},
    {"cluster_key": "charlotte-nc", "data": {"city": "Charlotte", "state": "NC", "county": "Mecklenburg", "landmark": "NASCAR Hall of Fame", "latitude": 35.2271, "longitude": -80.8431}},
    {"cluster_key": "raleigh-nc", "data": {"city": "Raleigh", "state": "NC", "county": "Wake", "landmark": "North Carolina Museum of Art", "latitude": 35.7796, "longitude": -78.6382}},
    {"cluster_key": "nashville-tn", "data": {"city": "Nashville", "state": "TN", "county": "Davidson", "landmark": "Grand Ole Opry", "latitude": 36.1627, "longitude": -86.7816}},
    {"cluster_key": "chicago-il", "data": {"city": "Chicago", "state": "IL", "county": "Cook", "landmark": "Millennium Park", "latitude": 41.8781, "longitude": -87.6298}},
    {"cluster_key": "seattle-wa", "data": {"city": "Seattle", "state": "WA", "county": "King", "landmark": "Space Needle", "latitude": 47.6062, "longitude": -122.3321}},
    {"cluster_key": "portland-or", "data": {"city": "Portland", "state": "OR", "county": "Multnomah", "landmark": "Washington Park", "latitude": 45.5152, "longitude": -122.6784}},
    {"cluster_key": "san-diego-ca", "data": {"city": "San Diego", "state": "CA", "county": "San Diego", "landmark": "Balboa Park", "latitude": 32.7157, "longitude": -117.1611}},
    {"cluster_key": "los-angeles-ca", "data": {"city": "Los Angeles", "state": "CA", "county": "Los Angeles", "landmark": "Hollywood Sign", "latitude": 34.0522, "longitude": -118.2437}},
    {"cluster_key": "san-antonio-tx", "data": {"city": "San Antonio", "state": "TX", "county": "Bexar", "landmark": "The Alamo", "latitude": 29.4241, "longitude": -98.4936}},
    {"cluster_key": "columbus-oh", "data": {"city": "Columbus", "state": "OH", "county": "Franklin", "landmark": "Franklin Park Conservatory", "latitude": 39.9612, "longitude": -83.0007}},
    {"cluster_key": "indianapolis-in", "data": {"city": "Indianapolis", "state": "IN", "county": "Marion", "landmark": "Indianapolis Motor Speedway", "latitude": 39.7684, "longitude": -86.1581}},
    {"cluster_key": "fort-worth-tx", "data": {"city": "Fort Worth", "state": "TX", "county": "Tarrant", "landmark": "Fort Worth Stockyards", "latitude": 32.7254, "longitude": -97.3208}},
    {"cluster_key": "jacksonville-fl", "data": {"city": "Jacksonville", "state": "FL", "county": "Duval", "landmark": "Cummer Museum of Art", "latitude": 30.3322, "longitude": -81.6557}},
    {"cluster_key": "san-jose-ca", "data": {"city": "San Jose", "state": "CA", "county": "Santa Clara", "landmark": "Winchester Mystery House", "latitude": 37.3348, "longitude": -121.8881}},
    {"cluster_key": "san-francisco-ca", "data": {"city": "San Francisco", "state": "CA", "county": "San Francisco", "landmark": "Golden Gate Bridge", "latitude": 37.7749, "longitude": -122.4194}},
]


async def main() -> None:
    try:
        from dotenv import load_dotenv
        load_dotenv()
        # Load god-mode/.env.local (script lives in python-api/scripts/)
        env_local = Path(__file__).resolve().parent.parent.parent / ".env.local"
        if env_local.exists():
            load_dotenv(env_local)
    except ImportError:
        pass

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)

    import asyncpg
    conn = await asyncpg.connect(db_url)

    try:
        # Ensure sites.theme_config exists (DBs created before schema had it)
        await conn.execute("ALTER TABLE sites ADD COLUMN IF NOT EXISTS theme_config JSONB")
        # 1. Site chrisamaya (idempotent: reuse if exists)
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE url ILIKE '%chrisamaya.work%' LIMIT 1"
        )
        if row:
            site_id = str(row["id"])
            await conn.execute(
                "UPDATE sites SET theme_config = $1::jsonb, name = 'chrisamaya', status = 'active' WHERE id = $2::uuid",
                json.dumps(DEFAULT_THEME),
                site_id,
            )
        else:
            row = await conn.fetchrow(
                """
                INSERT INTO sites (name, url, status, theme_config)
                VALUES ('chrisamaya', 'https://chrisamaya.work', 'active', $1::jsonb)
                RETURNING id
                """,
                json.dumps(DEFAULT_THEME),
            )
            site_id = str(row["id"])
        print(f"Site: chrisamaya id={site_id}")

        # 2. Campaign (idempotent)
        row = await conn.fetchrow(
            "SELECT id FROM campaign_masters WHERE site_id = $1::uuid AND name = 'Unicorn Developer' LIMIT 1",
            site_id,
        )
        if not row:
            row = await conn.fetchrow(
                """
                INSERT INTO campaign_masters (site_id, name, status, headline_spintax_root, target_word_count)
                VALUES ($1::uuid, 'Unicorn Developer', 'active', '{Headline|Title} for {Audience|Niche}', 1500)
                RETURNING id
                """,
                site_id,
            )
        campaign_id = str(row["id"]) if row else None
        print(f"Campaign: Unicorn Developer id={campaign_id}")

        # 2b. Homepage page + page_blocks + navigation (DB-driven chrisamaya)
        page_row = await conn.fetchrow(
            "SELECT id FROM pages WHERE site_id = $1::uuid AND (slug = '' OR slug IS NULL) LIMIT 1",
            site_id,
        )
        if not page_row:
            page_row = await conn.fetchrow(
                """
                INSERT INTO pages (site_id, title, slug, status)
                VALUES ($1::uuid, 'The One-Stop Architect | Chris Amaya', '', 'published')
                RETURNING id
                """,
                site_id,
            )
        page_id = str(page_row["id"])
        n_blocks = await conn.fetchval("SELECT COUNT(*) FROM page_blocks WHERE page_id = $1::uuid", page_id)
        if n_blocks == 0:
            HOMEPAGE_BLOCKS = [
                {"block_type": "hero", "sort_order": 0, "data": {
                    "badge": "THE ONE-STOP ARCHITECT",
                    "headline": "STOP GLUING YOUR BUSINESS TOGETHER WITH <span class=\"bg-clip-text text-transparent bg-gradient-to-r from-[#00FF94] to-[#00B8FF]\">ZAPIER AND HOPE.</span>",
                    "subhead": "I am the \"Unicorn\" Developer you've been looking for. I build full-stack applications, engineer private AI systems, and automate your entire backend—so you can stop playing CTO and start being the CEO.",
                    "cta_label": "Book Consultation",
                    "cta_href": "#contact",
                    "warning_text": "WARNING: THIS IS A TECHNICAL STRATEGY SESSION. NOT A SALES CALL.",
                }},
                {"block_type": "diagnosis", "sort_order": 1, "data": {
                    "eyebrow": "THE DIAGNOSIS",
                    "title": "The \"Frankenstein\" Problem",
                    "body": "You have product-market fit. You have revenue. But your backend is a tangled mess of disconnected tools that break every time an API updates.",
                    "warning_box": {"title": "⚠ SYSTEM CRITICAL", "text": "Your business is fragile. You are one \"Zapier Error\" away from losing leads."},
                    "video_src": "/assets/videos/zombiebabyzaiper.mp4",
                    "video_poster": "/assets/videos/zombiebabyzaiper-poster.jpg",
                    "fig_label": "FIG 1.0: FRAGMENTATION VISUALIZED",
                }},
                {"block_type": "calculator", "sort_order": 2, "data": {"section_title": "Engineering Resources"}},
                {"block_type": "survey", "sort_order": 3, "data": {"section_title": "Let's Build It Right."}},
            ]
            for b in HOMEPAGE_BLOCKS:
                await conn.execute(
                    """
                    INSERT INTO page_blocks (block_type, name, page_id, sort_order, data)
                    VALUES ($1, $2, $3::uuid, $4, $5::jsonb)
                    """,
                    b["block_type"],
                    b["block_type"],
                    page_id,
                    b["sort_order"],
                    json.dumps(b["data"]),
                )
        print("Homepage page + blocks: ok")

        n_nav = await conn.fetchval("SELECT COUNT(*) FROM navigation WHERE site_id = $1::uuid", site_id)
        if n_nav == 0:
            JUMPSTART_URL = "https://jumpstartscaling.com"
            NAV_ITEMS = [
                {"label": "About Me", "href": "/#about", "nav_group": "portfolio", "sort_order": 0},
                {"label": "Projects", "href": "/#projects", "nav_group": "portfolio", "sort_order": 1},
                {"label": "Blog", "href": "/blog", "nav_group": "portfolio", "sort_order": 2},
                {"label": "Articles", "href": "/articles", "nav_group": "portfolio", "sort_order": 3},
                {"label": "Search", "href": "/search", "nav_group": "portfolio", "sort_order": 4},
                {"label": "How I Build", "href": "/guide/how-i-build", "nav_group": "portfolio", "sort_order": 5},
                {"label": "Contact", "href": "/#contact", "nav_group": "portfolio", "sort_order": 6},
                {"label": "CAC Calculator", "href": f"{JUMPSTART_URL}/resources/calculators#cac-calculator", "nav_group": "calculator", "sort_order": 0},
                {"label": "Churn Calculator", "href": f"{JUMPSTART_URL}/resources/calculators#churn-calculator", "nav_group": "calculator", "sort_order": 1},
                {"label": "LTV Calculator", "href": f"{JUMPSTART_URL}/resources/calculators#ltv-calculator", "nav_group": "calculator", "sort_order": 2},
                {"label": "ROAS / Break-Even", "href": f"{JUMPSTART_URL}/resources/calculators#break-even-calculator", "nav_group": "calculator", "sort_order": 3},
                {"label": "MRR Forecast", "href": f"{JUMPSTART_URL}/resources/calculators#mrr-forecast", "nav_group": "calculator", "sort_order": 4},
                {"label": "Cohort Analysis", "href": f"{JUMPSTART_URL}/resources/calculators#cohort-analysis", "nav_group": "calculator", "sort_order": 5},
                {"label": "Paid Acquisition", "href": f"{JUMPSTART_URL}/services/paid-acquisition", "nav_group": "jumpstart", "sort_order": 0},
                {"label": "Funnel Architecture", "href": f"{JUMPSTART_URL}/services/funnel-architecture", "nav_group": "jumpstart", "sort_order": 1},
                {"label": "CRM Transformation", "href": f"{JUMPSTART_URL}/services/crm-transformation", "nav_group": "jumpstart", "sort_order": 2},
                {"label": "Voice of Customer", "href": f"{JUMPSTART_URL}/services/authority-engine", "nav_group": "jumpstart", "sort_order": 3},
            ]
            for item in NAV_ITEMS:
                await conn.execute(
                    """
                    INSERT INTO navigation (site_id, label, href, nav_group, sort_order)
                    VALUES ($1::uuid, $2, $3, $4, $5)
                    """,
                    site_id,
                    item["label"],
                    item["href"],
                    item["nav_group"],
                    item["sort_order"],
                )
        print("Navigation: ok")

        # 3. Content fragments (skip if already seeded)
        if campaign_id:
            n = await conn.fetchval(
                "SELECT COUNT(*) FROM content_fragments WHERE campaign_id = $1::uuid",
                campaign_id,
            )
            if n == 0:
                for ftype, body in [
                    ("intro", "Stop gluing your business together with Zapier and hope. Build systems that scale."),
                    ("cta", "Book a Technical Strategy Session. No sales pitch—just architecture."),
                ]:
                    await conn.execute(
                        """
                        INSERT INTO content_fragments (campaign_id, fragment_type, content_body, fragment_text, status)
                        VALUES ($1::uuid, $2, $3, $3, 'active')
                        """,
                        campaign_id,
                        ftype,
                        body,
                    )
            print("Content fragments: ok")

        # 4. Headline inventory
        if campaign_id:
            n = await conn.fetchval(
                "SELECT COUNT(*) FROM headline_inventory WHERE campaign_id = $1::uuid",
                campaign_id,
            )
            if n == 0:
                for title in [
                    "The Unicorn Developer Who Replaces Your Entire Tech Team",
                    "From Frankenstein Backend to Coherent Systems",
                    "Why Zapier Is Holding Your Growth Back",
                ]:
                    await conn.execute(
                        "INSERT INTO headline_inventory (campaign_id, headline_text, status) VALUES ($1::uuid, $2, 'active')",
                        campaign_id,
                        title,
                    )
            print("Headline inventory: ok")

        # 5. Posts (skip if slug exists for this site)
        for p in SAMPLE_POSTS:
            exists = await conn.fetchval(
                "SELECT 1 FROM posts WHERE site_id = $1::uuid AND slug = $2 LIMIT 1",
                site_id,
                p["slug"],
            )
            if not exists:
                await conn.execute(
                    """
                    INSERT INTO posts (site_id, title, slug, content, excerpt, status, published_at)
                    VALUES ($1::uuid, $2, $3, $4, $5, 'published', NOW())
                    """,
                    site_id,
                    p["title"],
                    p["slug"],
                    p["content"],
                    p.get("excerpt", "")[:500],
                )
        print("Posts: ok")

        # 6. Locations (idempotent: ON CONFLICT slug)
        for loc in LOCATIONS:
            await conn.execute(
                """
                INSERT INTO locations (city, state, zip, slug)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (slug) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state, zip = EXCLUDED.zip
                """,
                loc["city"],
                loc["state"],
                loc.get("zip"),
                loc["slug"],
            )
        print(f"Locations: {len(LOCATIONS)} rows")

        # 7. pseo_services (idempotent: ON CONFLICT slug)
        for svc in PSEO_SERVICES:
            await conn.execute(
                """
                INSERT INTO pseo_services (service_type, sub_niche, slug)
                VALUES ($1, $2, $3)
                ON CONFLICT (slug) DO UPDATE SET service_type = EXCLUDED.service_type, sub_niche = EXCLUDED.sub_niche
                """,
                svc["service_type"],
                svc.get("sub_niche"),
                svc["slug"],
            )
        print(f"pseo_services: {len(PSEO_SERVICES)} rows")

        # 8. spintax_dictionaries (skip if any exist)
        n_spintax = await conn.fetchval("SELECT COUNT(*) FROM spintax_dictionaries")
        if n_spintax == 0:
            for item in SPINTAX:
                await conn.execute(
                    "INSERT INTO spintax_dictionaries (category, data) VALUES ($1, $2::jsonb)",
                    item["category"],
                    json.dumps(item["data"]),
                )
        print("spintax_dictionaries: ok")

        # 9. synonym_groups (skip if any exist)
        n_syn = await conn.fetchval("SELECT COUNT(*) FROM synonym_groups")
        if n_syn == 0:
            for item in SYNONYM_GROUPS:
                await conn.execute(
                    "INSERT INTO synonym_groups (category, terms) VALUES ($1, $2::jsonb)",
                    item["category"],
                    json.dumps(item["terms"]),
                )
        print("synonym_groups: ok")

        # 10. offer_blocks (skip if any exist)
        n_offer = await conn.fetchval("SELECT COUNT(*) FROM offer_blocks")
        if n_offer == 0:
            for item in OFFER_BLOCKS:
                await conn.execute(
                    "INSERT INTO offer_blocks (block_type, data) VALUES ($1, $2::jsonb)",
                    item["block_type"],
                    json.dumps(item["data"]),
                )
        print("offer_blocks: ok")

        # 11. geo_intelligence (idempotent: skip if cluster_key exists)
        for geo in GEO_INTELLIGENCE:
            exists = await conn.fetchval(
                "SELECT 1 FROM geo_intelligence WHERE cluster_key = $1 LIMIT 1",
                geo["cluster_key"],
            )
            if not exists:
                await conn.execute(
                    "INSERT INTO geo_intelligence (cluster_key, data) VALUES ($1, $2::jsonb)",
                    geo["cluster_key"],
                    json.dumps(geo["data"]),
                )
        print(f"geo_intelligence: {len(GEO_INTELLIGENCE)} rows")

        # 12. content_matrix: Cartesian multiply locations x pseo_services
        loc_rows = await conn.fetch("SELECT id, slug FROM locations WHERE slug = ANY($1::text[])", [l["slug"] for l in LOCATIONS])
        svc_rows = await conn.fetch("SELECT id, slug FROM pseo_services WHERE slug = ANY($1::text[])", [s["slug"] for s in PSEO_SERVICES])
        loc_by_slug = {r["slug"]: r["id"] for r in loc_rows}
        svc_by_slug = {r["slug"]: r["id"] for r in svc_rows}
        for loc in LOCATIONS:
            loc_id = loc_by_slug.get(loc["slug"])
            if not loc_id:
                continue
            for svc in PSEO_SERVICES:
                svc_id = svc_by_slug.get(svc["slug"])
                if not svc_id:
                    continue
                cm_slug = f"{loc['slug']}-{svc['slug']}"
                title = f"{svc['service_type']} {svc.get('sub_niche', '')} in {loc['city']}, {loc['state']}".strip()
                meta = f"Find {svc['service_type']} {svc.get('sub_niche', '')} in {loc['city']}, {loc['state']}. Local experts ready to help."
                await conn.execute(
                    """
                    INSERT INTO content_matrix (location_id, service_id, slug, title, meta_description)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (slug) DO NOTHING
                    """,
                    loc_id,
                    svc_id,
                    cm_slug,
                    title,
                    meta,
                )
        cm_count = await conn.fetchval("SELECT COUNT(*) FROM content_matrix")
        print(f"content_matrix: {cm_count} total rows (Cartesian locations x services)")

        print("\nDone. site_id =", site_id)
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
