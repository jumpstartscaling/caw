The previous attempts failed because they relied on the Directus API, which you have clarified is not installed/used.

I have updated the Handoff to explicitly instruct the next agent to use Direct SQL for data insertion and Next.js/Astro API endpoints for the generation trigger.

📦 Updated Handoff: God Mode Deployment (NO Directus)
I have rewritten 
GOD_MODE_HANDOFF.md
 to align with your architecture:

CRITICAL CONSTRAINT: Do NOT use Directus SDK or API. Directus is not installed/running.
Architecture:
Data Insertion: Use Node-postgres (pg) to insert JSON payload directly into the SQL tables (sites, campaign_masters, etc.).
Generation: Trigger the Spark App API (e.g., http://localhost:4321/api/seo/generate-article) to handle the spinning and processing after data is inserted.
Files Provided:
✅ Payload: 
backend/scripts/chrisamaya_deploy.json
 (Ready)
✅ SQL Mapping: I've mapped the JSON fields to the SQL tables in the handoff.
The next agent has clear instructions to write a SQL-based deployment script, ignoring Directus completely.
# 📦 Handoff: God Mode Deployment (Direct SQL Approach)

## 🛑 CRITICAL ARCHITECTURE WARNING
**DIRECTUS IS NOT INSTALLED OR USED.**
Do **NOT** use `@directus/sdk` or try to connect to port 8055.
All data insertion must be done via **Direct SQL (PostgreSQL)**.

## 🎯 Objective
Deploy the "Chrisamaya.work batch 1" campaign by inserting the provided JSON payload directly into the PostgreSQL database, then triggering the Spark App's local API to generate content.

## 📂 Key Resources
*   **Payload:** `/Users/christopheramaya/Downloads/spark/backend/scripts/chrisamaya_deploy.json`
*   **Target Database:** PostgreSQL (Likely `localhost:5432`). Check `docker-compose.yaml` for credentials (user: `postgres`).
*   **Target API:** Spark Frontend/API (`http://localhost:4321` or `http://localhost:3000`).

## 🚀 Action Plan for Next Agent

1.  **Create SQL Deployment Script** (`backend/scripts/run_god_mode_sql.ts`):
    *   **Dependencies:** Use `pg` (node-postgres).
    *   **Logic:**
        1.  Read `chrisamaya_deploy.json`.
        2.  **Connect** to Postgres.
        3.  **Insert Site:** `INSERT INTO sites (name, url, status) VALUES (...) RETURNING id`.
        4.  **Insert Template:** `INSERT INTO article_templates (...) RETURNING id`.
        5.  **Insert Campaign:** `INSERT INTO campaign_masters (...)` (Use IDs from above).
        6.  **Insert Headlines:** Loop and `INSERT INTO headline_inventory`.
        7.  **Insert Fragments:** Loop and `INSERT INTO content_fragments`.
    *   **Note:** Handle UUID generation if not using database defaults (use `crypto.randomUUID()` or `uuid` package).

2.  **Trigger Generation**:
    *   After SQL insertion is complete, the script should allow triggering the generation engine.
    *   **Endpoint:** POST to `http://localhost:4321/api/seo/generate-article` (or valid local Spark endpoint).
    *   **Auth:** Use the `api_token` from the JSON header.

## 🔐 Credentials
*   **God Mode Token:** `jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA`
*   **DB Config:** Check local environment variables for DB connection string.

## 📝 Schema Mapping (Mental Model)
*   `json.site_setup` -> Table: `sites`
*   `json.article_template` -> Table: `article_templates`
*   `json.campaign_master` -> Table: `campaign_masters`
*   `json.headline_inventory` -> Table: `headline_inventory`
*   `json.content_fragments` -> Table: `content_fragments`
