# 🤖 AI ONBOARDING & HANDOFF PROTOCOL: PROJECT VALHALLA

You are now the Lead Architect for **Project Valhalla (God Mode)**. This is a high-performance content generation engine built on Astro, React, Node.js, and Postgres.

## 🎯 YOUR MISSION
Your objective is to assume full control of the codebase, stabilize it, and prepare it for production scale. You must execute the following **Onboarding Protocol** immediately.

---

## 🔍 PROTOCOL 1: THE SLOW DEEP DIVE
**Do not rush.** Take your time to build a complete mental model of the system.
1.  **File System Scan:** recursively list and read the file structure. Understand the separation between `src/pages` (Astro routes), `src/lib` (Core logic), and `src/components` (UI).
2.  **Connection Graph:** Trace how the application connects to:
    *   **Postgres:** Via `src/lib/db/index.ts` and the "God Mode Shim".
    *   **Redis:** Via `src/lib/queue/config.ts`.
    *   **Directus:** Via `office.jumpstartscaling.com` (API) and the internal Shim (SQL).
3.  **Python Bridge:** Analyze the connection to `god_architect_local/` scripts and how they interface with the Node app.

## 🛠️ PROTOCOL 2: CODE HYGIENE & REPAIRS
Systematically traverse the codebase to identify and fix code rot.
1.  **Syntax Errors:** Identify any TypeScript/JavaScript syntax errors preventing build or runtime execution. **Fix them immediately.**
2.  **Deprecated Patterns:**
    *   Update deprecated React patterns (e.g., finding `ReactDOM.render` -> `createRoot`).
    *   Replace deprecated package usages (e.g., `astro:db` artifacts, old `react-flow` imports).
    *   Ensure all API endpoints allow for `X-God-Token` authentication.

## 📝 PROTOCOL 3: TECH DEBT & UNFINISHED WORK
Do not leave loose ends hidden.
1.  **Audit:** As you scan, look for `TODO`, `FIXME`, or code blocks that look incomplete (empty functions, mocked returns).
2.  **Document:** Create or update a file named `docs/UNFINISHED_WORK.md`.
    *   Categorize by Priority (Critical vs. Polish).
    *   List specific file paths and line numbers.
    *   Provide a brief "Completion Strategy" for each item.

## 🏗️ SYSTEM CONTEXT
*   **Repo:** `gatekeeper/mini.git`
*   **Core Stack:** Astro 5, React 19, Tailwind, Node.js, Postgres (Direct Connection), Redis.
*   **Architecture:** Server-Side Rendering (SSR) with "God Mode Shim" bypassing the CMS API for 100x performance.
*   **Deploy Target:** Coolify (Docker Compose).

## 🔐 PROTOCOL 4: SECURE LOCAL ENVIRONMENT
This project uses a secure SSH tunnel to connect to the production database from your local machine.

### 1. Database Connection
*   **Method:** SSH Tunnel (Localhost Binding)
*   **Port:** `5433` (Proxied to Remote `5432`)
*   **Connection String:** `postgres://spark-god-mode:PASSWORD@127.0.0.1:5433/arc-net`
*   **Security:** Only localhost (your machine) can connect. External requests are firewall BLOCKED.

### 2. Startup Sequence
To start development, you must always run the tunnel first:
```bash
# 1. Start Secure SSH Tunnel
./scripts/secure-tunnel.sh start

# 2. Verify Tunnel (Should show PID)
./scripts/secure-tunnel.sh status

# 3. Start Dev Server
npm run dev
```

## 🚀 IMMEDIATE ACTION
Start your **Deep Dive** now. Verify the secure tunnel status before attempting database operations. Report back only when you have a full health assessment.
