# God Mode (Valhalla) Implementation Plan

## 1. Overview
We are extracting the "God Mode" diagnostics console into a completely standalone application ("Valhalla"). This ensures that even if the main Spark Platform crashes (e.g., Directus API failure, Container exhaustion), the diagnostics tools remain available to troubleshoot and fix the system.

## 2. Architecture
- **Repo:** Monorepo strategy (`/god-mode` folder in `jumpstartscaling/net`).
- **Framework:** Astro + React (matching the main frontend stack).
- **Runtime:** Node.js 20 on Alpine Linux.
- **Database:** DIRECT connection to PostgreSQL (bypassing Directus).
- **Deployment:** Separate Coolify Application pointing to `/god-mode` base directory.

## 3. Dependencies
To ensure full compatibility and future-proofing, we are including the **Standard Spark Feature Set** in the dependencies. This allows us to port *any* component from the main app to God Mode without missing libraries.

**Core Stack:**
- `astro`, `@astrojs/node`, `@astrojs/react`
- `react`, `react-dom`
- `tailwindcss`, `shadcn` (radix-ui)

**Data Layer:**
- `pg` (Postgres Client) - **CRITICAL**
- `ioredis` (Redis Client) - **CRITICAL**
- `@directus/sdk` (For future API repairs)
- `@tanstack/react-query` (Data fetching)

**UI/Visualization:**
- `@tremor/react` (Dashboards)
- `recharts` (Metrics)
- `lucide-react` (Icons)
- `framer-motion` (Animations)

## 4. File Structure
```
/god-mode
├── Dockerfile                  (Standard Node 20 build)
├── package.json                (Full dependency list)
├── astro.config.mjs            (Node adapter config)
├── tsconfig.json               (TypeScript config)
├── tailwind.config.cjs         (Shared design system)
└── src
    ├── lib
    │   └── godMode.ts          (Core logic: DB connection)
    ├── pages
    │   ├── index.astro         (Main Dashboard)
    │   └── api
    │       └── god
    │           └── [...action].ts (API Endpoints)
    └── components
        └── ...                 (Ported from frontend)
```

## 5. Implementation Steps

### Step 1: Initialize Workspace
- Create `/god-mode` directory.
- Create `package.json` with the full dependency list.
- Create `Dockerfile` optimized for `npm install`.

### Step 2: Configuration
- Copy `tailwind.config.mjs` (or cjs) from frontend to ensure design parity.
- Configure `astro.config.mjs` for Node.js SSR.

### Step 3: Logic Porting
- Copy `/frontend/src/lib/godMode.ts` -> Update to use `process.env` directly.
- Copy `/frontend/src/pages/god.astro` -> `/god-mode/src/pages/index.astro`.
- Copy `/frontend/src/pages/api/god/[...action].ts` -> `/god-mode/src/pages/api/god/[...action].ts`.

### Step 4: Verification
- Build locally (`npm run build`).
- Verify DB connection with explicit connection string.

### Step 5: Deployment
- User creates new App in Coolify:
  - **Repo:** `jumpstartscaling/net`
  - **Base Directory:** `/god-mode`
  - **Env Vars:** `DATABASE_URL`, `GOD_MODE_TOKEN`

## 6. Coolify Env Vars
```bash
# Internal Connection String (from Coolify PostgreSQL)
DATABASE_URL=postgres://postgres:PASSWORD@host:5432/postgres

# Security Token
GOD_MODE_TOKEN=jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA

# Server Port
PORT=4321
HOST=0.0.0.0
```
