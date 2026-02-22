#!/usr/bin/env python3
"""Export content_matrix to CSV or JSON. Requires DATABASE_URL."""
import argparse
import csv
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
try:
    import asyncpg
except ImportError:
    print("Run: pip install asyncpg")
    sys.exit(1)


async def run(format: str, output: str | None) -> None:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL not set")
        sys.exit(1)

    conn = await asyncpg.connect(url)
    try:
        rows = await conn.fetch(
            """
            SELECT cm.id, cm.location_id, cm.service_id, cm.slug, cm.title, cm.meta_description, cm.content_json, cm.created_at
            FROM content_matrix cm
            ORDER BY cm.slug
            """
        )
        data = [dict(r) for r in rows]

        if format == "json":
            out = output or "content_matrix_export.json"
            with open(out, "w") as f:
                json.dump(data, f, indent=2, default=str)
            print(f"Exported {len(data)} rows to {out}")
        else:
            out = output or "content_matrix_export.csv"
            if not data:
                with open(out, "w") as f:
                    f.write("id,location_id,service_id,slug,title,meta_description\n")
            else:
                keys = list(data[0].keys())
                with open(out, "w", newline="") as f:
                    w = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
                    w.writeheader()
                    for row in data:
                        row_clean = {k: (json.dumps(v) if isinstance(v, (dict, list)) else str(v)) for k, v in row.items()}
                        w.writerow(row_clean)
            print(f"Exported {len(data)} rows to {out}")
    finally:
        await conn.close()


def main():
    p = argparse.ArgumentParser(description="Export content_matrix to CSV or JSON")
    p.add_argument("--format", choices=["csv", "json"], default="csv")
    p.add_argument("-o", "--output", help="Output file path")
    args = p.parse_args()
    import asyncio
    asyncio.run(run(args.format, args.output))


if __name__ == "__main__":
    main()
