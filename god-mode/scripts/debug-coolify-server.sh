#!/bin/bash
# Run this ON the Coolify server (ssh root@86.48.23.38) to debug factory/admin 503.
# Usage: bash debug-coolify-server.sh 2>&1 | tee debug-output.txt

set -e

echo "=== 1. All containers (status, ports) ==="
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -60

echo ""
echo "=== 2. JFactory container (asws8oco*) - logs last 30 lines ==="
JF=$(docker ps -a --filter "name=asws8oco" --format "{{.Names}}" | head -1)
if [ -n "$JF" ]; then
  docker logs "$JF" --tail 30 2>&1
else
  echo "(No JFactory container found)"
fi

echo ""
echo "=== 3. god-mode-api container (d8ws* or god-mode*) - status + logs ==="
# god-mode-api Coolify app UUID prefix: d8ws
API=$(docker ps -a --format "{{.Names}}" | grep -E "^d8ws" | head -1)
if [ -n "$API" ]; then
  echo "Container: $API"
  docker inspect "$API" --format 'Status: {{.State.Status}} | Health: {{.State.Health.Status}}'
  echo "--- Last 30 log lines ---"
  docker logs "$API" --tail 30 2>&1
else
  echo "(No god-mode-api container found - api.jumpstartscaling.com 503)"
  docker ps -a --format "{{.Names}}" | grep -i api || true
fi

echo ""
echo "=== 4. Traefik (coolify-proxy) - last 20 lines ==="
docker logs coolify-proxy --tail 20 2>&1

echo ""
echo "=== 5. Traefik dynamic config (api.jumpstartscaling.com) ==="
grep -r "api.jumpstartscaling" /data/coolify/proxy/dynamic/ 2>/dev/null || echo "(path may differ; check /data/coolify/)"

echo ""
echo "=== 6. Local health check - JFactory on 8100 ==="
curl -s -o /dev/null -w "factory-internal: %{http_code}\n" http://127.0.0.1:8100/health 2>/dev/null || echo "Cannot reach :8100"

echo ""
echo "=== 7. Applications in Coolify data ==="
ls -la /data/coolify/applications/ 2>/dev/null | head -20 || echo "(path may differ)"
