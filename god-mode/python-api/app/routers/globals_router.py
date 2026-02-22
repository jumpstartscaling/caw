"""Globals routes - site_name, theme_settings by domain."""
from urllib.parse import urlparse
import json

from fastapi import APIRouter, Query

from app.db.connection import get_db, DatabaseUnavailableError

router = APIRouter(prefix="/api", tags=["globals"])


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


@router.get("/globals")
async def get_globals(domain: str = Query(..., alias="domain")):
    """Return site_name, theme_settings from sites row. theme_config -> theme_settings."""
    dom = _resolve_domain(domain)
    if not dom:
        return {"site_name": None, "theme_settings": None}

    try:
        async with get_db() as conn:
            row = await conn.fetchrow(
                "SELECT name, theme_config FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
                f"%{dom}%",
            )
            if not row:
                return {"site_name": None, "theme_settings": None}
            theme = row.get("theme_config")
            if isinstance(theme, str) and theme:
                try:
                    theme = json.loads(theme)
                except Exception:
                    theme = None
            return {
                "site_name": row.get("name"),
                "theme_settings": theme if isinstance(theme, dict) else None,
            }
    except DatabaseUnavailableError:
        return {"site_name": None, "theme_settings": None}
