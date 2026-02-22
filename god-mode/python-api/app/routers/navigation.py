"""Navigation routes - nav items by domain or site_id."""
from urllib.parse import urlparse

from fastapi import APIRouter, Query

from app.db.connection import get_db, DatabaseUnavailableError

router = APIRouter(prefix="/api", tags=["navigation"])


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


@router.get("/navigation")
async def get_navigation(
    domain: str | None = Query(None, alias="domain"),
    site_id: str | None = Query(None, alias="site_id"),
):
    """Return nav items for site. Use domain= or site_id=. Order by nav_group, sort_order."""
    resolved_site_id = None
    if site_id:
        resolved_site_id = site_id
    elif domain:
        dom = _resolve_domain(domain)
        if dom:
            try:
                async with get_db() as conn:
                    row = await conn.fetchrow(
                        "SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
                        f"%{dom}%",
                    )
                    if row:
                        resolved_site_id = str(row["id"])
            except DatabaseUnavailableError:
                pass

    if not resolved_site_id:
        return {"items": []}

    try:
        async with get_db() as conn:
            rows = await conn.fetch(
                """
                SELECT id, label, href, nav_group, sort_order
                FROM navigation
                WHERE site_id = $1::uuid
                ORDER BY nav_group ASC, sort_order ASC
                """,
                resolved_site_id,
            )
        return {"items": [{"label": r["label"], "href": r["href"], "nav_group": r["nav_group"] or "portfolio"} for r in rows]}
    except DatabaseUnavailableError:
        return {"items": []}
