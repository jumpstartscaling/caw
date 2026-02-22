"""Seed endpoints - run chrisamaya.work tenant seed via API. Requires X-Admin-Key."""
import json
from fastapi import APIRouter, Header, HTTPException

from app.config import config
from app.db.connection import get_db, DatabaseUnavailableError
from app.seed_data.chrisamaya import (
    DEFAULT_THEME,
    LOCATIONS,
    PSEO_SERVICES,
    SYNONYM_GROUPS,
    SPINTAX,
    CONTENT_FRAGMENTS,
    HEADLINES,
    OFFER_BLOCKS,
    _geo_for_slug,
)

router = APIRouter(prefix="/api/seed", tags=["seed"])


async def _run_chrisamaya_seed(conn):
    """Execute chrisamaya v4 seed logic. Returns {site_id, campaign_id, counts}."""
    counts = {}

    # 1. Site (idempotent)
    row = await conn.fetchrow("SELECT id FROM sites WHERE url ILIKE '%chrisamaya.work%' LIMIT 1")
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
    counts["site"] = 1

    # 2. Campaign
    row = await conn.fetchrow(
        "SELECT id FROM campaign_masters WHERE site_id = $1::uuid AND name = 'Unicorn Developer' LIMIT 1",
        site_id,
    )
    niche_vars = json.dumps({"refresh_mode": "light", "uniqueness_target": 82})
    spintax_root = "{Ready to|Want to|Need to} {build|launch|scale|automate} your {Custom SaaS|Private AI System|Unicorn App} {in|for} {City}?"
    if not row:
        row = await conn.fetchrow(
            """
            INSERT INTO campaign_masters (site_id, name, status, headline_spintax_root, target_word_count, niche_variables)
            VALUES ($1::uuid, 'Unicorn Developer', 'active', $2, 2000, $3::jsonb)
            RETURNING id
            """,
            site_id,
            spintax_root,
            niche_vars,
        )
    else:
        await conn.execute(
            """
            UPDATE campaign_masters SET headline_spintax_root = $1, target_word_count = 2000, niche_variables = $2::jsonb
            WHERE id = $3::uuid
            """,
            spintax_root,
            niche_vars,
            row["id"],
        )
    campaign_id = str(row["id"])
    counts["campaign"] = 1

    # 3. Locations
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
    counts["locations"] = len(LOCATIONS)

    # 4. pseo_services
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
    counts["pseo_services"] = len(PSEO_SERVICES)

    # 5. Synonym groups
    for item in SYNONYM_GROUPS:
        n = await conn.fetchval("SELECT COUNT(*) FROM synonym_groups WHERE category = $1", item["category"])
        if n == 0:
            await conn.execute(
                "INSERT INTO synonym_groups (category, terms) VALUES ($1, $2::jsonb)",
                item["category"],
                json.dumps(item["terms"]),
            )
    counts["synonym_groups"] = len(SYNONYM_GROUPS)

    # 6. Spintax
    for item in SPINTAX:
        n = await conn.fetchval("SELECT COUNT(*) FROM spintax_dictionaries WHERE category = $1", item["category"])
        if n == 0:
            await conn.execute(
                "INSERT INTO spintax_dictionaries (category, data) VALUES ($1, $2::jsonb)",
                item["category"],
                json.dumps(item["data"]),
            )
    counts["spintax_dictionaries"] = len(SPINTAX)

    # 7. Content fragments
    n_frag = await conn.fetchval(
        "SELECT COUNT(*) FROM content_fragments WHERE campaign_id = $1::uuid",
        campaign_id,
    )
    if n_frag < 50:
        for ftype, body in CONTENT_FRAGMENTS:
            await conn.execute(
                """
                INSERT INTO content_fragments (campaign_id, fragment_type, content_body, fragment_text, status)
                VALUES ($1::uuid, $2, $3, $3, 'active')
                """,
                campaign_id,
                ftype,
                body,
            )
    counts["content_fragments"] = len(CONTENT_FRAGMENTS)

    # 8. Headlines
    n_hl = await conn.fetchval(
        "SELECT COUNT(*) FROM headline_inventory WHERE campaign_id = $1::uuid",
        campaign_id,
    )
    if n_hl < 30:
        for htype, text in HEADLINES:
            await conn.execute(
                "INSERT INTO headline_inventory (campaign_id, headline_text, status) VALUES ($1::uuid, $2, 'active')",
                campaign_id,
                text,
            )
    counts["headline_inventory"] = len(HEADLINES)

    # 9. Offer blocks
    n_offer = await conn.fetchval("SELECT COUNT(*) FROM offer_blocks")
    if n_offer < 18:
        for item in OFFER_BLOCKS:
            await conn.execute(
                "INSERT INTO offer_blocks (block_type, data) VALUES ($1, $2::jsonb)",
                item["block_type"],
                json.dumps(item["data"]),
            )
    counts["offer_blocks"] = len(OFFER_BLOCKS)

    # 10. geo_intelligence
    for loc in LOCATIONS:
        slug = loc["slug"]
        data = _geo_for_slug(slug)
        data["latitude"] = 30.0 + hash(slug) % 20 * 0.1
        data["longitude"] = -100.0 + hash(slug) % 30 * 0.5
        exists = await conn.fetchval("SELECT 1 FROM geo_intelligence WHERE cluster_key = $1 LIMIT 1", slug)
        if not exists:
            await conn.execute(
                "INSERT INTO geo_intelligence (cluster_key, data) VALUES ($1, $2::jsonb)",
                slug,
                json.dumps(data),
            )
    counts["geo_intelligence"] = len(LOCATIONS)

    # 11. content_matrix — Cartesian
    loc_rows = await conn.fetch(
        "SELECT id, slug FROM locations WHERE slug = ANY($1::text[])",
        [l["slug"] for l in LOCATIONS],
    )
    svc_rows = await conn.fetch(
        "SELECT id, slug FROM pseo_services WHERE slug = ANY($1::text[])",
        [s["slug"] for s in PSEO_SERVICES],
    )
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
            cm_slug = f"{svc['slug']}-{loc['slug']}"
            title = f"{svc['service_type']} {svc.get('sub_niche', '')} in {loc['city']}, {loc['state']}".strip()
            meta = f"Find {svc['service_type']} {svc.get('sub_niche', '')} in {loc['city']}, {loc['state']}. Expert solutions. Book a free audit."
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
    counts["content_matrix"] = cm_count

    # 12. Homepage page + page_blocks (DB-driven template)
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
    n_blocks = await conn.fetchval(
        "SELECT COUNT(*) FROM page_blocks WHERE page_id = $1::uuid",
        page_id,
    )
    if n_blocks == 0:
        homepage_blocks = [
            (
                "hero",
                0,
                {
                    "badge": "THE ONE-STOP ARCHITECT",
                    "headline": "STOP GLUING YOUR BUSINESS <br class=\"hidden md:block\" />TOGETHER WITH <span class=\"bg-clip-text text-transparent bg-gradient-to-r from-[#00FF94] to-[#00B8FF]\">ZAPIER AND HOPE.</span>",
                    "subhead": "I am the \"Unicorn\" Developer you've been looking for. I build full-stack applications, engineer private AI systems, and automate your entire backend—so you can stop playing CTO and start being the CEO.",
                    "cta_label": "Book Consultation",
                    "cta_href": "#contact",
                    "warning_text": "WARNING: THIS IS A TECHNICAL STRATEGY SESSION. NOT A SALES CALL.",
                },
            ),
            (
                "diagnosis",
                1,
                {
                    "eyebrow": "THE DIAGNOSIS",
                    "title": "The \"Frankenstein\" Problem",
                    "body": "You have product-market fit. You have revenue. But your backend is a tangled mess of disconnected tools that break every time an API updates.",
                    "warning_box": {"title": "⚠ SYSTEM CRITICAL", "text": "Your business is fragile. You are one \"Zapier Error\" away from losing leads."},
                    "video_src": "/assets/videos/zombiebabyzaiper.mp4",
                    "video_poster": "/assets/videos/zombiebabyzaiper-poster.jpg",
                    "fig_label": "FIG 1.0: FRAGMENTATION VISUALIZED",
                },
            ),
            ("calculator", 2, {"section_title": "Engineering Resources"}),
            ("survey", 3, {"section_title": "Let's Build It Right."}),
        ]
        for block_type, sort_order, data in homepage_blocks:
            await conn.execute(
                """
                INSERT INTO page_blocks (page_id, block_type, data, sort_order)
                VALUES ($1::uuid, $2, $3::jsonb, $4)
                """,
                page_id,
                block_type,
                json.dumps(data),
                sort_order,
            )
    counts["pages"] = 1
    counts["page_blocks"] = 4

    # 13. Core pages (about, contact, audit, terms, privacy, services, resources/calculators)
    core_pages = [
        ("about", "About | Chris Amaya", []),
        ("contact", "Contact | Chris Amaya", [("hero", {"badge": "GET IN TOUCH", "headline": "Let's Build Together", "subhead": "Book a technical strategy session. No pitch.", "cta_label": "Book Consultation", "cta_href": "#contact-form"}), ("cta", {"heading": "Ready to Start?", "text": "Fill out the form below or book a call.", "label": "Book a Call", "href": "#contact-form"})]),
        ("audit", "Technical Audit | Chris Amaya", [("hero", {"badge": "FREE AUDIT", "headline": "Get Your AI Architecture Audit", "subhead": "90 seconds. Custom roadmap. No pitch.", "cta_label": "Start Audit", "cta_href": "#contact"}), ("cta", {"heading": "Claim Your Free Audit", "text": "See how we can replace Zapier and scale your stack.", "label": "Get Audit", "href": "#contact"})]),
        ("terms", "Terms of Service | Chris Amaya", [("value_prop", {"title": "Terms of Service", "body": "Terms of service content. Update via admin."})]),
        ("privacy", "Privacy Policy | Chris Amaya", [("value_prop", {"title": "Privacy Policy", "body": "Privacy policy content. Update via admin."})]),
        ("services", "Services | Chris Amaya", [("hero", {"badge": "SERVICES", "headline": "What I Build", "subhead": "Custom SaaS, Private AI, Headless CMS, and more.", "cta_label": "Get Started", "cta_href": "#contact"}), ("cta", {"heading": "Ready to Build?", "text": "Let's discuss your project.", "label": "Book a Call", "href": "#contact"})]),
        ("resources/calculators", "Calculators | Chris Amaya", [("hero", {"badge": "TOOLS", "headline": "Growth Calculators", "subhead": "ROAS, CAC, LTV, and more.", "cta_label": "Start Calculating", "cta_href": "#calculators"}), ("calculator", {"section_title": "Engineering Resources"})]),
        ("guide/how-i-build", "How I Build | Chris Amaya", [("hero", {"badge": "METHODOLOGY", "headline": "How I Build", "subhead": "From discovery to deployment.", "cta_label": "Get Started", "cta_href": "#contact"}), ("value_prop", {"title": "The Unicorn Process", "body": "Discovery → Design → Deploy. I build production-grade systems in under 14 days."}), ("cta", {"heading": "Ready to Build?", "text": "Let's discuss your project.", "label": "Book a Call", "href": "#contact"})]),
    ]
    # 14. Development offer pages (custom apps: Python, frontend, full-stack, DB, Google APIs, WordPress, calculators, 3D)
    offer_pages = [
        ("services/custom-apps/python-api", "Python & FastAPI | Custom Backend | Chris Amaya", [
            ("hero", {"badge": "BACKEND", "headline": "Python & FastAPI Custom APIs", "subhead": "Async PostgreSQL, REST, and automation backends built for scale.", "cta_label": "Discuss Your API", "cta_href": "#contact"}),
            ("value_prop", {"title": "Production-Grade Python Backends", "body": "FastAPI, asyncpg, and PostgreSQL — the same stack powering God Mode. Custom APIs, webhooks, and integrations delivered in under 14 days."}),
            ("icon_bullets", {"title": "What We Build", "bullets": [{"icon": "🐍", "title": "FastAPI", "text": "Async REST APIs with OpenAPI docs"}, {"icon": "⚡", "title": "PostgreSQL", "text": "Schema design, migrations, asyncpg"}, {"icon": "🔗", "title": "Integrations", "text": "Webhooks, third-party APIs, queues"}]}),
            ("cta", {"heading": "Need a Custom Backend?", "text": "Let's scope your API.", "label": "Book a Call", "href": "#contact"}),
        ]),
        ("services/custom-apps/frontend", "Astro, React & Vite | Custom Frontend | Chris Amaya", [
            ("hero", {"badge": "FRONTEND", "headline": "Astro, React & Vite Apps", "subhead": "SSR, Tailwind, Framer Motion. Marketing sites and dashboards.", "cta_label": "Get Started", "cta_href": "#contact"}),
            ("value_prop", {"title": "Modern Frontend Stack", "body": "Astro for content, React for interactivity, Vite for speed. Same stack as this site and jumpstartscaling."}),
            ("icon_bullets", {"title": "Technologies", "bullets": [{"icon": "🪐", "title": "Astro", "text": "Content-focused, zero JS by default"}, {"icon": "⚛️", "title": "React", "text": "Interactive components, calculators"}, {"icon": "🎨", "title": "Tailwind", "text": "Utility-first, responsive design"}]}),
            ("cta", {"heading": "Ready for a Custom Frontend?", "text": "Let's build it.", "label": "Book a Call", "href": "#contact"}),
        ]),
        ("services/custom-apps/full-stack", "Full-Stack Astro + FastAPI | Chris Amaya", [
            ("hero", {"badge": "FULL-STACK", "headline": "Astro + FastAPI Full-Stack", "subhead": "SSR, multi-tenant, DB-driven. The God Mode template.", "cta_label": "Discuss Your Stack", "cta_href": "#contact"}),
            ("value_prop", {"title": "DB-Driven Multi-Tenant Apps", "body": "Same architecture as chrisamaya.work. Routes in Astro, content from PostgreSQL. No rebuilds when you change blocks."}),
            ("icon_bullets", {"title": "Stack", "bullets": [{"icon": "🔄", "title": "SSR", "text": "Server-rendered, CDN-cached"}, {"icon": "🏢", "title": "Multi-Tenant", "text": "One codebase, many domains"}, {"icon": "📦", "title": "DB Layout", "text": "Blocks, nav, footer from API"}]}),
            ("cta", {"heading": "Build Your Full-Stack App", "text": "Let's talk architecture.", "label": "Book a Call", "href": "#contact"}),
        ]),
        ("services/custom-apps/database", "PostgreSQL & Database Design | Chris Amaya", [
            ("hero", {"badge": "DATABASE", "headline": "PostgreSQL Schema & Migrations", "subhead": "Schema design, migrations, optimization. Built for scale.", "cta_label": "Discuss Your Schema", "cta_href": "#contact"}),
            ("value_prop", {"title": "Production Database Design", "body": "Schema design, indexes, asyncpg integration. We build the foundation your app needs."}),
            ("icon_bullets", {"title": "Services", "bullets": [{"icon": "📐", "title": "Schema Design", "text": "Normalized, indexed, documented"}, {"icon": "🔄", "title": "Migrations", "text": "Versioned, reversible migrations"}, {"icon": "⚡", "title": "Performance", "text": "Query optimization, connection pooling"}]}),
            ("cta", {"heading": "Database Design Help?", "text": "Let's design it right.", "label": "Book a Call", "href": "#contact"}),
        ]),
        ("services/custom-apps/google-apis", "Google Solar, Roofing & Maps API | Chris Amaya", [
            ("hero", {"badge": "GOOGLE APIS", "headline": "Solar, Roofing & Maps Integration", "subhead": "Custom apps using Google Solar API, Roofing API, Maps, Places, Geocoding.", "cta_label": "Explore Integrations", "cta_href": "#contact"}),
            ("value_prop", {"title": "Google APIs for Your Product", "body": "Solar potential, rooftop data, maps, directions, places. We integrate Google's APIs into your custom application."}),
            ("icon_bullets", {"title": "APIs We Integrate", "bullets": [{"icon": "☀️", "title": "Solar API", "text": "Rooftop solar feasibility, potential"}, {"icon": "🏠", "title": "Roofing API", "text": "Roof data, material, age"}, {"icon": "🗺️", "title": "Maps & Places", "text": "Geocoding, directions, locations"}]}),
            ("cta", {"heading": "Need Google API Integration?", "text": "Let's build it.", "label": "Book a Call", "href": "#contact"}),
        ]),
        ("services/custom-apps/wordpress", "Headless WordPress & Custom Plugins | Chris Amaya", [
            ("hero", {"badge": "WORDPRESS", "headline": "Headless WordPress & Custom Development", "subhead": "REST API, GraphQL, custom themes, plugins, WooCommerce.", "cta_label": "Discuss Your WP", "cta_href": "#contact"}),
            ("value_prop", {"title": "WordPress as a Headless CMS", "body": "Use WordPress for content, Astro/React for frontend. Custom plugins, ACF, Gutenberg blocks. Migration to headless when ready."}),
            ("icon_bullets", {"title": "Capabilities", "bullets": [{"icon": "🔌", "title": "Headless WP", "text": "REST API, GraphQL"}, {"icon": "🧩", "title": "Plugins & Themes", "text": "Custom development"}, {"icon": "🛒", "title": "WooCommerce", "text": "E-commerce, integrations"}]}),
            ("cta", {"heading": "WordPress Project?", "text": "Let's modernize it.", "label": "Book a Call", "href": "#contact"}),
        ]),
        ("services/custom-apps/calculators", "React Calculators & Interactive Tools | Chris Amaya", [
            ("hero", {"badge": "TOOLS", "headline": "Custom Calculators & Interactive Tools", "subhead": "ROAS, CAC, LTV, forecasts. React calculators and dashboards.", "cta_label": "Build a Calculator", "cta_href": "#contact"}),
            ("value_prop", {"title": "Lead-Magnet Calculators", "body": "ROAS, funnel, LTV calculators — like the ones on jumpstartscaling. Custom interactive tools that capture leads."}),
            ("icon_bullets", {"title": "Examples", "bullets": [{"icon": "💰", "title": "ROAS Calculator", "text": "Ad spend ROI"}, {"icon": "📊", "title": "Funnel Calculator", "text": "Conversion metrics"}, {"icon": "📈", "title": "Forecasts", "text": "MRR, LTV projections"}]}),
            ("cta", {"heading": "Need a Custom Calculator?", "text": "Let's build it.", "label": "Book a Call", "href": "#contact"}),
        ]),
        ("services/custom-apps/3d-visual", "Three.js, Rive & 3D Visual | Chris Amaya", [
            ("hero", {"badge": "3D & VISUAL", "headline": "Three.js, Rive & Spline", "subhead": "3D web experiences, animations, interactive visuals.", "cta_label": "Discuss Your Vision", "cta_href": "#contact"}),
            ("value_prop", {"title": "3D and Motion on the Web", "body": "Three.js for 3D, Rive for interactive animation, Spline for design-to-3D. Product showcases and immersive experiences."}),
            ("icon_bullets", {"title": "Technologies", "bullets": [{"icon": "🎮", "title": "Three.js", "text": "WebGL 3D scenes"}, {"icon": "✨", "title": "Rive", "text": "Interactive animation"}, {"icon": "🎨", "title": "Spline", "text": "Design-to-3D workflow"}]}),
            ("cta", {"heading": "3D or Motion Project?", "text": "Let's create it.", "label": "Book a Call", "href": "#contact"}),
        ]),
    ]
    for slug, title, block_specs in core_pages:
        existing = await conn.fetchrow(
            "SELECT id FROM pages WHERE site_id = $1::uuid AND slug = $2 LIMIT 1",
            site_id,
            slug,
        )
        if not existing:
            page_row = await conn.fetchrow(
                """
                INSERT INTO pages (site_id, title, slug, status)
                VALUES ($1::uuid, $2, $3, 'published')
                RETURNING id
                """,
                site_id,
                title,
                slug,
            )
            page_id_p = str(page_row["id"])
            for i, spec in enumerate(block_specs):
                bt, data = spec if len(spec) == 2 else (spec[0], {})
                await conn.execute(
                    """
                    INSERT INTO page_blocks (page_id, block_type, data, sort_order)
                    VALUES ($1::uuid, $2, $3::jsonb, $4)
                    """,
                    page_id_p,
                    bt,
                    json.dumps(data if isinstance(data, dict) else {}),
                    i,
                )
            counts["pages"] = counts.get("pages", 1) + 1
    for slug, title, block_specs in offer_pages:
        existing = await conn.fetchrow(
            "SELECT id FROM pages WHERE site_id = $1::uuid AND slug = $2 LIMIT 1",
            site_id,
            slug,
        )
        if not existing:
            page_row = await conn.fetchrow(
                """
                INSERT INTO pages (site_id, title, slug, status)
                VALUES ($1::uuid, $2, $3, 'published')
                RETURNING id
                """,
                site_id,
                title,
                slug,
            )
            page_id_p = str(page_row["id"])
            for i, spec in enumerate(block_specs):
                bt, data = spec if len(spec) == 2 else (spec[0], {})
                await conn.execute(
                    """
                    INSERT INTO page_blocks (page_id, block_type, data, sort_order)
                    VALUES ($1::uuid, $2, $3::jsonb, $4)
                    """,
                    page_id_p,
                    bt,
                    json.dumps(data if isinstance(data, dict) else {}),
                    i,
                )
            counts["pages"] = counts.get("pages", 1) + 1
    total_blocks = await conn.fetchval(
        "SELECT COUNT(*) FROM page_blocks WHERE page_id IN (SELECT id FROM pages WHERE site_id = $1::uuid)",
        site_id,
    )
    if total_blocks is not None:
        counts["page_blocks"] = total_blocks

    return {
        "site_id": site_id,
        "campaign_id": campaign_id,
        "counts": counts,
        "message": "chrisamaya.work God Mode v4 — 2000-word survey factory ready.",
    }


@router.post("/chrisamaya")
async def seed_chrisamaya(x_admin_key: str = Header(alias="X-Admin-Key", default="")):
    """Seed chrisamaya.work tenant (site, campaign, locations, pseo_services, etc.). Requires X-Admin-Key."""
    if not x_admin_key or x_admin_key != config.ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Admin key required")
    try:
        async with get_db() as conn:
            result = await _run_chrisamaya_seed(conn)
        return result
    except DatabaseUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
