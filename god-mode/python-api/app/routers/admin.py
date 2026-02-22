"""Admin routes - lead list, Harris matrix CRUD, etc. No auth."""
import asyncio
import json
import os
import subprocess
import sys
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse
from fastapi import APIRouter, Request, Query, Body
from fastapi.responses import HTMLResponse, JSONResponse

from fastapi import Header, HTTPException

from app.config import config
from app.db.connection import get_db, run_schema, DatabaseUnavailableError

router = APIRouter(prefix="/admin", tags=["admin"])
api_router = APIRouter(prefix="/api", tags=["admin"])


async def _get_debug_data():
    """Shared debug data: config, health, api_logs. Used by HTML and JSON endpoints."""
    env_safe = {}
    for k in ("DATABASE_URL", "ADMIN_KEY", "ADMIN_USERNAME", "ADMIN_PASSWORD", "DEBUG", "LOG_REQUESTS", "HOST", "PORT"):
        v = os.getenv(k, "")
        if k == "DATABASE_URL" and v:
            try:
                u = urlparse(v)
                if u.hostname:
                    creds = f"{u.username}:***@" if u.username else ""
                    env_safe[k] = f"{u.scheme}://{creds}{u.hostname}:{u.port or 5432}/{u.path.lstrip('/')}"
                else:
                    env_safe[k] = "[set]" if v else ""
            except Exception:
                env_safe[k] = "[set]" if v else ""
        elif k == "ADMIN_KEY":
            env_safe[k] = "***" if v else "[empty]"
        elif k == "ADMIN_PASSWORD":
            env_safe[k] = "***" if os.getenv("ADMIN_PASSWORD") else "[empty]"
        elif k in ("DEBUG", "LOG_REQUESTS"):
            env_safe[k] = str(config.DEBUG if k == "DEBUG" else config.LOG_REQUESTS)
        else:
            env_safe[k] = v or "[empty]"

    api_logs = []
    try:
        async with get_db() as conn:
            rows = await conn.fetch(
                "SELECT id, endpoint, method, status, created_at FROM api_logs ORDER BY created_at DESC LIMIT 50"
            )
            api_logs = [dict(r) for r in rows]
    except Exception as e:
        api_logs = [{"error": str(e)}]

    health_status = "ok"
    try:
        async with get_db() as conn:
            await conn.fetchval("SELECT 1")
    except Exception as e:
        health_status = f"db error: {e}"

    return {"config": env_safe, "health": health_status, "api_logs": api_logs}


