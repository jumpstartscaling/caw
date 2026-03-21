"""
chrisamaya.work caw_content seed — populates caw_seed and caw_content for the standalone caw app.
The caw app reads from caw_content (not pages/page_blocks). God-mode-api runs this on startup
so chrisamaya.work has content without a separate manual seed.
"""
import json

DEFAULT_THEME = {
    "palette": "emerald",
    "nav": {
        "portfolio": [
            {"name": "The Problem", "href": "/#hook"},
            {"name": "Architecture", "href": "/#solution"},
            {"name": "Blog", "href": "/blog"},
            {"name": "How I Build", "href": "/guide/how-i-build"},
            {"name": "Knowledge Base", "href": "/knowledge-base"},
            {"name": "Search", "href": "/search"},
        ],
        "custom_apps": [
            {"name": "Python & FastAPI", "href": "/services/custom-apps/python-api"},
            {"name": "Astro & React", "href": "/services/custom-apps/frontend"},
            {"name": "Full-Stack", "href": "/services/custom-apps/full-stack"},
            {"name": "PostgreSQL", "href": "/services/custom-apps/database"},
            {"name": "Google APIs", "href": "/services/custom-apps/google-apis"},
            {"name": "WordPress", "href": "/services/custom-apps/wordpress"},
            {"name": "Calculators", "href": "/services/custom-apps/calculators"},
            {"name": "3D & Visual", "href": "/services/custom-apps/3d-visual"},
        ],
        "growth_tools": [
            {"name": "Jumpstart Scaling", "href": "https://jumpstartscaling.com"},
            {"name": "Growth Retainer", "href": "https://jumpstartscaling.com/services/growth-retainer"},
            {"name": "CRM Build", "href": "https://jumpstartscaling.com/services/crm-transformation"},
        ],
        "cta": {"label": "INITIATE_HANDSHAKE", "href": "#audit"},
    },
    "footer": {"tagline": "The Unicorn Developer.", "copyright": "Chris Amaya"},
}

HOMEPAGE_BLOCKS = [
    ("hero", {"badge": "STATUS: ACCEPTING 2 CLIENTS FOR Q1", "headline": 'I ARCHITECT SYSTEMS<br class="hidden md:block" />THAT <span class="text-neon">SCALE AGENCIES</span>.', "subhead": "Stop gluing your business together with Zapier and hope.\nI build Sovereign Infrastructure that works while you sleep.", "cta_label": "< DEPLOY_ARCHITECT />", "cta_href": "#audit", "warning_text": "// WARNING: Technical Strategy Session Only. No Sales Fluff."}),
    ("terminal_problem", {"eyebrow": "// SYSTEM_CRITICAL_ERROR", "title": 'The "Frankenstein" Stack Is Killing Your Margins.', "body": "You have revenue. You have product-market fit. But your backend is a tangled mess of SaaS subscriptions, broken webhooks, and manual data entry.", "bullets": ["⚠ SALES TEAM IS BLIND (CRM not syncing)", "⚠ ZAPIER BILL IS SCALING FASTER THAN REVENUE", "⚠ YOU ARE THE BOTTLENECK (Playing CTO instead of CEO)"], "terminal_logs": [{"time": "09:00:01", "msg": "[ERROR] Webhook Timeout: Zapier webhook failed to respond."}, {"time": "09:05:23", "msg": "[CRITICAL] Lead Loss: 5 leads failed to sync to GHL."}, {"time": "09:12:00", "msg": "[WARN] API Rate Limit Exceeded (Airtable)."}], "status_text": "_ SYSTEM_UNSTABLE"}),
    ("solution_cards", {"eyebrow": "// THE_FIX", "title": "Sovereign Infrastructure", "cards": [{"title": "< INFRASTRUCTURE />", "body": "Self-hosted n8n automation engines that run on your own servers. Zero per-task fees. Infinite scalability.", "border_color": "neon-blue"}, {"title": "< INTELLIGENCE />", "body": "Private LLM agents that draft emails, qualify leads, and analyze competitors without leaking data to OpenAI.", "border_color": "neon-green"}, {"title": "< REVENUE_PHYSICS />", "body": "Server-side tracking (CAPI) and attribution dashboards that tell you exactly where your ROAS is coming from.", "border_color": "neon-pink"}]}),
    ("authority", {"title": "I Am Not A Freelancer.<br>I Am An Architect.", "body": 'Most developers write code to finish a ticket. I design systems to finish the business model. As the founder of <a href="https://jumpstartscaling.com" class="text-neon border-b border-[#00FF94]">Jumpstart Scaling</a>, I have seen the backend of 50+ scaling agencies.', "stats": [{"value": "50+", "label": "Systems Built"}, {"value": "$10M+", "label": "Revenue Supported"}]}),
    ("audit_form", {"title": "Technical Strategy Session", "subhead": "Let's audit your stack and find the bottleneck.", "form_title": "INITIATE_HANDSHAKE_PROTOCOL", "submit_source": "ChrisAmayaWork"}),
    ("calculator", {"section_title": "Engineering Resources"}),
    ("survey", {"section_title": "Let's Build It Right."}),
]

