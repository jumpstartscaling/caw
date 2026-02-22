#!/usr/bin/env python3
"""Apply schema.sql to PostgreSQL. Idempotent (CREATE IF NOT EXISTS)."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
try:
    import asyncpg
except ImportError:
    print("Run: pip install asyncpg")
    sys.exit(1)


def _load_schema() -> str:
    p = Path(__file__).resolve().parent.parent / "app" / "db" / "schema.sql"
    if not p.exists():
        raise FileNotFoundError(f"Schema not found: {p}")
    return p.read_text(encoding="utf-8")


async def run() -> None:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL not set")
        sys.exit(1)

    schema = _load_schema()
    conn = await asyncpg.connect(url)
    try:
        await conn.execute(schema)
        print("Schema applied successfully.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        await conn.close()


def main():
    import asyncio
    asyncio.run(run())


if __name__ == "__main__":
    main()
