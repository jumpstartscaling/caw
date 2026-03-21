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
    """Resolve domain to site_id. Checks site_displays first, then legacy sites."""
    if not domain:
        return None, None
    try:
        async with get_db() as conn:
            # Check consolidated first
            row = await conn.fetchrow(
                "SELECT id FROM site_displays WHERE domain ILIKE $1 LIMIT 1",
                f"%{domain}%",
            )
            if row:
                return row["id"], domain
            
            # Fallback to legacy
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
    """Resolve domain to site_id and config. Used by router for tenant proxy."""
    dom = _resolve_domain(domain)
    site_id, _ = await _get_site_id_by_domain(dom)
    if not site_id:
        return {"found": False}

    try:
        async with get_db() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, palette, navigation, footer, scripts, cdn_config, local_seo, site_name 
                FROM site_displays 
                WHERE id = $1
                """,
                site_id,
            )
            if not row:
                return {"found": False}
        return {
            "found": True,
            "site_id": str(site_id),
            "theme_config": dict(row),
        }
    except DatabaseUnavailableError:
        return {"found": False}


async def _get_theme_config(conn, site_id):
    """Fetch configuration from site_displays."""
    row = await conn.fetchrow(
        "SELECT palette, navigation as nav, footer, cdn_config, site_name, local_seo FROM site_displays WHERE id = $1",
        site_id,
    )
    if not row:
        return {
            "palette": "emerald",
            "nav": None,
            "footer": None,
            "cdn_provider": None,
            "site_name": None,
            "local_seo": None,
        }
    return dict(row)


@router.get("/page")
async def get_tenant_page(
    domain: str = Query(..., alias="domain"),
    slug: str = Query("", alias="slug"),
):
    """Resolve site; fetch page. Supports both consolidated and legacy schemas."""
    dom = _resolve_domain(domain)
    site_id, resolved_domain = await _get_site_id_by_domain(dom)
    if not site_id:
        return JSONResponse(status_code=404, content={"detail": "Site not found"})

    page_slug = (slug or "").strip().rstrip("/")
    if page_slug in ("", "index"):
        page_slug = ""

    try:
        async with get_db() as conn:
            # 1. Try Consolidated Schema
            site_display = await conn.fetchrow(
                "SELECT palette, navigation, footer, local_seo FROM site_displays WHERE id = $1",
                site_id
            )
            if site_display:
                page_row = await conn.fetchrow(
                    """
                    SELECT id, title, slug, body_content as content, blocks_json
                    FROM site_contents
                    WHERE site_id = $1 AND slug = $2 AND content_type = 'page' AND is_published = true
                    LIMIT 1
                    """,
                    site_id, page_slug
                )
                if not page_row:
                     page_row = await conn.fetchrow(
                        """
                        SELECT id, title, slug, body_content as content, blocks_json
                        FROM site_contents
                        WHERE site_id = $1 AND slug = $2 AND content_type = 'pseo_row'
                        LIMIT 1
                        """,
                        site_id, page_slug
                    )
                
                if page_row:
                    return {
                        "page": dict(page_row),
                        "blocks": page_row.get("blocks_json") or [],
                        "palette": site_display["palette"],
                        "nav": site_display["navigation"],
                        "footer": site_display["footer"],
                        "local_seo": site_display["local_seo"]
                    }

            # 2. Fallback to Legacy Schema
            site_legacy = await conn.fetchrow("SELECT theme_config FROM sites WHERE id = $1", site_id)
            if site_legacy:
                tc = site_legacy["theme_config"] or {}
                if isinstance(tc, str): tc = json.loads(tc)
                
                page_row = await conn.fetchrow(
                    """
                    SELECT id, title, slug, content, schema_json
                    FROM pages
                    WHERE site_id = $1 AND (slug = $2 OR (slug IS NULL AND $2 = ''))
                    LIMIT 1
                    """,
                    site_id, page_slug
                )
                if page_row:
                    blocks_rows = await conn.fetch(
                        "SELECT id, block_type, name, data FROM page_blocks WHERE page_id = $1 ORDER BY sort_order ASC",
                        page_row["id"]
                    )
                    blocks = [{"id": str(r["id"]), "block_type": r["block_type"], "name": r["name"], "data": r["data"]} for r in blocks_rows]
                    return {
                        "page": dict(page_row),
                        "blocks": blocks,
                        "palette": tc.get("palette", "emerald"),
                        "nav": tc.get("nav"),
                        "footer": tc.get("footer"),
                        "local_seo": tc.get("local_seo")
                    }

        return JSONResponse(status_code=404, content={"detail": "Page not found"})
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
