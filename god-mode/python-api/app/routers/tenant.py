"""Tenant routes - page by slug, sitemap URLs, content by slug. Resolve site by domain."""
import json
from urllib.parse import urlparse

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.db.connection import get_db, DatabaseUnavailableError

router = APIRouter(prefix="/api/tenant", tags=["tenant"])
sites_router = APIRouter(prefix="/api/sites", tags=["sites"])


def _resolve_domain(site_url: str) -> str | None:
    """Parse domain from site_url. Returns hostname or None."""
    domain = (site_url or "").strip().lower()
    if not domain:
        return None
    try:
        p = urlparse(domain if "://" in domain else f"https://{domain}")
        return p.hostname or domain
    except Exception:
        return domain


async def _get_site_id_by_domain(domain: str):
    """Resolve domain to site_id. Returns (site_id, domain) or (None, None)."""
    if not domain:
        return None, None
    try:
        async with get_db() as conn:
            row = await conn.fetchrow(
                "SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
                f"%{domain}%",
            )
            if row:
                return row["id"], domain
    except DatabaseUnavailableError:
        pass
    return None, None


@sites_router.get("/resolve")
async def resolve_site(domain: str = Query(..., alias="domain")):
    """Resolve domain to site_id and theme_config. Used by router for tenant proxy."""
    dom = _resolve_domain(domain)
    site_id, _ = await _get_site_id_by_domain(dom)
    if not site_id:
        return {"found": False}

    try:
        async with get_db() as conn:
            row = await conn.fetchrow(
                "SELECT id, theme_config FROM sites WHERE id = $1 AND status = 'active'",
                site_id,
            )
            if not row:
                return {"found": False}
            tc = row["theme_config"] or {}
            if isinstance(tc, str):
                try:
                    tc = json.loads(tc) if tc else {}
                except Exception:
                    tc = {}
        return {
            "found": True,
            "site_id": str(site_id),
            "theme_config": tc,
        }
    except DatabaseUnavailableError:
        return {"found": False}


async def _get_theme_config(conn, site_id):
    """Fetch theme_config for site. Returns palette, nav, footer, cdn_provider from theme_config JSONB."""
    row = await conn.fetchrow(
        "SELECT theme_config FROM sites WHERE id = $1",
        site_id,
    )
    tc = (row["theme_config"] if row else None) or {}
    if isinstance(tc, str):
        try:
            tc = json.loads(tc) if tc else {}
        except Exception:
            tc = {}
    return {
        "palette": tc.get("palette", "emerald"),
        "nav": tc.get("nav"),
        "footer": tc.get("footer"),
        "cdn_provider": tc.get("cdn_provider"),
        "site_name": tc.get("site_name"),
        "local_seo": tc.get("local_seo"),
    }


@router.get("/page")
async def get_tenant_page(
    domain: str = Query(..., alias="domain"),
    slug: str = Query("", alias="slug"),
):
    """Resolve site by domain; fetch page by slug (empty = homepage); fetch page_blocks for page ORDER BY sort_order.
    Returns { page, blocks, palette, nav, footer } for DB-driven template."""
    dom = _resolve_domain(domain)
    site_id, _ = await _get_site_id_by_domain(dom)
    if not site_id:
        return JSONResponse(status_code=404, content={"detail": "Site not found or inactive"})

    # Normalize slug: empty or "index" -> homepage
    page_slug = (slug or "").strip().rstrip("/")
    if page_slug in ("", "index"):
        page_slug = ""

    try:
        async with get_db() as conn:
            # Fetch theme config (palette, nav, footer)
            theme = await _get_theme_config(conn, site_id)

            # Fetch page: slug='' or slug matches
            page_row = await conn.fetchrow(
                """
                SELECT id, site_id, title, slug, content, schema_json
                FROM pages
                WHERE site_id = $1 AND (slug IS NULL OR slug = $2 OR ($2 = '' AND (slug IS NULL OR slug = '')))
                LIMIT 1
                """,
                site_id,
                page_slug,
            )
            if not page_row:
                return JSONResponse(status_code=404, content={"detail": "Page not found"})

            page_id = page_row["id"]
            # page_blocks may have page_id (added via migration); fallback: no page_id column -> empty blocks
            try:
                blocks_rows = await conn.fetch(
                    """
                    SELECT id, block_type, name, data, sort_order
                    FROM page_blocks
                    WHERE page_id = $1
                    ORDER BY sort_order ASC NULLS LAST, created_at ASC
                    """,
                    page_id,
                )
            except Exception:
                blocks_rows = []

        page = dict(page_row)
        blocks = [
            {"id": str(r["id"]), "block_type": r["block_type"], "name": r.get("name"), "data": r.get("data") or {}}
            for r in blocks_rows
        ]
        return {
            "page": page,
            "blocks": blocks,
            "palette": theme["palette"],
            "nav": theme["nav"],
            "footer": theme["footer"],
            "local_seo": theme.get("local_seo"),
        }
    except DatabaseUnavailableError:
        return JSONResponse(status_code=503, content={"detail": "Database unavailable"})


