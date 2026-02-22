#!/usr/bin/env python3
"""
Run chrisamaya seed via the god-mode API (works with Coolify DB).
Loads ADMIN_KEY and GOD_MODE_API_URL from .env.local.
Usage: python scripts/run_seed_via_api.py [--api-url URL]
"""
import argparse
import json
import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    env_local = root / ".env.local"
    if env_local.exists() and load_dotenv:
        load_dotenv(env_local)

    admin_key = os.getenv("ADMIN_KEY")
    api_url = os.getenv("GOD_MODE_API_URL", "https://api.jumpstartscaling.com").rstrip("/")

    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", help="Override god-mode API base URL")
    args = parser.parse_args()
    if args.api_url:
        api_url = args.api_url.rstrip("/")

    if not admin_key:
        print("ERROR: ADMIN_KEY not set. Add to .env.local or set in env.", file=sys.stderr)
        return 1

    url = f"{api_url}/api/seed/chrisamaya"
    print(f">>> POST {url}")
    print(">>> Running chrisamaya seed against Coolify DB...\n")

    try:
        import urllib.request
        req = urllib.request.Request(
            url,
            data=b"{}",
            headers={
                "Content-Type": "application/json",
                "X-Admin-Key": admin_key,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode()
            data = json.loads(body) if body else {}
            print("OK:", json.dumps(data, indent=2))
            return 0
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        try:
            err = json.loads(body)
            detail = err.get("detail", body)
        except json.JSONDecodeError:
            detail = body
        print(f"ERROR: {e.code} {e.reason}", file=sys.stderr)
        print(f"  {detail}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
