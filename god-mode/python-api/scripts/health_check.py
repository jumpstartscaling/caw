#!/usr/bin/env python3
"""Call API health endpoint. Exit 0 if OK, 1 otherwise. For CI."""
import os
import sys
import urllib.request
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

API_URL = os.getenv("GOD_MODE_API_URL", "https://api.jumpstartscaling.com")
HEALTH_PATH = "/api/health"


def main():
    url = f"{API_URL.rstrip('/')}{HEALTH_PATH}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as r:
            if r.status == 200:
                print("API healthy")
                sys.exit(0)
            print(f"API returned {r.status}")
            sys.exit(1)
    except Exception as e:
        print(f"Health check failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