@router.get("/navigation")
async def get_tenant_navigation(domain: str = Query(..., alias="domain")):
    """Return nav structure for site from theme_config."""
    dom = _resolve_domain(domain)
    site_id, _ = await _get_site_id_by_domain(dom)
    if not site_id:
        return {"nav": None}

    try:
        async with get_db() as conn:
            theme = await _get_theme_config(conn, site_id)
        return {"nav": theme["nav"]}
    except DatabaseUnavailableError:
        return {"nav": None}


@router.get("/globals")
async def get_tenant_globals(domain: str = Query(..., alias="domain")):
    """Return footer, site_name, etc. from theme_config."""
    dom = _resolve_domain(domain)
    site_id, _ = await _get_site_id_by_domain(dom)
    if not site_id:
        return {"footer": None, "site_name": None}

    try:
        async with get_db() as conn:
            theme = await _get_theme_config(conn, site_id)
        return {"footer": theme["footer"], "site_name": theme["site_name"]}
    except DatabaseUnavailableError:
        return {"footer": None, "site_name": None}


@router.get("/sitemap-urls")
async def get_tenant_sitemap_urls(domain: str = Query(..., alias="domain")):
    """Return all public URLs for site: pages, posts, published generated_articles."""
    dom = _resolve_domain(domain)
    site_id, _ = await _get_site_id_by_domain(dom)
    if not site_id:
        return {"urls": []}

    try:
        async with get_db() as conn:
            urls = []
            # Pages
            rows = await conn.fetch(
                "SELECT slug FROM pages WHERE site_id = $1 AND status = 'published'", site_id
            )
            for r in rows:
                s = (r["slug"] or "").strip()
                urls.append("/" + s if s else "/")
            # Posts
            rows = await conn.fetch(
                "SELECT slug FROM posts WHERE site_id = $1 AND status = 'published'", site_id
            )
            for r in rows:
                if r["slug"]:
                    urls.append("/blog/" + r["slug"])
            # Generated articles
            rows = await conn.fetch(
                "SELECT slug FROM generated_articles WHERE site_id = $1 AND is_published = true",
                site_id,
            )
            for r in rows:
                if r["slug"]:
                    urls.append("/articles/" + r["slug"])
        return {"urls": list(dict.fromkeys(urls))}
    except DatabaseUnavailableError:
        return {"urls": []}


@router.get("/content/{slug}")
async def get_tenant_content_by_slug(
    slug: str,
    domain: str = Query(..., alias="domain"),
):
    """Single post by slug. For blog [slug].astro."""
    dom = _resolve_domain(domain)
    site_id, _ = await _get_site_id_by_domain(dom)
    if not site_id:
        return JSONResponse(status_code=404, content={"detail": "Site not found or inactive"})

    try:
        async with get_db() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, title, slug, content, excerpt, published_at, created_at
                FROM posts
                WHERE site_id = $1 AND slug = $2 AND status = 'published'
                LIMIT 1
                """,
                site_id,
                slug,
            )
            if not row:
                return JSONResponse(status_code=404, content={"detail": "Post not found"})
        return dict(row)
    except DatabaseUnavailableError:
        return JSONResponse(status_code=503, content={"detail": "Database unavailable"})
