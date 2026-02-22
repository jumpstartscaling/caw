# God Mode - Technical Stack & CTO Log

## 🏗 Technical Architecture

### Core Stack
- **Framework:** Astro 4.0 (Server-Side Rendering mode)
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Styling:** TailwindCSS with custom "God Mode" palette

### Backend & Data
- **Database:** PostgreSQL 16 (on Coolify)
- **ORM:** Native `pg` queries (raw SQL for performance) + Custom Migration scripts
- **Queue:** BullMQ (Redis-backed) for async content generation
- **Caching:** Redis (shared with queue)

### The "Directus Shim" - Critical Innovation
**Problem:** Standard CMS (Directus) is too slow for high-volume operations.  
**Solution:** Custom shim layer that mimics Directus SDK but queries PostgreSQL directly.

**How It Works:**
1. All admin components import `getDirectusClient()` from `src/lib/directus/client.ts`
2. They use familiar Directus SDK syntax: `readItems('sites', { filter: {...} })`
3. The shim translates this to raw SQL: `SELECT * FROM "sites" WHERE ...`
4. **Server-side:** Direct PostgreSQL connection via `pg` pool (fast)
5. **Client-side:** HTTP proxy to `/api/god/proxy` → then PostgreSQL (secure)

**Benefits:**
- ✅ No Directus runtime dependency
- ✅ 10x faster queries (no API overhead)
- ✅ Developer-friendly syntax (not raw SQL everywhere)
- ✅ Can swap to real Directus later if needed

**Files:** `src/lib/directus/client.ts` (274 lines), `src/pages/api/god/proxy.ts`, `src/lib/db.ts`

### Content Engine
- **Spintax:** Custom recursive resolver (`{A|B|{C|D}}` support)
- **Variables:** Handlebars-style expansion (`{{CITY}}`)
- **Uniqueness:** SHA-256 hashing of variation paths to prevent duplicates

---

## 📔 CTO Log & Decision Record

### 2025-12-15: The "God Mode" Pivot
**Decision:** Shifted from standard CMS to "God Mode" - a high-throughput, automated content engine.
**Rationale:** The previous "Spark" manually managed content was too slow. We need to generate thousands of local SEO pages programmatically.
**Implementation:**
- Built `SpintaxResolver` to deterministically generate content.
- Created `variation_registry` to ensure we never publish the same article twice (Google Duplicate Content penalty prevention).
- Implemented `BullMQ` to handle the heavy processing load off the main web thread.

### 2025-12-15: Architecture Standardization
**Decision:** Enforce strict folder structure for Admin UI.
**Rationale:** The admin panel grew to 70+ pages. Direct file-based routing in `src/pages/admin` mirrored by `src/api` ensures maintainability.
**Standards:**
- All lists must use the standard `StatCard` and Table components.
- All pages must have inline `<DevStatus>` if they aren't fully wired up.

### 2025-12-15: Production Readiness
**Decision:** Multi-stage Docker build.
**Rationale:** Build times were increasing. We separated dependencies installation from the build process in `Dockerfile` to leverage layer caching.
**Strategy:**
- We commit `package-lock.json` strictly.
- We run linting *before* build in CI.

---

## 🛠 Feature Roadmap

### Phase 8 (Next)
- [ ] Connect `sites` table to Admin UI.
- [ ] Implement `campaign_masters` fetch logic.
- [ ] Wire up the `generation_jobs` queue monitor.

### Future
- [ ] **Vector Database:** Add `pgvector` for semantic search of content fragments.
- [ ] **LLM Integration:** Add OpenAI/Anthropic step to `contentGenerator` worker for non-spintax dynamic writing.
- [ ] **Multi-Tenant:** Allow multiple users to have their own "God Mode" instances (requires tenant_id schema update).
