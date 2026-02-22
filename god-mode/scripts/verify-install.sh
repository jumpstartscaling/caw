#!/usr/bin/env bash
# Verify npm ci succeeds in each package (root + both sites).
# Use in CI or before push. Exit 1 if any fail.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAILED=0

echo "Verifying jumpstartscaling..."
(cd "$ROOT/sites/jumpstartscaling" && npm ci --legacy-peer-deps) || FAILED=1

echo "Verifying chrisamaya..."
(cd "$ROOT/sites/chrisamaya" && npm ci --legacy-peer-deps) || FAILED=1

echo "Verifying root (router)..."
(cd "$ROOT" && npm ci) || FAILED=1

if [ "$FAILED" -eq 1 ]; then
  echo "❌ One or more packages failed to install"
  exit 1
fi
echo "✅ All packages installed successfully"
