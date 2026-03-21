"""Seed endpoints for jumpstartscaling.com - use consolidated 2-table schema. Requires X-Admin-Key."""
import json
import uuid
from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import JSONResponse

from app.config import config
from app.db.connection import get_db, DatabaseUnavailableError

router = APIRouter(prefix="/api/seed/jss", tags=["seed_jss"])

async def _run_jss_seed(conn):
    """Execute JumpstartScaling consolidated seed logic. Returns {site_id, counts}."""
    counts = {}

    # 1. Site Display (jumpstartscaling.com)
    domain = "jumpstartscaling.com"
    
    # Default config for JSS
    jss_config = {
        "palette": "emerald",
        "site_name": "Jumpstart Scaling",
        "nav": {
            "cta": {"href": "/#audit", "label": "INITIATE_HANDSHAKE"},
            "portfolio": [
                {"href": "/#hook", "name": "The Problem"},
                {"href": "/#solution", "name": "Architecture"},
                {"href": "/blog", "name": "Blog"},
                {"href": "/guide/how-i-build", "name": "How I Build"},
                {"href": "/pricing", "name": "Pricing"}
            ]
        },
        "footer": {
            "copyright": "© 2024 Jumpstart Scaling"
        }
    }
    
    await conn.execute(
        """
        INSERT INTO site_displays (domain, palette, navigation, footer, site_name)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (domain) DO UPDATE SET
            palette = EXCLUDED.palette,
            navigation = EXCLUDED.navigation,
            footer = EXCLUDED.footer,
            site_name = EXCLUDED.site_name,
            updated_at = CURRENT_TIMESTAMP
        """,
        domain,
        jss_config["palette"],
        json.dumps(jss_config["nav"]),
        json.dumps(jss_config["footer"]),
        jss_config["site_name"]
    )
    
    row = await conn.fetchrow("SELECT id FROM site_displays WHERE domain = $1", domain)
    site_id = row["id"]
    counts["site_display"] = 1

    # 2. Homepage (site_contents)
    homepage_blocks = [
        {
            "id": "hero",
            "block_type": "hero",
            "data": {
                "badge": "JUMPSTART SCALING",
                "headline": "SCALE YOUR AGENCY WITH <span class='text-accent'>PROGRAMMATIC SEO</span>",
                "subhead": "We build the infrastructure that powers 10,000+ page empires. Stop hiring VAs. Start hiring systems.",
                "cta_label": "View Solutions",
                "cta_href": "/solutions"
            }
        },
        {
            "id": "features",
            "block_type": "icon_bullets",
            "data": {
                "title": "Built for Scale",
                "bullets": [
                    {"icon": "⚡", "title": "FastAPI Backend", "text": "High performance, async architecture."},
                    {"icon": "🔍", "title": "pSEO Engine", "text": "Dominate Google with thousands of optimized pages."},
                    {"icon": "🤖", "title": "AI Content", "text": "Human-grade content at machine speed."}
                ]
            }
        }
    ]
    
    await conn.execute(
        """
        INSERT INTO site_contents (site_id, slug, content_type, title, blocks_json, is_published)
        VALUES ($1, '', 'page', 'Jumpstart Scaling | Scale Your Agency', $2, true)
        ON CONFLICT (site_id, slug, content_type) DO UPDATE SET
            title = EXCLUDED.title,
            blocks_json = EXCLUDED.blocks_json,
            updated_at = CURRENT_TIMESTAMP
        """,
        site_id,
        json.dumps(homepage_blocks)
    )
    counts["homepage"] = 1

    return {
        "site_id": str(site_id),
        "counts": counts,
        "message": "JumpstartScaling.com consolidated seeding complete.",
    }

@router.post("")
async def seed_jss(x_admin_key: str = Header(alias="X-Admin-Key", default="")):
    """Seed jumpstartscaling.com tenant (consolidated schema). Requires X-Admin-Key."""
    if not x_admin_key or x_admin_key != config.ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Admin key required")
    try:
        async with get_db() as conn:
            result = await _run_jss_seed(conn)
        return result
    except DatabaseUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
