# God-Mode Router + Sites - Production Build
# Builds jumpstartscaling + tenant template (SSR for all API-resolved tenants)
# Coolify: Build from this Dockerfile, SITES_BASE_PATH=/app

FROM node:20-alpine AS builder-js
WORKDIR /app

# Build jumpstartscaling
COPY sites/jumpstartscaling/package*.json sites/jumpstartscaling/
WORKDIR /app/sites/jumpstartscaling
RUN npm ci --legacy-peer-deps
COPY sites/jumpstartscaling/ .
RUN npm run build

# Build tenant template (SSR - output: server) - primary template for all API-resolved tenants
WORKDIR /app
COPY sites/tenant/package*.json sites/tenant/
WORKDIR /app/sites/tenant
RUN npm ci --legacy-peer-deps
COPY sites/tenant/ .
# PUBLIC_GOD_MODE_API_URL for SSR fetch; pass at build if different from runtime GOD_MODE_API_URL
ARG PUBLIC_GOD_MODE_API_URL=
ENV PUBLIC_GOD_MODE_API_URL=${PUBLIC_GOD_MODE_API_URL}
RUN npm run build

# Copy root deps for router
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Final image
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8100
ENV SITES_BASE_PATH=/app

# Copy router and built sites
COPY --from=builder-js /app/node_modules ./node_modules
COPY --from=builder-js /app/package.json ./
COPY router.js ./
COPY --from=builder-js /app/sites/jumpstartscaling/dist ./sites/jumpstartscaling/dist
COPY --from=builder-js /app/sites/tenant/dist ./sites/tenant/dist
# Tenant SSR needs react/etc at runtime
COPY --from=builder-js /app/sites/tenant/node_modules ./sites/tenant/node_modules

# Copy start script (runs tenant SSR on 8101, then router on 8100)
COPY start.sh ./
RUN chmod +x start.sh

# HEALTHCHECK required - Coolify rolling update fails without it (checks .State.Health.Status).
# If you get "No available server", disable Health Check in Coolify: JFactory → Configuration → Health Check → Off
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:8100/health',r=>{r.resume();process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"
EXPOSE 8100
# Tenant SSR needs GOD_MODE_API_URL (or PUBLIC_GOD_MODE_API_URL) for API fetch
CMD ["./start.sh"]
