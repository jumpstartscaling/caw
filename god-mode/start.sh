#!/bin/sh
set -e
# JFactory: runs tenant SSR (8101) + router (8100)
# Tenant SSR for factory.jumpstartscaling.com/chrisamaya path-based preview

SSR_PORT=${SSR_TENANT_PORT:-8101}
(cd /app/sites/tenant && HOST=0.0.0.0 PORT=$SSR_PORT node dist/server/entry.mjs) &
sleep 2
cd /app && exec node router.js