CORE_PAGES = [
    ("about", "About | Chris Amaya", [["hero", {"badge": "ABOUT", "headline": "About Chris Amaya", "subhead": "The Unicorn Developer.", "cta_label": "Get Started", "cta_href": "#contact"}], ["cta", {"heading": "Ready to Start?", "text": "Let's build together.", "label": "Book a Call", "href": "#contact"}]]),
    ("contact", "Contact | Chris Amaya", [["hero", {"badge": "GET IN TOUCH", "headline": "Let's Build Together", "subhead": "Book a technical strategy session. No pitch.", "cta_label": "Book Consultation", "cta_href": "#contact-form"}], ["cta", {"heading": "Ready to Start?", "text": "Fill out the form below or book a call.", "label": "Book a Call", "href": "#contact-form"}]]),
    ("audit", "Technical Audit | Chris Amaya", [["hero", {"badge": "FREE AUDIT", "headline": "Get Your AI Architecture Audit", "subhead": "90 seconds. Custom roadmap. No pitch.", "cta_label": "Start Audit", "cta_href": "#contact"}], ["cta", {"heading": "Claim Your Free Audit", "text": "See how we can replace Zapier and scale your stack.", "label": "Get Audit", "href": "#contact"}]]),
    ("terms", "Terms of Service | Chris Amaya", [["value_prop", {"title": "Terms of Service", "body": "Terms of service content. Update via admin."}]]),
    ("privacy", "Privacy Policy | Chris Amaya", [["value_prop", {"title": "Privacy Policy", "body": "Privacy policy content. Update via admin."}]]),
    ("services", "Services | Chris Amaya", [["hero", {"badge": "SERVICES", "headline": "What I Build", "subhead": "Custom SaaS, Private AI, Headless CMS, and more.", "cta_label": "Get Started", "cta_href": "#contact"}], ["cta", {"heading": "Ready to Build?", "text": "Let's discuss your project.", "label": "Book a Call", "href": "#contact"}]]),
    ("resources/calculators", "Calculators | Chris Amaya", [["hero", {"badge": "TOOLS", "headline": "Growth Calculators", "subhead": "ROAS, CAC, LTV, and more.", "cta_label": "Start Calculating", "cta_href": "#calculators"}], ["calculator", {"section_title": "Engineering Resources"}]]),
    ("guide/how-i-build", "How I Build | Chris Amaya", [["hero", {"badge": "METHODOLOGY", "headline": "How I Build", "subhead": "From discovery to deployment.", "cta_label": "Get Started", "cta_href": "#contact"}], ["value_prop", {"title": "The Unicorn Process", "body": "Discovery → Design → Deploy. I build production-grade systems in under 14 days."}], ["cta", {"heading": "Ready to Build?", "text": "Let's discuss your project.", "label": "Book a Call", "href": "#contact"}]]),
]

