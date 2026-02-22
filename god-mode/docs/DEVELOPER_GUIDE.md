# DEVELOPER GUIDE: Spark Platform Setup & Workflow

> **BLUF**: Clone, install, run `docker-compose up -d` then `npm run dev`. Access admin at localhost:4321/admin. Git push triggers auto-deploy.

---

## 1. Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.x | `docker compose version` |
| Git | 2.x | `git --version` |

---

## 2. Clone & Install

```bash
# Clone repository
git clone https://github.com/jumpstartscaling/net.git spark
cd spark

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env
```

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `PUBLIC_DIRECTUS_URL` | API endpoint | `https://spark.jumpstartscaling.com` |
| `DIRECTUS_ADMIN_TOKEN` | SSR authentication | (from Directus admin) |
| `POSTGRES_PASSWORD` | Database auth | (secure password) |

### Development Overrides

For local development, create `frontend/.env.local`:
```env
PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_TOKEN=your-local-token
```

---

## 4. Start Services

### Option A: Full Stack (Docker)

```bash
# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

Services available:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Directus: localhost:8055
- Frontend (if containerized): localhost:4321

### Option B: Frontend Development (Recommended)

```bash
# Connect to staging/production Directus
cd frontend
npm run dev
```

Access: http://localhost:4321

---

## 5. Local Development Workflow

### 5.1 File Structure

```
frontend/src/
├── pages/
│   ├── admin/          # Admin pages (.astro)
│   ├── api/            # API endpoints (.ts)
│   └── [...slug].astro # Dynamic router
├── components/
│   ├── admin/          # Admin React components
│   ├── blocks/         # Page builder blocks
│   └── ui/             # Shadcn-style primitives
├── lib/
│   ├── directus/       # SDK client & fetchers
│   └── schemas.ts      # TypeScript types
└── hooks/              # React hooks
```

### 5.2 Creating New Admin Page

1. Create page file:
```bash
touch frontend/src/pages/admin/my-feature/index.astro
```

2. Add content:
```astro
---
import AdminLayout from '@/layouts/AdminLayout.astro';
import MyComponent from '@/components/admin/MyComponent';
---

<AdminLayout title="My Feature">
    <MyComponent client:load />
</AdminLayout>
```

3. Create component:
```bash
touch frontend/src/components/admin/MyComponent.tsx
```

### 5.3 Creating New API Endpoint

1. Create endpoint file:
```bash
touch frontend/src/pages/api/my-feature/action.ts
```

2. Add handler:
```typescript
import type { APIRoute } from 'astro';
import { getDirectusClient } from '@/lib/directus/client';

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const client = getDirectusClient();
    
    // Your logic here
    
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
```

### 5.4 Creating New Block Type

1. Create block component:
```bash
touch frontend/src/components/blocks/MyBlock.tsx
```

2. Add component:
```tsx
interface MyBlockProps {
    content: string;
    settings?: Record<string, any>;
}

export function MyBlock({ content, settings }: MyBlockProps) {
    return (
        <section className="py-12">
            <div className="container mx-auto">
                {content}
            </div>
        </section>
    );
}
```

3. Register in `BlockRenderer.tsx`:
```tsx
case 'my_block':
    return <MyBlock key={block.id} {...block.settings} />;
```

---

## 6. Testing

### 6.1 Build Verification

```bash
cd frontend
npm run build
```

Must complete without errors before push.

### 6.2 Type Checking

```bash
npm run astro check
```

### 6.3 Manual Testing

1. Start dev server: `npm run dev`
2. Open http://localhost:4321/admin
3. Test your changes
4. Check browser console for errors
5. Check network tab for API failures

---

## 7. Debugging

### 7.1 React Query Devtools

Enabled in development. Click floating panel (bottom-right) to inspect:
- Active queries
- Cache state
- Refetch status

### 7.2 Vite Inspector

Access: http://localhost:4321/__inspect/

Shows:
- Module graph
- Plugin timing
- Bundle analysis

### 7.3 Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f directus
docker-compose logs -f frontend
```

### 7.4 Database Access

```bash
docker exec -it spark-postgresql-1 psql -U postgres -d directus
```

Useful queries:
```sql
-- List tables
\dt

-- Check collection
SELECT * FROM sites LIMIT 5;

-- Recent work log
SELECT * FROM work_log ORDER BY timestamp DESC LIMIT 10;
```

---

## 8. Code Style

### 8.1 TypeScript

- Strict mode enabled
- Explicit return types for functions
- Use types from `schemas.ts`

### 8.2 React Components

- Functional components only
- Props interface above component
- Use React Query for data fetching

### 8.3 File Naming

| Type | Convention | Example |
|------|------------|---------|
| Page | lowercase | `index.astro` |
| Component | PascalCase | `SiteEditor.tsx` |
| Hook | camelCase | `useSites.ts` |
| API | kebab-case | `generate-article.ts` |

### 8.4 Commit Messages

```
feat: Add new SEO analysis feature
fix: Resolve pagination bug in article list
docs: Update API reference
refactor: Extract shared utility functions
```

---

## 9. Git Workflow

### 9.1 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production (auto-deploys) |
| `feat/*` | New features |
| `fix/*` | Bug fixes |

### 9.2 Typical Flow

```bash
# Create feature branch
git checkout -b feat/my-feature

# Make changes
# ... edit files ...

# Verify build
cd frontend && npm run build

# Commit
git add .
git commit -m "feat: Description"

# Push (triggers Coolify on main)
git push origin feat/my-feature

# Create PR for review
# Merge to main after approval
```

---

## 10. Deployment

### 10.1 Auto-Deploy (Standard)

```bash
git push origin main
```

Coolify detects push and deploys within ~2-3 minutes.

### 10.2 Verify Deployment

1. Check Coolify dashboard for build status
2. Test production URL after successful build
3. Check container logs if issues

### 10.3 Environment Variables

Set in Coolify Secrets:
- `GOD_MODE_TOKEN`
- `DIRECTUS_ADMIN_TOKEN`
- `FORCE_FRESH_INSTALL` (only for schema reset)

### 10.4 Rollback

In Coolify:
1. Go to service
2. Click "Deployments"
3. Select previous deployment
4. Click "Redeploy"

---

## 11. Common Issues

### Build Fails

```bash
# Check for TypeScript errors
npm run astro check

# Verify schemas.ts matches actual collections
# Check for missing dependencies
npm install
```

### API 403 Errors

- Verify `DIRECTUS_ADMIN_TOKEN` is set
- Check Directus permissions for token
- Verify CORS includes your domain

### SSR Errors

- Check `client.ts` SSR URL detection
- Verify Docker network connectivity
- Check container names match expected

### Database Connection

```bash
# Verify container is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgresql
```

---

## 12. Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Docker
docker-compose up -d          # Start all
docker-compose down           # Stop all
docker-compose logs -f        # Stream logs
docker-compose restart directus  # Restart service

# Git
git status           # Check changes
git diff             # View changes
git log -n 5         # Recent commits
```
