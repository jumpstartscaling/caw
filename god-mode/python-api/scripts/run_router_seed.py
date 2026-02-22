#!/usr/bin/env python3
"""
Run the full chrisamaya seed from app.routers.seed (includes offer pages, nav, theme_config).
Uses DATABASE_URL from god-mode/.env.local.

Usage: cd god-mode && node scripts/seed-via-db.mjs
Or: export DATABASE_URL=postgresql://... && cd python-api && python3 scripts/run_router_seed.py
"""
import asyncio
import os
import sys
from pathlib import Path

# Load .env.local from god-mode root
root = Path(__file__).resolve().parent.parent.parent
env_local = root / ".env.local"
if env_local.exists():
    for line in env_local.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        eq = line.find("=")
        if eq > 0:
            key = line[:eq].strip()
            val = line[eq + 1 :].strip().strip('"\'')
            os.environ.setdefault(key, val)

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.connection import get_db, init_db, close_db
from app.routers.seed import _run_chrisamaya_seed


async def main():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not set. Add to god-mode/.env.local")
        sys.exit(1)
    # Redact for log
    safe = db_url.split("@")[-1] if "@" in db_url else "***"
    print(f"Connecting to DB: ...@{safe}")
    await init_db()
    try:
        async with get_db() as conn:
            result = await _run_chrisamaya_seed(conn)
        print("✅ Seed complete:", result)
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