OFFER_PAGES = [
    ("services/custom-apps/python-api", "Python & FastAPI | Custom Backend | Chris Amaya", [["hero", {"badge": "BACKEND", "headline": "Python & FastAPI Custom APIs", "subhead": "Async PostgreSQL, REST, and automation backends built for scale.", "cta_label": "Discuss Your API", "cta_href": "#contact"}], ["value_prop", {"title": "Production-Grade Python Backends", "body": "FastAPI, asyncpg, and PostgreSQL — the same stack powering God Mode."}], ["cta", {"heading": "Need a Custom Backend?", "text": "Let's scope your API.", "label": "Book a Call", "href": "#contact"}]]),
    ("services/custom-apps/frontend", "Astro, React & Vite | Custom Frontend | Chris Amaya", [["hero", {"badge": "FRONTEND", "headline": "Astro, React & Vite Apps", "subhead": "SSR, Tailwind, Framer Motion. Marketing sites and dashboards.", "cta_label": "Get Started", "cta_href": "#contact"}], ["value_prop", {"title": "Modern Frontend Stack", "body": "Astro for content, React for interactivity, Vite for speed."}], ["cta", {"heading": "Ready for a Custom Frontend?", "text": "Let's build it.", "label": "Book a Call", "href": "#contact"}]]),
    ("services/custom-apps/full-stack", "Full-Stack Astro + FastAPI | Chris Amaya", [["hero", {"badge": "FULL-STACK", "headline": "Astro + FastAPI Full-Stack", "subhead": "SSR, multi-tenant, DB-driven. The God Mode template.", "cta_label": "Discuss Your Stack", "cta_href": "#contact"}], ["value_prop", {"title": "DB-Driven Multi-Tenant Apps", "body": "Same architecture as chrisamaya.work. Routes in Astro, content from PostgreSQL."}], ["cta", {"heading": "Build Your Full-Stack App", "text": "Let's talk architecture.", "label": "Book a Call", "href": "#contact"}]]),
    ("services/custom-apps/database", "PostgreSQL & Database Design | Chris Amaya", [["hero", {"badge": "DATABASE", "headline": "PostgreSQL Schema & Migrations", "subhead": "Schema design, migrations, optimization. Built for scale.", "cta_label": "Discuss Your Schema", "cta_href": "#contact"}], ["value_prop", {"title": "Production Database Design", "body": "Schema design, indexes, asyncpg integration."}], ["cta", {"heading": "Database Design Help?", "text": "Let's design it right.", "label": "Book a Call", "href": "#contact"}]]),
    ("services/custom-apps/google-apis", "Google Solar, Roofing & Maps API | Chris Amaya", [["hero", {"badge": "GOOGLE APIS", "headline": "Solar, Roofing & Maps Integration", "subhead": "Custom apps using Google Solar API, Roofing API, Maps, Places, Geocoding.", "cta_label": "Explore Integrations", "cta_href": "#contact"}], ["value_prop", {"title": "Google APIs for Your Product", "body": "Solar potential, rooftop data, maps, directions, places."}], ["cta", {"heading": "Need Google API Integration?", "text": "Let's build it.", "label": "Book a Call", "href": "#contact"}]]),
    ("services/custom-apps/wordpress", "Headless WordPress & Custom Plugins | Chris Amaya", [["hero", {"badge": "WORDPRESS", "headline": "Headless WordPress & Custom Development", "subhead": "REST API, GraphQL, custom themes, plugins, WooCommerce.", "cta_label": "Discuss Your WP", "cta_href": "#contact"}], ["value_prop", {"title": "WordPress as a Headless CMS", "body": "Use WordPress for content, Astro/React for frontend."}], ["cta", {"heading": "WordPress Project?", "text": "Let's modernize it.", "label": "Book a Call", "href": "#contact"}]]),
    ("services/custom-apps/calculators", "React Calculators & Interactive Tools | Chris Amaya", [["hero", {"badge": "TOOLS", "headline": "Custom Calculators & Interactive Tools", "subhead": "ROAS, CAC, LTV, forecasts. React calculators and dashboards.", "cta_label": "Build a Calculator", "cta_href": "#contact"}], ["value_prop", {"title": "Lead-Magnet Calculators", "body": "ROAS, funnel, LTV calculators. Custom interactive tools that capture leads."}], ["cta", {"heading": "Need a Custom Calculator?", "text": "Let's build it.", "label": "Book a Call", "href": "#contact"}]]),
    ("services/custom-apps/3d-visual", "Three.js, Rive & 3D Visual | Chris Amaya", [["hero", {"badge": "3D & VISUAL", "headline": "Three.js, Rive & Spline", "subhead": "3D web experiences, animations, interactive visuals.", "cta_label": "Discuss Your Vision", "cta_href": "#contact"}], ["value_prop", {"title": "3D and Motion on the Web", "body": "Three.js for 3D, Rive for interactive animation, Spline for design-to-3D."}], ["cta", {"heading": "3D or Motion Project?", "text": "Let's create it.", "label": "Book a Call", "href": "#contact"}]]),
]


