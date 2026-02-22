# God Mode Admin Manual

## 🔱 Welcome to God Mode

This manual provides a comprehensive guide to the Spark God Mode Administration Panel. The system is designed to give you absolute control over the entire content generation, intelligence, and deployment infrastructure.

## 🧭 Navigation Structure

The admin panel is organized into "Stations":

1.  **Mission Control:** The main dashboard.
2.  **Intelligence Station:** Manages avatars, patterns, and geo-data.
3.  **Production Station:** Controls content generation and factories.
4.  **WordPress Ignition:** Manages connections to external sites.
5.  **Data Collections:** Raw database table access.

---

## 📖 Page-by-Page Guide

### 1. Command Station (`/admin/command-station`)
**Status:** ✅ Active
- **Purpose:** Central hub for checking the health of all sub-stations.
- **Key Features:**
  - Real-time status of Intelligence, Production, and WP engines.
  - Quick actions for common tasks (New Campaign, Deploy Site).
  - System health metrics (API, DB, Redis).

### 2. Content Generator (`/admin/content-generator`)
**Status:** ✅ Active (Full Logic)
- **Purpose:** The core engine interface for generating content.
- **How to Use:**
  1.  Paste a JSON blueprint into the editor (or click "Load Example").
  2.  Click "Create Campaign".
  3.  The system parses variables (`{{CITY}}`) and Spintax (`{A|B}`).
  4.  A background worker processes the job and generates posts.
- **Developer Note:** Connected to `POST /api/god/campaigns/create`.

### 3. Sites Manager (`/admin/sites`)
**Status:** 🚧 Beta (Needs DB Connection)
- **Purpose:** Manage all deployment targets (WordPress sites).
- **Missing:** Needs to fetch real rows from the `sites` table.
- **Action Required:** Update the fetch logic in `sites.astro` to call `/api/collections/sites`.

### 4. Avatar Intelligence (`/admin/intelligence/avatars`)
**Status:** 🚧 Beta (Needs DB Connection)
- **Purpose:** Define and refine the AI personas used for writing.
- **Missing:** Needs connection to `avatars` table.
- **Action Required:** Wire up the data table to display `name`, `persona_type`, `tone`.

### 5. Geo Intelligence (`/admin/collections/geo-intelligence`)
**Status:** 🚧 Beta
- **Purpose:** Manage location data (Cities, Counties, Zip Codes) for local SEO.
- **Missing:** PostGIS data connection.
- **Action Required:** ensure the map component receives real Lat/Lon data.

### 6. Generation Queue (`/admin/collections/generation-jobs`)
**Status:** 🚧 Beta
- **Purpose:** Monitor the background BullMQ jobs.
- **Missing:** Real-time polling of the Redis queue.
- **Action Required:** Implement `GET /api/queue/status` to return active job counts.

### 7. Generated Articles (`/admin/generated-articles`)
**Status:** ✅ Active UI
- **Purpose:** A filtered view of content specifically created by the AI (not manual posts).
- **Features:** Shows title, campaign source, and publication status.

### 8. System Logs (`/admin/system-logs`)
**Status:** ✅ Active UI
- **Purpose:** Debugging tool to see raw logs from the backend.
- **Developer Note:** Currently shows mock data. Needs a WebSocket or polling endpoint for real server logs.

---

## 🛠 Developer Guide: How to Connect a Page

Every admin page follows a standard architecture. To connect a "Beta" page to the real database:

1.  **Open the file:** e.g., `src/pages/admin/sites.astro`.
2.  **Locate the Script Section:** Look for the `<script>` tag at the bottom.
3.  **Implement Fetch:**
    ```javascript
    async function loadData() {
      const response = await fetch('/api/collections/sites');
      const data = await response.json();
      renderTable(data); // Use the existing render function
    }
    loadData();
    ```
4.  **Remove DevStatus:** Once connected, delete the `<DevStatus ... />` component import and usage at the top of the file.

---

## 🎨 Design System

All pages must adhere to the **Titanium/Gold** theme:
- **Backgrounds:** `bg-titanium` (Main), `bg-obsidian` (Cards/Panels).
- **Borders:** `border-edge-normal` (Panels), `border-edge-subtle` (Internal dividers).
- **Text:** `text-gray-100` (Body), `text-gold-500` (Headings/Accents), `text-gray-400` (Subtext).
- **Buttons:** `bg-gold-500 text-obsidian` (Primary), `bg-gray-700` (Secondary).

---

## 🔄 Redeployment Strategy

To ensure high availability:

1.  **Config Changes:** If changing `ENV` vars only, use "Restart" in Coolify. Do not rebuild.
2.  **Content Updates:** Edit the JSON blueprints or Database directly. No deployment needed.
3.  **Code Updates:**
    - Push to `main` branch.
    - Coolify webhook will trigger a build.
    - **Optimization:** The Dockerfile is multi-stage to cache `node_modules`.

*Last Updated: 2025-12-15*
