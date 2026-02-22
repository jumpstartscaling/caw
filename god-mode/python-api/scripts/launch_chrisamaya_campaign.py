#!/usr/bin/env python3
"""
Create first chrisamaya.work generation job (target_quantity=2000).
Inserts directly into generation_jobs. Run seed_chrisamaya_v4.py first.

Usage:
  cd god-mode/python-api && python scripts/launch_chrisamaya_campaign.py [--quantity=2000] [--dry-run]

Requires: DATABASE_URL
"""
import argparse
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


async def main() -> None:
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    parser = argparse.ArgumentParser()
    parser.add_argument("--quantity", type=int, default=2000)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)

    import asyncpg
    conn = await asyncpg.connect(db_url)

    try:
        row = await conn.fetchrow(
            "SELECT s.id as site_id, c.id as campaign_id FROM sites s "
            "JOIN campaign_masters c ON c.site_id = s.id "
            "WHERE s.url ILIKE '%chrisamaya.work%' AND c.name = 'Unicorn Developer' LIMIT 1"
        )
        if not row:
            print("ERROR: chrisamaya site + Unicorn Developer campaign not found. Run seed_chrisamaya_v4.py first.")
            sys.exit(1)

        site_id = row["site_id"]
        campaign_id = row["campaign_id"]

        if args.dry_run:
            print(f"[--dry-run] Would create generation_job: site_id={site_id}, campaign_id={campaign_id}, target_quantity={args.quantity}")
            return

        job = await conn.fetchrow(
            """
            INSERT INTO generation_jobs (site_id, campaign_id, target_quantity, status, source_type)
            VALUES ($1::uuid, $2::uuid, $3, 'pending', 'new')
            RETURNING id, status, target_quantity, date_created
            """,
            site_id,
            campaign_id,
            args.quantity,
        )
        print("✅ Generation job created:")
        print(f"   id={job['id']}")
        print(f"   status={job['status']}")
        print(f"   target_quantity={job['target_quantity']}")
        print(f"   date_created={job['date_created']}")
        print("\nWorker will process when available. Check factory admin for progress.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
