"""God Mode API configuration. All secrets via environment variables."""
import os
from urllib.parse import urlparse, quote_plus


def _get_db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url and url.strip():
        return url.strip()
    host = os.getenv("DB_HOST", "localhost")
    name = os.getenv("DB_NAME", "god_mode")
    user = os.getenv("DB_USER", "god_user")
    password = os.getenv("DB_PASSWORD", "")
    port = os.getenv("DB_PORT", "5432")
    return f"postgresql://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/{name}"


class Config:
    """Application configuration."""
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8200"))

    # Database
    DATABASE_URL: str = _get_db_url()

    # Admin: API-only key for programmatic access (n8n, scripts)
    ADMIN_KEY: str = os.getenv("ADMIN_KEY", "spark")

    # Admin: session-based login for human access
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", "change-me-in-production")

    # Debug: verbose errors, debug panel
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")

    # Optional: disable request logging to DB (reduces crashes when DATABASE_URL missing)
    LOG_REQUESTS: bool = os.getenv("LOG_REQUESTS", "false").lower() in ("1", "true", "yes")

    # Auto-seed chrisamaya.work on startup (default true; runs when DATABASE_URL set)
    AUTO_SEED_CHRISAMAYA: bool = os.getenv("AUTO_SEED_CHRISAMAYA", "true").lower() in ("1", "true", "yes")


config = Config()