@router.get("/leads", response_class=HTMLResponse)
async def admin_leads(request: Request):
    """Leads dashboard. No auth."""

    async with get_db() as conn:
        rows = await conn.fetch("SELECT * FROM leads ORDER BY created_at DESC LIMIT 500")

    def _row_html(row):
        badge = "ca" if (row.get("source") or "").lower() == "chrisamaya" else "js"
        dj = row.get("data_json") or {}
        if isinstance(dj, str):
            dj = json.loads(dj) if dj else {}
        extras = []
        if dj.get("industry"):
            extras.append(f'<div>🏭 {dj["industry"]}</div>')
        if dj.get("team"):
            extras.append(f'<div>👥 {dj["team"]}</div>')
        tracking = []
        if dj.get("utm_source"):
            tracking.append(f"Src: {dj['utm_source']}")
        if dj.get("utm_campaign"):
            tracking.append(f"Cmp: {dj['utm_campaign']}")
        if dj.get("page_url"):
            try:
                tracking.append(f"Page: {dj['page_url'].split('/')[-1] or '/'}")
            except Exception:
                pass
        if tracking:
            extras.append(
                f'<div style="margin-top:8px;font-size:0.75rem;color:#888;">{" • ".join(tracking)}</div>'
            )
        return f"""
            <tr>
                <td>{row["id"]}</td>
                <td><span class="badge {badge}">{row.get("source") or "-"}</span></td>
                <td>{row.get("name") or "-"}</td>
                <td><a href="mailto:{row.get("email") or ""}" style="color:#4da6ff">{row.get("email") or "-"}</a></td>
                <td>{row.get("phone") or "-"}</td>
                <td>
                    {f'<div>🌐 {row["website"]}</div>' if row.get("website") else ''}
                    {f'<div>💰 {row["revenue"]}</div>' if row.get("revenue") else ''}
                    {f'<div>⚠️ {row["problem"]}</div>' if row.get("problem") else ''}
                    {"".join(extras)}
                </td>
                <td>{row.get("created_at", "")}</td>
            </tr>
        """

    rows_html = "".join(_row_html(dict(r)) for r in rows)

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Leads Dashboard</title>
        <style>
            body {{ font-family: sans-serif; background: #111; color: #eee; padding: 2rem; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #333; padding: 12px; text-align: left; }}
            th {{ background: #222; color: #C9A961; }}
            tr:nth-child(even) {{ background: #1a1a1a; }}
            .badge {{ padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }}
            .js {{ background: #C9A961; color: #000; }}
            .ca {{ background: #00FF94; color: #000; }}
        </style>
    </head>
    <body>
        <h1>🚀 Leads Dashboard (God Mode API)</h1>
        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Source</th><th>Name</th><th>Email</th><th>Phone</th><th>Details</th><th>Date</th>
                </tr>
            </thead>
            <tbody>{rows_html}</tbody>
        </table>
    </body>
    </html>
    """
    return HTMLResponse(html)


@router.get("/leads/json")
async def admin_leads_json(
    request: Request,
    limit: int = Query(50, le=500),
    offset: int = Query(0, ge=0),
):
    """JSON API for leads. No auth."""
    async with get_db() as conn:
        rows = await conn.fetch(
            "SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            limit,
            offset,
        )
    return {"success": True, "leads": [dict(r) for r in rows]}


_ADMIN_STYLE = """
body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 2rem; }
a { color: #C9A961; }
a:hover { text-decoration: underline; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th, td { border: 1px solid #333; padding: 10px; text-align: left; }
th { background: #222; color: #C9A961; }
tr:nth-child(even) { background: #1a1a1a; }
input, textarea, select { padding: 6px; background: #222; color: #eee; border: 1px solid #444; }
button { padding: 8px 16px; background: #C9A961; color: #000; border: none; cursor: pointer; }
button.danger { background: #c33; color: #fff; }
.nav { margin-bottom: 2rem; }
.nav a { margin-right: 1rem; }
"""


@router.get("/", response_class=HTMLResponse)
async def admin_index():
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html><head><title>God Mode Admin</title><style>{_ADMIN_STYLE}</style></head>
    <body>
        <h1>🔱 God Mode Admin</h1>
        <nav class="nav">
            <a href="/admin/leads">Leads</a>
            <a href="/admin/locations">Locations</a>
            <a href="/admin/pseo-services">Services</a>
            <a href="/admin/content-matrix">Content Matrix</a>
            <a href="/admin/status">Status</a>
            <a href="/admin/seed-wizard">Seed Wizard</a>
            <a href="/admin/debug">Debug</a>
        </nav>
    </body></html>
    """)


_STATUS_PAGE_HTML = """
<!DOCTYPE html>
<html><head>
<title>God Mode API Status</title>
<style>
body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 1rem 2rem; margin: 0; }
a { color: #C9A961; }
.nav { margin-bottom: 1.5rem; }
.nav a { margin-right: 1rem; }
h1, h2 { color: #C9A961; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; }
th { background: #222; }
tr:nth-child(even) { background: #1a1a1a; }
.ok { color: #4ade80; }
.err { color: #f87171; }
#swagger-ui { margin-top: 1rem; }
.swagger-ui .topbar { display: none; }
</style>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
</head>
<body>
<h1>God Mode API Status</h1>
<nav class="nav"><a href="/admin/">← Admin</a> <a href="/admin/debug">Debug</a> <a href="/admin/seed-wizard">Seed Wizard</a></nav>

<h2>Endpoint Health</h2>
<table><thead><tr><th>Endpoint</th><th>Method</th><th>Status</th><th>Use Case</th><th>Admin Page</th></tr></thead>
<tbody id="health-tbody"></tbody></table>

<h2>Recent API Logs</h2>
<table><thead><tr><th>ID</th><th>Endpoint</th><th>Method</th><th>Status</th><th>Created</th></tr></thead>
<tbody id="logs-tbody"></tbody></table>

<h2>OpenAPI Docs</h2>
<div id="swagger-ui"></div>

<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
<script>
const BASE = window.location.origin;
const ENDPOINTS = [
  { path: "/health", method: "GET", useCase: "Liveness check", admin: "" },
  { path: "/api/counts", method: "GET", useCase: "Table row counts", admin: "/admin/debug" },
  { path: "/api/seed/chrisamaya", method: "POST", useCase: "Seed chrisamaya.work tenant", admin: "/admin/seed-wizard" },
  { path: "/api/sites/resolve?domain=chrisamaya.work", method: "GET", useCase: "Resolve domain to site_id", admin: "" },
  { path: "/api/public/posts?site_url=https://chrisamaya.work", method: "GET", useCase: "Published posts by site", admin: "/admin/posts" },
  { path: "/api/locations", method: "GET", useCase: "Harris matrix locations", admin: "/admin/locations" },
  { path: "/api/pseo-services", method: "GET", useCase: "pSEO services", admin: "/admin/pseo-services" },
  { path: "/api/content-matrix?limit=10", method: "GET", useCase: "Cartesian content matrix", admin: "/admin/content-matrix" },
  { path: "/api/generation-jobs", method: "GET", useCase: "List generation jobs", admin: "/admin/factory" },
  { path: "/api/leads", method: "GET", useCase: "Lead list", admin: "/admin/leads" },
  { path: "/api/debug", method: "GET", useCase: "Config, health, api_logs", admin: "/admin/debug" }
];

async function checkEndpoint(ep) {
  try {
    const opts = ep.method === "POST" ? { method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Key": sessionStorage.getItem("admin_key") || "" } } : {};
    const r = await fetch(BASE + ep.path, opts);
    return r.status;
  } catch (e) { return "ERR"; }
}

async function renderHealth() {
  const tbody = document.getElementById("health-tbody");
  for (const ep of ENDPOINTS) {
    const status = await checkEndpoint(ep);
    const cls = (typeof status === "number" && status >= 200 && status < 400) ? "ok" : "err";
    const adminLink = ep.admin ? '<a href="' + ep.admin + '">' + ep.admin.split("/").pop() + "</a>" : "";
    tbody.innerHTML += "<tr><td>" + ep.path + "</td><td>" + ep.method + "</td><td class=\"" + cls + "\">" + status + "</td><td>" + ep.useCase + "</td><td>" + adminLink + "</td></tr>";
  }
}

async function renderLogs() {
  try {
    const r = await fetch(BASE + "/api/debug");
    const d = await r.json();
    const logs = d.api_logs || [];
    const tbody = document.getElementById("logs-tbody");
    if (logs.length && logs[0].error) {
      tbody.innerHTML = "<tr><td colspan=\"5\">" + logs[0].error + "</td></tr>";
    } else {
      tbody.innerHTML = logs.slice(0, 20).map(l => "<tr><td>" + l.id + "</td><td>" + (l.endpoint||"") + "</td><td>" + (l.method||"") + "</td><td>" + l.status + "</td><td>" + (l.created_at||"") + "</td></tr>").join("");
    }
  } catch (e) {
    document.getElementById("logs-tbody").innerHTML = "<tr><td colspan=\"5\">" + e.message + "</td></tr>";
  }
}

window.onload = async () => {
  await renderHealth();
  await renderLogs();
  SwaggerUIBundle({ url: BASE + "/openapi.json", dom_id: "#swagger-ui", presets: [SwaggerUIBundle.presets.apis] });
};
</script>
</body></html>
"""


@router.get("/status", response_class=HTMLResponse)
async def admin_status():
    """API Status page: Swagger UI, endpoint health checker, use-case table, api_logs."""
    return HTMLResponse(_STATUS_PAGE_HTML)


_SEED_WIZARD_HTML = """
<!DOCTYPE html>
<html><head>
<title>Seed Wizard — chrisamaya.work</title>
<style>
body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 1rem 2rem; margin: 0; }
a { color: #C9A961; }
.nav { margin-bottom: 1.5rem; }
.nav a { margin-right: 1rem; }
h1, h2 { color: #C9A961; }
.step { margin: 1.5rem 0; padding: 1rem; border: 1px solid #333; border-radius: 8px; }
label { display: block; margin: 0.5rem 0; }
input, button { padding: 8px 12px; background: #222; color: #eee; border: 1px solid #444; border-radius: 4px; margin-right: 0.5rem; }
button.primary { background: #C9A961; color: #000; border: none; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.output { margin-top: 1rem; padding: 1rem; background: #1a1a1a; border-radius: 4px; white-space: pre-wrap; font-family: monospace; font-size: 0.9rem; }
.ok { color: #4ade80; }
.err { color: #f87171; }
</style>
</head>
<body>
<h1>Seed Wizard — chrisamaya.work</h1>
<nav class="nav"><a href="/admin/">← Admin</a> <a href="/admin/status">Status</a> <a href="/admin/debug">Debug</a></nav>

<div class="step">
<h2>1. Admin Key</h2>
<label>Paste ADMIN_KEY (from .env.local or Coolify env):</label>
<input type="password" id="admin-key" placeholder="ADMIN_KEY" style="width: 360px;">
<button onclick="saveKey()">Save (session only)</button>
<span id="key-status"></span>
</div>

<div class="step">
<h2>2. Site</h2>
<p>Domain: <strong>chrisamaya.work</strong></p>
<p>Name: <strong>chrisamaya</strong></p>
</div>

<div class="step">
<h2>3. Seed Data Summary</h2>
<ul>
<li>50 locations (Austin, Dallas, Houston, etc.)</li>
<li>35 pSEO services</li>
<li>22 synonym groups</li>
<li>18 spintax dictionaries</li>
<li>72+ content fragments</li>
<li>42+ headlines</li>
<li>18 offer blocks</li>
<li>geo_intelligence per location</li>
<li>content_matrix (Cartesian: locs × services)</li>
</ul>
</div>

<div class="step">
<h2>4. Campaign</h2>
<label>Target quantity (articles): <input type="number" id="target-qty" value="2000" min="10" max="10000"></label>
</div>

<div class="step">
<h2>5. Execute</h2>
<button class="primary" id="btn-seed" onclick="runSeed()">Run Seed</button>
<button class="primary" id="btn-launch" onclick="runLaunch()" disabled>Launch Campaign</button>
<div class="output" id="output"></div>
</div>

<script>
const BASE = window.location.origin;
let lastResult = null;

function getKey() { return sessionStorage.getItem("admin_key") || document.getElementById("admin-key").value; }
function saveKey() {
  const k = document.getElementById("admin-key").value.trim();
  if (k) { sessionStorage.setItem("admin_key", k); document.getElementById("key-status").innerHTML = '<span class="ok">Saved</span>'; }
  else { sessionStorage.removeItem("admin_key"); document.getElementById("key-status").innerHTML = '<span class="err">Cleared</span>'; }
}

function log(msg, cls) {
  const el = document.getElementById("output");
  el.innerHTML += (cls ? '<span class="' + cls + '">' + msg + '</span>' : msg) + "\\n";
  el.scrollTop = el.scrollHeight;
}

async function runSeed() {
  const key = getKey();
  if (!key) { log("Paste ADMIN_KEY and save first.", "err"); return; }
  document.getElementById("output").innerHTML = "";
  document.getElementById("btn-seed").disabled = true;
  log("POST /api/seed/chrisamaya ...");
  try {
    const r = await fetch(BASE + "/api/seed/chrisamaya", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": key }
    });
    const body = await r.json().catch(() => ({}));
    if (r.ok) {
      lastResult = body;
      log("Seed OK: " + (body.message || "done"), "ok");
      log("site_id: " + body.site_id + ", campaign_id: " + body.campaign_id);
      if (body.counts) log("counts: " + JSON.stringify(body.counts));
      document.getElementById("btn-launch").disabled = false;
    } else {
      log("Seed failed: " + r.status + " " + (body.detail || JSON.stringify(body)), "err");
    }
  } catch (e) {
    log("Error: " + e.message, "err");
  }
  document.getElementById("btn-seed").disabled = false;
}

async function runLaunch() {
  if (!lastResult || !lastResult.site_id || !lastResult.campaign_id) {
    log("Run seed first.", "err");
    return;
  }
  const key = getKey();
  const qty = parseInt(document.getElementById("target-qty").value, 10) || 2000;
  document.getElementById("btn-launch").disabled = true;
  log("POST /api/generation-jobs ... target_quantity=" + qty);
  try {
    const r = await fetch(BASE + "/api/generation-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": key },
      body: JSON.stringify({
        site_id: lastResult.site_id,
        campaign_id: lastResult.campaign_id,
        target_quantity: qty,
        dry_run: false
      })
    });
    const body = await r.json().catch(() => ({}));
    if (r.ok) {
      log("Job created: " + body.id, "ok");
    } else {
      log("Launch failed: " + r.status + " " + JSON.stringify(body), "err");
    }
  } catch (e) {
    log("Error: " + e.message, "err");
  }
  document.getElementById("btn-launch").disabled = false;
}
</script>
</body></html>
"""


@router.get("/seed-wizard", response_class=HTMLResponse)
async def admin_seed_wizard():
    """Seed Wizard: configure and run chrisamaya.work seed via API."""
    return HTMLResponse(_SEED_WIZARD_HTML)


@router.get("/locations", response_class=HTMLResponse)
async def admin_locations():
    async with get_db() as conn:
        rows = await conn.fetch("SELECT id, city, state, zip, neighborhood, slug FROM locations ORDER BY city, state")
    rows_html = "".join(
        f'<tr><td>{r["id"]}</td><td>{r["city"]}</td><td>{r["state"]}</td><td>{r["zip"] or ""}</td>'
        f'<td>{r["neighborhood"] or ""}</td><td>{r["slug"] or ""}</td><td></td></tr>'
        for r in rows
    )
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html><head><title>Locations</title><style>{_ADMIN_STYLE}</style></head>
    <body>
        <h1>Locations (Harris Matrix)</h1>
        <nav class="nav"><a href="/admin/">← Admin</a></nav>
        <table><thead><tr><th>ID</th><th>City</th><th>State</th><th>Zip</th><th>Neighborhood</th><th>Slug</th><th></th></tr></thead>
        <tbody>{rows_html}</tbody></table>
        <p>Use API: POST /api/locations?key=... with {{"city":"...","state":"..."}}</p>
    </body></html>
    """)


@router.get("/pseo-services", response_class=HTMLResponse)
async def admin_pseo_services():
    async with get_db() as conn:
        rows = await conn.fetch("SELECT id, service_type, sub_niche, slug FROM pseo_services ORDER BY service_type")
    rows_html = "".join(
        f'<tr><td>{r["id"]}</td><td>{r["service_type"]}</td><td>{r["sub_niche"] or ""}</td><td>{r["slug"] or ""}</td></tr>'
        for r in rows
    )
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html><head><title>pSEO Services</title><style>{_ADMIN_STYLE}</style></head>
    <body>
        <h1>pSEO Services</h1>
        <nav class="nav"><a href="/admin/">← Admin</a></nav>
        <table><thead><tr><th>ID</th><th>Service Type</th><th>Sub Niche</th><th>Slug</th></tr></thead>
        <tbody>{rows_html}</tbody></table>
        <p>Use API: POST /api/pseo-services?key=... with {{"service_type":"..."}}</p>
    </body></html>
    """)


@router.get("/content-matrix", response_class=HTMLResponse)
async def admin_content_matrix():
    async with get_db() as conn:
        rows = await conn.fetch(
            "SELECT cm.id, cm.slug, cm.title, l.city, l.state, ps.service_type FROM content_matrix cm "
            "LEFT JOIN locations l ON cm.location_id = l.id LEFT JOIN pseo_services ps ON cm.service_id = ps.id "
            "ORDER BY cm.slug LIMIT 200"
        )
    rows_html = "".join(
        f'<tr><td>{r["id"]}</td><td>{r["slug"]}</td><td>{(r["title"] or "")[:60]}...</td>'
        f'<td>{r["city"] or ""} {r["state"] or ""}</td><td>{r["service_type"] or ""}</td></tr>'
        for r in rows
    )
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html><head><title>Content Matrix</title><style>{_ADMIN_STYLE}</style></head>
    <body>
        <h1>Content Matrix (pSEO)</h1>
        <nav class="nav"><a href="/admin/">← Admin</a></nav>
        <table><thead><tr><th>ID</th><th>Slug</th><th>Title</th><th>Location</th><th>Service</th></tr></thead>
        <tbody>{rows_html}</tbody></table>
        <p>Use API: POST /api/content-matrix?key=... or seed_from_exports.py</p>
    </body></html>
    """)


@api_router.get("/debug")
async def api_debug():
    """JSON debug endpoint: config, health, api_logs. Used by Astro admin Debug page."""
    return await _get_debug_data()


@api_router.get("/counts")
async def api_counts():
    """Counts for intelligence and collections dashboards."""
    async with get_db() as conn:
        out = {}
        for table in [
            "avatar_intelligence", "avatar_variants", "geo_intelligence",
            "spintax_dictionaries", "cartesian_patterns",
            "page_blocks", "offer_blocks", "headline_inventory", "content_fragments",
        ]:
            n = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
            out[table] = n or 0
    return out


@api_router.get("/generation-jobs")
async def api_generation_jobs(limit: int = Query(200, ge=1, le=500)):
    """List generation jobs for factory kanban."""
    async with get_db() as conn:
        rows = await conn.fetch(
            "SELECT id, status, target_quantity, progress, site_id, campaign_id FROM generation_jobs ORDER BY id DESC LIMIT $1",
            min(limit, 500),
        )
        return [dict(r) for r in rows]


@api_router.get("/analytics/summary")
async def api_analytics_summary():
    """Analytics summary from events, pageviews, conversions tables."""
    async with get_db() as conn:
        events_n = await conn.fetchval("SELECT COUNT(*) FROM events")
        pageviews_n = await conn.fetchval("SELECT COUNT(*) FROM pageviews")
        conversions_n = await conn.fetchval("SELECT COUNT(*) FROM conversions")
    return {"events": events_n or 0, "pageviews": pageviews_n or 0, "conversions": conversions_n or 0}


async def _list_table(table: str, limit: int = 200):
    """List rows from table. limit clamped to 1-500."""
    limit = max(1, min(500, limit or 200))
    async with get_db() as conn:
        rows = await conn.fetch(f"SELECT * FROM {table} LIMIT $1", limit)
        return [dict(r) for r in rows]


@api_router.get("/avatar-intelligence")
async def api_avatar_intelligence(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("avatar_intelligence", limit)


@api_router.get("/avatar-variants")
async def api_avatar_variants(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("avatar_variants", limit)


@api_router.get("/campaign-masters")
async def api_campaign_masters(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("campaign_masters", limit)


@api_router.get("/cartesian-patterns")
async def api_cartesian_patterns(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("cartesian_patterns", limit)


@api_router.get("/content-fragments")
async def api_content_fragments(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("content_fragments", limit)


@api_router.get("/conversions")
async def api_conversions(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("conversions", limit)


@api_router.get("/events")
async def api_events(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("events", limit)


@api_router.get("/generated-articles")
async def api_generated_articles(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("generated_articles", limit)


@api_router.get("/geo-intelligence")
async def api_geo_intelligence(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("geo_intelligence", limit)


@api_router.get("/headline-inventory")
async def api_headline_inventory(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("headline_inventory", limit)


@api_router.get("/offer-blocks")
async def api_offer_blocks(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("offer_blocks", limit)


@api_router.get("/page-blocks")
async def api_page_blocks(
    limit: int = Query(200, ge=1, le=500),
    site_id: str | None = Query(None, alias="site_id"),
    page_id: str | None = Query(None, alias="page_id"),
):
    """List page blocks. Optional: site_id (filter via pages), page_id (filter by page)."""
    limit = min(limit, 500)
    try:
        async with get_db() as conn:
            if page_id:
                rows = await conn.fetch(
                    "SELECT * FROM page_blocks WHERE page_id = $1::uuid ORDER BY sort_order ASC, created_at ASC LIMIT $2",
                    uuid.UUID(page_id),
                    limit,
                )
            elif site_id:
                rows = await conn.fetch(
                    """
                    SELECT pb.* FROM page_blocks pb
                    JOIN pages p ON pb.page_id = p.id
                    WHERE p.site_id = $1::uuid
                    ORDER BY pb.sort_order ASC, pb.created_at ASC
                    LIMIT $2
                    """,
                    uuid.UUID(site_id),
                    limit,
                )
            else:
                rows = await conn.fetch("SELECT * FROM page_blocks ORDER BY sort_order ASC NULLS LAST, created_at ASC LIMIT $1", limit)
        return [dict(r) for r in rows]
    except (ValueError, TypeError):
        return []


@api_router.get("/pages")
async def api_pages(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("pages", limit)


@api_router.get("/pageviews")
async def api_pageviews(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("pageviews", limit)


@api_router.get("/public/posts")
async def api_public_posts(site_url: str = Query("", alias="site_url")):
    """Resolve site by URL and return published posts."""
    domain = (site_url or "").strip()
    if not domain:
        return {"posts": [], "site_id": None}
    try:
        p = urlparse(domain if "://" in domain else f"https://{domain}")
        domain = p.hostname or domain
    except Exception:
        domain = domain
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
            f"%{domain}%",
        )
        if not row:
            return {"posts": [], "site_id": None}
        site_id = row["id"]
        rows = await conn.fetch(
            """
            SELECT id, title, slug, content, excerpt, published_at, created_at
            FROM posts
            WHERE site_id = $1 AND status = 'published'
            ORDER BY published_at DESC NULLS LAST, created_at DESC
            LIMIT 100
            """,
            site_id,
        )
    return {"posts": [dict(r) for r in rows], "site_id": str(site_id)}


def _resolve_site_id_from_url(site_url: str):
    """Parse domain from site_url and return site_id or None."""
    domain = (site_url or "").strip()
    if not domain:
        return None
    try:
        p = urlparse(domain if "://" in domain else f"https://{domain}")
        domain = p.hostname or domain
    except Exception:
        pass
    return domain


@api_router.get("/public/generated-articles")
async def api_public_generated_articles(
    site_url: str = Query("", alias="site_url"),
    limit: int = Query(100, ge=1, le=500),
    category: str | None = Query(None),
    tag: str | None = Query(None),
):
    """Resolve site by URL and return published generated_articles. Optional category/tag filter."""
    domain = _resolve_site_id_from_url(site_url)
    if not domain:
        return {"articles": [], "site_id": None}
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
            f"%{domain}%",
        )
        if not row:
            return {"articles": [], "site_id": None}
        site_id = row["id"]
        conditions = ["site_id = $1", "is_published = true"]
        params = [site_id]
        n = 2
        if category:
            conditions.append(f"category = ${n}")
            params.append(category)
            n += 1
        if tag:
            conditions.append(f"tags ? ${n}")
            params.append(tag)
            n += 1
        params.append(limit)
        sql = f"""
            SELECT id, title, slug, meta_title, meta_description, date_created, category, tags
            FROM generated_articles
            WHERE {" AND ".join(conditions)}
            ORDER BY date_created DESC NULLS LAST
            LIMIT ${n}
            """
        rows = await conn.fetch(sql, *params)
    return {"articles": [dict(r) for r in rows], "site_id": str(site_id)}


@api_router.get("/public/generated-articles/by-slug/{slug}")
async def api_public_generated_article_by_slug(
    slug: str,
    site_url: str = Query(..., alias="site_url"),
):
    """Fetch a single published generated_article by slug for the resolved site."""
    domain = _resolve_site_id_from_url(site_url)
    if not domain:
        raise HTTPException(404, "Site not found")
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, title, slug, content, html_content, meta_title, meta_description,
                   og_title, og_description, og_image, canonical_url, schema_json, date_created, category, tags
            FROM generated_articles
            WHERE site_id = (SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1)
              AND slug = $2 AND is_published = true
            """,
            f"%{domain}%",
            slug,
        )
        if not row:
            raise HTTPException(404, "Article not found")
    return dict(row)


@api_router.get("/public/search")
async def api_public_search(
    site_url: str = Query(..., alias="site_url"),
    q: str = Query(..., min_length=2),
    limit: int = Query(50, ge=1, le=100),
):
    """Search published generated_articles for the resolved site. No posts or content_matrix."""
    domain = _resolve_site_id_from_url(site_url)
    if not domain:
        return {"results": [], "site_id": None}
    pattern = f"%{q}%"
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
            f"%{domain}%",
        )
        if not row:
            return {"results": [], "site_id": None}
        site_id = row["id"]
        rows = await conn.fetch(
            """
            SELECT slug, title, meta_description
            FROM generated_articles
            WHERE site_id = $1 AND is_published = true
              AND (title ILIKE $2 OR content ILIKE $2 OR meta_description ILIKE $2)
            ORDER BY date_created DESC NULLS LAST
            LIMIT $3
            """,
            site_id,
            pattern,
            limit,
        )
    results = [
        {"type": "article", "slug": r["slug"], "title": r["title"], "meta_description": r["meta_description"], "url": f"/articles/{r['slug']}"}
        for r in rows
    ]
    return {"results": results, "site_id": str(site_id)}


@api_router.get("/public/kb-categories")
async def api_public_kb_categories(
    site_url: str = Query(..., alias="site_url"),
):
    """Return distinct categories from published generated_articles for KB filtering."""
    domain = _resolve_site_id_from_url(site_url)
    if not domain:
        return {"categories": []}
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
            f"%{domain}%",
        )
        if not row:
            return {"categories": []}
        site_id = row["id"]
        rows = await conn.fetch(
            """
            SELECT DISTINCT category FROM generated_articles
            WHERE site_id = $1 AND is_published = true AND category IS NOT NULL AND category != ''
            ORDER BY category
            """,
            site_id,
        )
    return {"categories": [r["category"] for r in rows]}


@api_router.get("/public/kb-tags")
async def api_public_kb_tags(
    site_url: str = Query(..., alias="site_url"),
):
    """Return distinct tags from published generated_articles (tags JSONB array)."""
    domain = _resolve_site_id_from_url(site_url)
    if not domain:
        return {"tags": []}
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
            f"%{domain}%",
        )
        if not row:
            return {"tags": []}
        site_id = row["id"]
        rows = await conn.fetch(
            """
            SELECT tags FROM generated_articles
            WHERE site_id = $1 AND is_published = true AND tags IS NOT NULL AND jsonb_array_length(tags) > 0
            """,
            site_id,
        )
    seen = set()
    for r in rows:
        tags = r["tags"]
        if isinstance(tags, list):
            for t in tags:
                if t and isinstance(t, str):
                    seen.add(t)
        elif isinstance(tags, str):
            seen.add(tags)
    return {"tags": sorted(seen)}


@api_router.post("/admin/cdn-purge")
async def api_cdn_purge(
    body: dict = Body(...),
    x_admin_key: str = Header(alias="X-Admin-Key", default=""),
):
    """Purge CDN cache for given URLs. Requires X-Admin-Key. Body: { domain, urls } or { domain, page_id }."""
    if not x_admin_key or x_admin_key != config.ADMIN_KEY:
        raise HTTPException(401, "Admin key required")
    domain = (body.get("domain") or "").strip()
    urls = body.get("urls") or []
    base_url = f"https://{domain}" if domain and "://" not in domain else (domain or "https://chrisamaya.work")
    if not urls:
        raise HTTPException(400, "urls required")
    try:
        async with get_db() as conn:
            row = await conn.fetchrow(
                "SELECT id, url, theme_config FROM sites WHERE status = 'active' AND url ILIKE $1 LIMIT 1",
                f"%{domain}%" if domain else "%chrisamaya%",
            )
            if not row:
                raise HTTPException(404, "Site not found")
            tc = row.get("theme_config") or {}
            if isinstance(tc, str):
                tc = json.loads(tc) if tc else {}
            provider = tc.get("cdn_provider", "none")
            cdn_config = tc.get("cdn_config") or {}
        if provider == "none":
            return {"purged": False, "message": "cdn_provider is none"}
        from app.cdn_purge import get_purge_provider
        purge_fn = get_purge_provider(provider)
        ok, msg = purge_fn(urls, base_url, cdn_config)
        return {"purged": ok, "message": msg}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@api_router.get("/posts")
async def api_posts(
    limit: int = Query(200, ge=1, le=500),
    site_id: str | None = Query(None, alias="site_id"),
):
    """List posts. Optional site_id filter."""
    limit = min(limit, 500)
    if not site_id:
        return await _list_table("posts", limit)
    async with get_db() as conn:
        rows = await conn.fetch(
            "SELECT * FROM posts WHERE site_id = $1::uuid ORDER BY published_at DESC NULLS LAST LIMIT $2",
            uuid.UUID(site_id),
            limit,
        )
        return [dict(r) for r in rows]


@api_router.get("/scheduled-tasks")
async def api_scheduled_tasks(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("scheduled_tasks", limit)


# --- Sites resolve (TTL 60s) ---
_resolve_cache: dict[str, tuple[dict, float]] = {}
RESOLVE_TTL = 60


@api_router.get("/sites/resolve")
async def api_sites_resolve(domain: str = Query("", alias="domain")):
    """Resolve domain to site. Returns site_id, status, theme_config. TTL 60s."""
    domain = (domain or "").strip().lower()
    if not domain:
        return {"found": False, "site_id": None, "status": None, "theme_config": None}
    now = time.time()
    if domain in _resolve_cache:
        cached, expiry = _resolve_cache[domain]
        if now < expiry:
            return cached
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, status, theme_config FROM sites
            WHERE status = 'active' AND url ILIKE $1
            LIMIT 1
            """,
            f"%{domain}%",
        )
    if not row:
        out = {"found": False, "site_id": None, "status": None, "theme_config": None}
    else:
        theme = row.get("theme_config")
        if isinstance(theme, dict):
            pass
        elif isinstance(theme, str):
            try:
                theme = json.loads(theme) if theme else None
            except Exception:
                theme = None
        out = {
            "found": True,
            "site_id": str(row["id"]),
            "status": row.get("status"),
            "theme_config": theme,
        }
    _resolve_cache[domain] = (out, now + RESOLVE_TTL)
    return out


@api_router.get("/sites")
async def api_sites(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("sites", limit)


@api_router.get("/spintax-dictionaries")
async def api_spintax_dictionaries(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("spintax_dictionaries", limit)


@api_router.get("/work-log")
async def api_work_log(limit: int = Query(200, ge=1, le=500)):
    return await _list_table("work_log", limit)


# --- CRUD: content-fragments ---
@api_router.post("/content-fragments")
async def api_content_fragments_create(body: dict = Body(...)):
    cid = body.get("campaign_id")
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO content_fragments (campaign_id, fragment_type, content_body, fragment_text, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            """,
            uuid.UUID(cid) if cid else None,
            body.get("fragment_type", "block"),
            body.get("content_body") or body.get("fragment_text") or "",
            body.get("fragment_text") or body.get("content_body") or "",
            body.get("status", "active"),
        )
        return dict(row)


@api_router.delete("/content-fragments/{pk}")
async def api_content_fragments_delete(pk: str):
    async with get_db() as conn:
        await conn.execute("DELETE FROM content_fragments WHERE id = $1", uuid.UUID(pk))
    return {"deleted": pk}


# --- CRUD: avatar-variants ---
@api_router.post("/avatar-variants")
async def api_avatar_variants_create(body: dict = Body(...)):
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO avatar_variants (avatar_key, variant_type, data)
            VALUES ($1, $2, $3)
            RETURNING *
            """,
            body.get("avatar_key"),
            body.get("variant_type", "default"),
            json.dumps(body.get("data", {})),
        )
        return dict(row)


@api_router.delete("/avatar-variants/{pk}")
async def api_avatar_variants_delete(pk: str):
    async with get_db() as conn:
        await conn.execute("DELETE FROM avatar_variants WHERE id = $1", uuid.UUID(pk))
    return {"deleted": pk}


# --- CRUD: cartesian-patterns ---
@api_router.post("/cartesian-patterns")
async def api_cartesian_patterns_create(body: dict = Body(...)):
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO cartesian_patterns (pattern_key, pattern_type, data)
            VALUES ($1, $2, $3)
            RETURNING *
            """,
            body.get("pattern_key"),
            body.get("pattern_type", "default"),
            json.dumps(body.get("data", {})),
        )
        return dict(row)


@api_router.delete("/cartesian-patterns/{pk}")
async def api_cartesian_patterns_delete(pk: str):
    async with get_db() as conn:
        await conn.execute("DELETE FROM cartesian_patterns WHERE id = $1", uuid.UUID(pk))
    return {"deleted": pk}


# --- CRUD: campaign-masters ---
@api_router.post("/campaign-masters")
async def api_campaign_masters_create(body: dict = Body(...)):
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO campaign_masters (site_id, name, status, headline_spintax_root, target_word_count)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            """,
            uuid.UUID(body["site_id"]) if body.get("site_id") else None,
            body.get("name", "New Campaign"),
            body.get("status", "active"),
            body.get("headline_spintax_root"),
            body.get("target_word_count", 1500),
        )
        return dict(row)


@api_router.delete("/campaign-masters/{pk}")
async def api_campaign_masters_delete(pk: str):
    async with get_db() as conn:
        await conn.execute("DELETE FROM campaign_masters WHERE id = $1", uuid.UUID(pk))
    return {"deleted": pk}


# --- CRUD: scheduled-tasks ---
@api_router.post("/scheduled-tasks")
async def api_scheduled_tasks_create(body: dict = Body(...)):
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO scheduled_tasks (site_id, campaign_id, task_type, scheduled_at, status, payload)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            """,
            uuid.UUID(body["site_id"]) if body.get("site_id") else None,
            uuid.UUID(body["campaign_id"]) if body.get("campaign_id") else None,
            body.get("task_type", "generation"),
            body.get("scheduled_at"),
            body.get("status", "pending"),
            json.dumps(body.get("payload", {})),
        )
        return dict(row)


@api_router.delete("/scheduled-tasks/{pk}")
async def api_scheduled_tasks_delete(pk: str):
    async with get_db() as conn:
        await conn.execute("DELETE FROM scheduled_tasks WHERE id = $1", uuid.UUID(pk))
    return {"deleted": pk}


# --- PATCH: generated-articles (station transitions) ---
@api_router.patch("/generated-articles/{pk}")
async def api_generated_articles_patch(pk: str, body: dict = Body(default=None)):
    updates = {k: v for k, v in (body or {}).items() if k in ("status", "title", "slug", "meta_title", "meta_description", "is_published")}
    if not updates:
        async with get_db() as conn:
            row = await conn.fetchrow("SELECT * FROM generated_articles WHERE id = $1", uuid.UUID(pk))
            if not row:
                raise HTTPException(404, "Article not found")
            return dict(row)
    async with get_db() as conn:
        cols = list(updates.keys())
        set_clause = ", ".join(f'"{c}" = ${i+1}' for i, c in enumerate(cols)) + ", date_updated = NOW()"
        values = [updates[c] for c in cols] + [uuid.UUID(pk)]
        await conn.execute(
            f'UPDATE generated_articles SET {set_clause} WHERE id = ${len(values)}',
            *values,
        )
        row = await conn.fetchrow("SELECT * FROM generated_articles WHERE id = $1", uuid.UUID(pk))
        if not row:
            raise HTTPException(404, "Article not found")
        return dict(row)


# --- POST: generation-jobs ---
@api_router.post("/generation-jobs")
async def api_generation_jobs_create(body: dict = Body(...)):
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO generation_jobs (site_id, campaign_id, target_quantity, status, source_type, source_article_ids)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            """,
            uuid.UUID(body["site_id"]) if body.get("site_id") else None,
            uuid.UUID(body["campaign_id"]) if body.get("campaign_id") else None,
            body.get("target_quantity", 10),
            body.get("status", "pending"),
            body.get("source_type", "new"),
            json.dumps(body.get("source_article_ids") or []),
        )
        return dict(row)


# --- Bulk delete ---
@api_router.post("/generated-articles/bulk-delete")
async def api_generated_articles_bulk_delete(body: dict = Body(default=None)):
    ids = (body or {}).get("ids", []) or []
    if not ids:
        return {"deleted": 0}
    uuids = [uuid.UUID(str(i)) for i in ids]
    async with get_db() as conn:
        for pk in uuids:
            await conn.execute("DELETE FROM generated_articles WHERE id = $1", pk)
    return {"deleted": len(uuids)}


@api_router.post("/run-schema")
async def api_run_schema(x_admin_key: str = Header(alias="X-Admin-Key", default=""), key: str = Query(default="")):
    """Apply schema.sql to the DB. Requires ADMIN_KEY in X-Admin-Key header or key query param."""
    admin_key = x_admin_key or key or ""
    if not admin_key or admin_key != config.ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Admin key required")
    try:
        await run_schema()
        return {"success": True, "message": "Schema applied"}
    except DatabaseUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/seed/chrisamaya")
async def api_seed_chrisamaya(
    x_admin_key: str = Header(alias="X-Admin-Key", default=""),
    key: str = Query(default=""),
):
    """Run chrisamaya seed (site, campaign, homepage, navigation, pSEO foundation). Requires ADMIN_KEY."""
    admin_key = x_admin_key or key or ""
    if not admin_key or admin_key != config.ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Admin key required")
    if not config.DATABASE_URL:
        raise HTTPException(status_code=503, detail="DATABASE_URL not set")
    # Ensure sites.theme_config exists (handles DBs created before schema had it)
    try:
        async with get_db() as conn:
            await conn.execute("ALTER TABLE sites ADD COLUMN IF NOT EXISTS theme_config JSONB")
    except Exception as e:
        pass  # Non-fatal; seed may still work
    script_dir = Path(__file__).resolve().parent.parent.parent / "scripts"
    script = script_dir / "seed_chrisamaya.py"
    if not script.exists():
        raise HTTPException(status_code=500, detail="seed_chrisamaya.py not found")
    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, str(script),
            cwd=str(script_dir.parent),
            env={**os.environ, "DATABASE_URL": config.DATABASE_URL},
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            err = (stderr or stdout or b"").decode(errors="replace").strip() or "Seed failed"
            raise HTTPException(status_code=500, detail=err)
        # Parse last line "Done. site_id = ..." if present for response
        out = (stdout or b"").decode(errors="replace").strip()
        site_id = None
        campaign_id = None
        if "site_id =" in out:
            for line in out.split("\n"):
                if "site_id =" in line:
                    site_id = line.split("site_id =")[-1].strip()
                    break
        async with get_db() as conn:
            row = await conn.fetchrow(
                "SELECT id FROM sites WHERE url ILIKE '%chrisamaya.work%' LIMIT 1"
            )
            if row:
                site_id = str(row["id"])
            row = await conn.fetchrow(
                "SELECT id FROM campaign_masters WHERE name = 'Unicorn Developer' LIMIT 1"
            )
            if row:
                campaign_id = str(row["id"])
        return {"success": True, "message": "Seed completed", "site_id": site_id, "campaign_id": campaign_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug", response_class=HTMLResponse)
async def admin_debug():
    """Debug panel: env info, api_logs, health. No auth."""
    data = await _get_debug_data()
    api_logs = data["api_logs"]

    rows_html = ""
    if api_logs and "error" not in api_logs[0]:
        rows_html = "".join(
            f'<tr><td>{r["id"]}</td><td>{r.get("endpoint","")}</td><td>{r.get("method","")}</td>'
            f'<td>{r.get("status","")}</td><td>{r.get("created_at","")}</td></tr>'
            for r in api_logs
        )
    else:
        rows_html = f'<tr><td colspan="5">{api_logs[0].get("error","No logs")}</td></tr>' if api_logs else '<tr><td colspan="5">No api_logs table</td></tr>'

    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html><head><title>Debug Panel</title><style>{_ADMIN_STYLE}</style></head>
    <body>
        <h1>Debug Panel</h1>
        <nav class="nav"><a href="/admin/">← Admin</a></nav>
        <h2>Config (safe)</h2>
        <pre>{json.dumps(data["config"], indent=2)}</pre>
        <h2>Health</h2>
        <p>{data["health"]}</p>
        <h2>Recent api_logs (last 50)</h2>
        <table><thead><tr><th>ID</th><th>Endpoint</th><th>Method</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>{rows_html}</tbody></table>
    </body></html>
    """)
