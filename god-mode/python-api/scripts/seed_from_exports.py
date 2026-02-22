#!/usr/bin/env python3
"""
Seed PostgreSQL from spark/exports/ Directus JSON files.

Maps:
  - geo_intelligence_*.json -> locations
  - generation_jobs_*.json -> pseo_services (extract niches), content_matrix (slug, title, content)
  - content_fragments_*.json -> optional content_fragments table

Usage:
  cd python-api && python scripts/seed_from_exports.py
  python scripts/seed_from_exports.py --exports-dir /path/to/exports
  python scripts/seed_from_exports.py --dry-run

Requires: DATABASE_URL in env or .env
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    import asyncpg
except ImportError:
    print("Run: pip install asyncpg")
    sys.exit(1)


def _load_schema() -> str:
    """Load shared schema from schema.sql (single source of truth)."""
    schema_path = Path(__file__).resolve().parent.parent / "app" / "db" / "schema.sql"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema not found: {schema_path}")
    return schema_path.read_text(encoding="utf-8")


def slugify(s: str) -> str:
    """Simple slug: lowercase, replace non-alphanumeric with hyphen."""
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def get_exports_dir(override: str | None) -> Path:
    """Resolve exports directory: spark/exports/ relative to god-mode."""
    if override:
        return Path(override).resolve()
    # god-mode/python-api/scripts -> go up to spark, then exports
    script_dir = Path(__file__).resolve().parent
    spark = script_dir.parent.parent.parent  # god-mode -> spark
    return (spark / "exports").resolve()


def find_export_file(exports_dir: Path, prefix: str) -> Path | None:
    """Find first JSON file matching prefix (e.g. geo_intelligence_2025-12-13.json)."""
    if not exports_dir.exists():
        return None
    for p in sorted(exports_dir.glob(f"{prefix}_*.json")):
        return p
    return None


def load_export(path: Path) -> list:
    """Load Directus export JSON; return data array."""
    with open(path, encoding="utf-8") as f:
        obj = json.load(f)
    return obj.get("data", [])


async def seed_locations(conn: asyncpg.Connection, exports_dir: Path, dry_run: bool) -> int:
    """Load geo_intelligence -> locations."""
    path = find_export_file(exports_dir, "geo_intelligence")
    if not path:
        print("  (no geo_intelligence_*.json found)")
        return 0
    data = load_export(path)
    count = 0
    seen = set()
    for record in data:
        inner = record.get("data") or {}
        cities = inner.get("cities") or []
        for c in cities:
            city = c.get("city") or c.get("neighborhood") or "Unknown"
            state = c.get("state") or "XX"
            zip_val = c.get("zip_focus") or ""
            neighborhood = c.get("neighborhood") or ""
            key = (city, state, zip_val, neighborhood)
            if key in seen:
                continue
            seen.add(key)
            slug_val = slugify(f"{city}-{state}-{zip_val}-{neighborhood}".strip("-"))
            if not slug_val:
                slug_val = slugify(f"{city}-{state}")
            if dry_run:
                count += 1
                continue
            await conn.execute(
                """
                INSERT INTO locations (city, state, zip, neighborhood, slug)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (slug) DO NOTHING
                """,
                city, state, zip_val or None, neighborhood or None, slug_val,
            )
            count += 1
    return count


def extract_service_type(title: str) -> str:
    """Extract niche/service from title before ': The ... Fix' or similar."""
    # e.g. "HOA Management Companies (Client Acquisition): The Hyper-Segmentation..."
    m = re.match(r"^([^:]+?)(?:\s*:\s*The\s+.+)?$", title)
    if m:
        return m.group(1).strip()
    return title[:200]


async def seed_services_from_jobs(conn: asyncpg.Connection, exports_dir: Path, dry_run: bool) -> dict[str, int]:
    """Extract unique service types from generation_jobs; insert into pseo_services. Returns slug->id map."""
    path = find_export_file(exports_dir, "generation_jobs")
    if not path:
        return {}
    data = load_export(path)
    services: dict[str, str] = {}  # slug -> service_type
    for record in data:
        items = (record.get("filters") or {}).get("items") or []
        for item in items:
            title = item.get("title") or ""
            if not title:
                continue
            st = extract_service_type(title)
            slug_val = slugify(st)
            if slug_val and slug_val not in services:
                services[slug_val] = st
    mapping: dict[str, int] = {}
    for slug_val, service_type in services.items():
        if dry_run:
            mapping[slug_val] = 0
            continue
        row = await conn.fetchrow(
            "INSERT INTO pseo_services (service_type, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET service_type = EXCLUDED.service_type RETURNING id",
            service_type, slug_val,
        )
        if row:
            mapping[slug_val] = row["id"]
    return mapping


async def seed_content_matrix(conn: asyncpg.Connection, exports_dir: Path, service_slugs: dict[str, int], dry_run: bool) -> int:
    """Load generation_jobs items -> content_matrix (location_id/service_id nullable when unresolved)."""
    path = find_export_file(exports_dir, "generation_jobs")
    if not path:
        return 0
    data = load_export(path)
    count = 0
    for record in data:
        items = (record.get("filters") or {}).get("items") or []
        for item in items:
            slug_val = item.get("slug") or ""
            title = item.get("title") or ""
            content = item.get("content") or ""
            if not slug_val:
                continue
            service_type = extract_service_type(title)
            svc_slug = slugify(service_type)
            service_id = service_slugs.get(svc_slug)
            content_json = {"html": content, "link": item.get("link"), "source_id": item.get("id")} if content else None
            if dry_run:
                count += 1
                continue
            await conn.execute(
                """
                INSERT INTO content_matrix (location_id, service_id, slug, title, content_json)
                VALUES (NULL, $1, $2, $3, $4::jsonb)
                ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content_json = EXCLUDED.content_json
                """,
                service_id, slug_val, title, json.dumps(content_json) if content_json else None,
            )
            count += 1
    return count


async def run(exports_dir: Path, dry_run: bool, create_schema: bool) -> None:
    import os
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).parent.parent / ".env")
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL not set. Add to .env or environment.")
        sys.exit(1)

    if dry_run:
        print("DRY RUN - no changes will be written")

    conn = await asyncpg.connect(url)
    try:
        if create_schema:
            print("Creating Harris matrix tables (from schema.sql)...")
            await conn.execute(_load_schema())

        print("Seeding locations from geo_intelligence...")
        n_loc = await seed_locations(conn, exports_dir, dry_run)
        print(f"  -> {n_loc} locations")

        print("Seeding pseo_services from generation_jobs...")
        service_slugs = await seed_services_from_jobs(conn, exports_dir, dry_run)
        print(f"  -> {len(service_slugs)} services")

        print("Seeding content_matrix from generation_jobs...")
        n_cm = await seed_content_matrix(conn, exports_dir, service_slugs, dry_run)
        print(f"  -> {n_cm} content_matrix rows")
    finally:
        await conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed PostgreSQL from spark/exports")
    parser.add_argument("--exports-dir", help="Path to exports directory (default: ../exports from spark)")
    parser.add_argument("--dry-run", action="store_true", help="Print counts without writing")
    parser.add_argument("--no-schema", action="store_true", help="Skip creating Harris tables (assume Phase 2 done)")
    args = parser.parse_args()

    exports_dir = get_exports_dir(args.exports_dir)
    if not exports_dir.exists():
        print(f"Exports dir not found: {exports_dir}")
        sys.exit(1)
    print(f"Exports dir: {exports_dir}")

    try:
        from dotenv import load_dotenv  # noqa: F401
    except ImportError:
        pass  # optional

    asyncio.run(run(exports_dir, args.dry_run, create_schema=not args.no_schema))


if __name__ == "__main__":
    main()
