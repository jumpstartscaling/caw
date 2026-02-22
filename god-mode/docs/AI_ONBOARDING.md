# 🤖 AI Onboarding Protocol: Project Valhalla (God Mode)

**Context:** You are entering "God Mode", a high-performance, standalone Node.js system designed to bypass standard CMS limitations.

## 核心 Architecture (The "Truth")
*   **Repo:** `gatekeeper/mini.git` (Standalone).
*   **Runtime:** Node.js (Astro SSR adapter).
*   **Database:** PostgreSQL (Directus Schema).
    *   *Note:* We Do NOT run Directus. We map to its schema using raw SQL.
*   **Queue:** Redis + BullMQ (`BatchProcessor.ts`).

## ⚡ Critical Systems (The "Shim")

**File:** `src/lib/directus/client.ts` - **THIS IS THE KEY TO UNDERSTANDING GOD MODE**

### What It Does:
Translates Directus SDK syntax → Raw PostgreSQL queries. This allows the entire codebase to use familiar Directus SDK patterns while directly querying PostgreSQL.

### Why It Exists:
- **No Directus dependency** - God Mode runs standalone
- **Direct database access** - Faster, no API overhead
- **Familiar syntax** - Developers can use `readItems('sites')` instead of raw SQL
- **Hot-swappable** - Can switch to real Directus later if needed

### How It Works:

**Component code looks like this:**
```typescript
import { getDirectusClient, readItems } from '@/lib/directus/client';

const client = getDirectusClient();
const sites = await client.request(readItems('sites', {
  filter: { status: { _eq: 'active' } },
  limit: 10
}));
```

**Behind the scenes, the shim converts it to:**
```sql
SELECT * FROM "sites" 
WHERE "status" = 'active' 
LIMIT 10
```

### Server vs Client:
- **Server-side:** Direct PostgreSQL via `pg` pool
- **Client-side:** HTTP proxy to `/api/god/proxy` which then uses `pg`

### Files Involved:
- `src/lib/directus/client.ts` - Shim implementation (274 lines)
- `src/pages/api/god/proxy.ts` - Client-side proxy endpoint
- `src/lib/db.ts` - PostgreSQL connection pool

**IMPORTANT:** All 35+ admin components use this shim. It's not a hack - it's the architecture.

## ⚠️ "God Tier" Limits (The "Dangerous" Stuff)
**File:** `docker-compose.yml`
*   **Ulimit:** `65536` (File Descriptors).
*   **Memory:** 16GB (`NODE_OPTIONS=--max-old-space-size=16384`).
*   **Concurrency:** 10,000 DB Connections.
*   **Warning:** Do NOT lower these limits without checking the `BatchProcessor` throughput settings first.

## 🕹️ System Control (Standby Mode)
**File:** `src/lib/system/SystemController.ts`
*   **Feature:** Standard "Push Button" to pause all heavy processing.
*   **Check:** `system.isActive()` returns `false` if paused.
*   **Integration:** `BatchProcessor` loops and waits if `!isActive()`.

## 📜 Dictionary of Terms
*   **"Insane Mode"**: Running >50 concurrent threads.
*   **"Mechanic"**: Database Ops (`src/lib/db/mechanic.ts`).
*   **"Shim"**: The SQL conversion layer.
*   **"Proxy"**: The API route (`/api/god/proxy`) allowing the React Admin UI to talk to the Shim.