def _block_specs_to_blocks(specs):
    out = []
    for spec in specs:
        bt = spec[0] if isinstance(spec, (list, tuple)) else spec
        data = spec[1] if isinstance(spec, (list, tuple)) and len(spec) >= 2 else {}
        out.append({"block_type": bt, "data": data})
    return out


async def seed_caw_content(conn):
    """Create caw_seed and caw_content tables and populate with chrisamaya.work content."""
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS caw_seed (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL
        )
    """)
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS caw_content (
            slug TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            blocks JSONB NOT NULL DEFAULT '[]',
            palette TEXT NOT NULL DEFAULT 'emerald',
            nav JSONB,
            footer JSONB,
            local_seo JSONB
        )
    """)

    theme = {"palette": DEFAULT_THEME["palette"], "nav": DEFAULT_THEME["nav"], "footer": DEFAULT_THEME["footer"]}
    homepage_blocks = [{"block_type": bt, "data": d} for bt, d in HOMEPAGE_BLOCKS]

    pages = {}
    for slug, title, block_specs in CORE_PAGES + OFFER_PAGES:
        pages[slug] = {"title": title, "blocks": _block_specs_to_blocks(block_specs)}

    await conn.execute(
        """
        INSERT INTO caw_seed (key, value) VALUES
            ('theme', $1::jsonb),
            ('homepage_blocks', $2::jsonb),
            ('pages', $3::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        """,
        json.dumps(theme),
        json.dumps(homepage_blocks),
        json.dumps(pages),
    )

    content_rows = [
        ("", "The One-Stop Architect | Chris Amaya", homepage_blocks),
    ]
    for slug, title, block_specs in CORE_PAGES:
        content_rows.append((slug, title, _block_specs_to_blocks(block_specs)))
    for slug, title, block_specs in OFFER_PAGES:
        content_rows.append((slug, title, _block_specs_to_blocks(block_specs)))

    for slug, title, blocks in content_rows:
        await conn.execute(
            """
            INSERT INTO caw_content (slug, title, blocks, palette, nav, footer)
            VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, $6::jsonb)
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title, blocks = EXCLUDED.blocks,
                palette = EXCLUDED.palette, nav = EXCLUDED.nav, footer = EXCLUDED.footer
            """,
            slug,
            title,
            json.dumps(blocks),
            theme["palette"],
            json.dumps(theme["nav"]),
            json.dumps(theme["footer"]),
        )

    return {"caw_content_pages": len(content_rows)}
