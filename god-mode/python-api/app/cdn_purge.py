"""Pluggable CDN purge - Cloudflare, Vercel, etc. Called when page_blocks or page content updated."""
import os
from typing import Protocol


class PurgeProvider(Protocol):
    """Protocol for CDN purge implementations."""

    def purge_urls(self, urls: list[str], base_url: str) -> tuple[bool, str]:
        """Purge given URLs. Returns (success, message)."""
        ...


def _cloudflare_purge(urls: list[str], base_url: str, zone_id: str, api_token: str) -> tuple[bool, str]:
    """Purge URLs via Cloudflare API."""
    if not zone_id or not api_token:
        return False, "Cloudflare zone_id or api_token not configured"
    import httpx
    full_urls = [u if u.startswith("http") else f"{base_url.rstrip('/')}{u if u.startswith('/') else '/' + u}" for u in urls]
    try:
        r = httpx.post(
            f"https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache",
            headers={"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"},
            json={"files": full_urls},
            timeout=30,
        )
        data = r.json()
        if data.get("success"):
            return True, f"Purged {len(full_urls)} URLs"
        return False, data.get("errors", [{}])[0].get("message", "Unknown Cloudflare error")
    except Exception as e:
        return False, str(e)


def get_purge_provider(provider: str):
    """Return a purge function for the given provider."""

    def purge(urls: list[str], base_url: str, config: dict | None = None) -> tuple[bool, str]:
        config = config or {}
        if provider == "cloudflare":
            zone_id = config.get("zone_id") or os.environ.get("CLOUDFLARE_ZONE_ID")
            api_token = config.get("api_token") or os.environ.get("CLOUDFLARE_API_TOKEN")
            return _cloudflare_purge(urls, base_url, zone_id or "", api_token or "")
        if provider == "vercel":
            # Vercel: use their purge API if VERCEL_DEPLOYMENT_URL etc. configured
            return False, "Vercel purge not implemented"
        return False, f"Unknown cdn_provider: {provider}"

    return purge
