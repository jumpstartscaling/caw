#!/usr/bin/env node
/**
 * Zero-Latency Multi-Domain Router with Lead Capture.
 * When GOD_MODE_API_URL is set, proxies /api/* and /admin/* to FastAPI.
 * Otherwise falls back to direct Postgres (legacy).
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

console.log('[1/3] JFactory router initializing');
const { Pool } = require('pg');
const qs = require('querystring');
require('dotenv').config();

const PORT = process.env.PORT || 8100;
const ADMIN_KEY = process.env.ADMIN_KEY || 'spark';

// God Mode API (FastAPI) - when set, proxy API routes there
const GOD_MODE_API_URL = process.env.GOD_MODE_API_URL || '';

// Initialize Postgres Pool (used when GOD_MODE_API_URL not set, or for backward compat)
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('rds.amazonaws.com'))
        ? { rejectUnauthorized: false }
        : false
};
const pool = process.env.DATABASE_URL ? new Pool(poolConfig) : null;

const initDB = async () => {
    if (!pool) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leads (
                id SERIAL PRIMARY KEY,
                source TEXT,
                name TEXT,
                email TEXT,
                phone TEXT,
                website TEXT,
                revenue TEXT,
                budget TEXT,
                problem TEXT,
                form_type TEXT,
                data_json JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS scaling_survey_submissions (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                company TEXT,
                role TEXT,
                current_revenue TEXT,
                target_revenue TEXT,
                team_size TEXT,
                industry TEXT,
                challenges JSONB,
                marketing_spend TEXT,
                channels JSONB,
                biggest_goal TEXT,
                raw_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(() => {});

        // Harris matrix (pSEO) - aligned with schema.sql
        await pool.query(`
            CREATE TABLE IF NOT EXISTS locations (
                id SERIAL PRIMARY KEY,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                zip TEXT,
                neighborhood TEXT,
                slug TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(() => {});
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pseo_services (
                id SERIAL PRIMARY KEY,
                service_type TEXT NOT NULL,
                sub_niche TEXT,
                slug TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(() => {});
        await pool.query(`
            CREATE TABLE IF NOT EXISTS content_matrix (
                id SERIAL PRIMARY KEY,
                location_id INT REFERENCES locations(id),
                service_id INT REFERENCES pseo_services(id),
                slug TEXT UNIQUE,
                title TEXT,
                meta_description TEXT,
                content_json JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(() => {});

        console.log("[2/3] ✅ Postgres tables verified");
    } catch (err) {
        console.log("[2/3] ⚠️ Postgres skipped:", err.message);
    }
};
initDB();

// Domain Mapping - use SITES_BASE_PATH for Coolify (e.g. /app)
const SITES_BASE = process.env.SITES_BASE_PATH || '/app';
const DOMAIN_MAP = {
    'factory.jumpstartscaling.com': path.join(SITES_BASE, 'sites/jumpstartscaling/dist'),
    'www.factory.jumpstartscaling.com': path.join(SITES_BASE, 'sites/jumpstartscaling/dist'),
    'jumpstartscaling.com': path.join(SITES_BASE, 'sites/jumpstartscaling/dist'),
    'www.jumpstartscaling.com': path.join(SITES_BASE, 'sites/jumpstartscaling/dist'),
    // API-resolved tenants (chrisamaya.work, etc.): proxied to tenant SSR (8101)
    'localhost': path.join(SITES_BASE, 'sites/jumpstartscaling/dist')
};

// Path-based preview: /jumpstart = jumpstart dist, /chrisamaya = tenant SSR (8101)
const PATH_SITE_MAP = {
    '/jumpstart': path.join(SITES_BASE, 'sites/jumpstartscaling/dist'),
    '/chrisamaya': null, // proxy to SSR 8101
};

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const COMPRESSIBLE = new Set(['text/html', 'text/css', 'text/javascript', 'application/json', 'image/svg+xml']);

// Resolve cache for unknown domains (TTL 60s)
const RESOLVE_CACHE = new Map();
const RESOLVE_TTL_MS = 60_000;
const SSR_TENANT_PORT = process.env.SSR_TENANT_PORT || 8101;

function getSiteRoot(hostname, urlPath) {
    const domain = hostname.split(':')[0];
    const usePathBased = domain === 'factory.jumpstartscaling.com' || domain === 'www.factory.jumpstartscaling.com' || domain === 'localhost';
    if (usePathBased && urlPath) {
        for (const [prefix, root] of Object.entries(PATH_SITE_MAP)) {
            if (urlPath === prefix || urlPath === prefix + '/' || urlPath.startsWith(prefix + '/')) {
                return { root, stripPrefix: prefix };
            }
        }
    }
    const root = DOMAIN_MAP[domain] || DOMAIN_MAP['localhost'];
    // Tenant template uses Astro base '/chrisamaya' — assets at /chrisamaya/_astro/
    const isChrisamayaDomain = domain === 'chrisamaya.work' || domain === 'www.chrisamaya.work';
    const stripPrefix = isChrisamayaDomain && root.includes('tenant') ? '/chrisamaya' : null;
    return { root, stripPrefix };
}

function isKnownDomain(hostname) {
    const domain = hostname.split(':')[0];
    if (DOMAIN_MAP[domain]) return true;
    if (domain === 'factory.jumpstartscaling.com' || domain === 'www.factory.jumpstartscaling.com' || domain === 'localhost') return true;
    return false;
}

async function resolveDomain(domain) {
    const base = GOD_MODE_API_URL.replace(/\/$/, '');
    const url = `${base}/api/sites/resolve?domain=${encodeURIComponent(domain)}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.found ? { site_id: data.site_id, theme_config: data.theme_config || null } : null;
}

function proxyToSSR(req, res, tenant, hostname, pathOverride = null) {
    const reqPath = pathOverride !== null ? pathOverride : ((req.url || '/').split('?')[0] + (req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
    const opts = {
        hostname: '127.0.0.1',
        port: SSR_TENANT_PORT,
        path: reqPath,
        method: req.method,
        headers: {
            ...req.headers,
            host: req.headers.host || hostname,
            'x-tenant-site-id': tenant.site_id,
            'x-tenant-domain': hostname,
            'x-tenant-theme-config': tenant.theme_config ? Buffer.from(JSON.stringify(tenant.theme_config)).toString('base64') : '',
        },
    };
    delete opts.headers['host'];
    opts.headers['host'] = req.headers.host || hostname;

    const proxyReq = http.request(opts, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', (err) => {
        console.error('SSR proxy error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Tenant server unavailable', detail: err.message }));
    });
    req.pipe(proxyReq);
}

async function resolveAndProxy(domain, req, res, urlPath, hostname) {
    try {
        let tenant = RESOLVE_CACHE.get(domain);
        if (!tenant || Date.now() > (tenant.expiry || 0)) {
            tenant = await resolveDomain(domain);
            if (tenant) {
                RESOLVE_CACHE.set(domain, { ...tenant, expiry: Date.now() + RESOLVE_TTL_MS });
            }
        } else {
            tenant = { site_id: tenant.site_id, theme_config: tenant.theme_config };
        }
        if (!tenant) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404</h1><p>Site not found.</p></body></html>');
            return;
        }
        proxyToSSR(req, res, tenant, hostname);
    } catch (err) {
        console.error('Resolve error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Could not resolve tenant', detail: err.message }));
    }
}

/* --- PROXY TO GOD MODE API (FastAPI) --- */
function proxyToGodMode(req, res, urlPath) {
    if (!GOD_MODE_API_URL) return false;
    const base = GOD_MODE_API_URL.replace(/\/$/, '');
    const targetUrl = new URL(urlPath || '/', base);
    const isHttps = targetUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const opts = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (isHttps ? 443 : 80),
        path: targetUrl.pathname + targetUrl.search,
        method: req.method,
        headers: { ...req.headers, host: targetUrl.host }
    };
    delete opts.headers['host'];
    opts.headers['host'] = targetUrl.host;

    const proxyReq = client.request(opts, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', (err) => {
        console.error('God Mode API proxy error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API unavailable', detail: err.message }));
    });
    req.pipe(proxyReq);
    return true;
}

/* --- API HANDLERS (fallback when no GOD_MODE_API_URL) --- */

function handleLeadSubmit(req, res) {
    if (!pool) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "DATABASE_URL not set. Use GOD_MODE_API_URL to proxy to FastAPI." }));
    }
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        let data;
        try {
            if (req.headers['content-type']?.includes('application/json')) {
                data = JSON.parse(body);
            } else {
                data = qs.parse(body);
            }

            const query = `
                INSERT INTO leads (source, name, email, phone, website, revenue, budget, problem, form_type, data_json) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;

            const values = [
                data.source || (req.headers.host.includes('chris') ? 'portfolio' : 'jumpstart'),
                data.name || '',
                data.email || '',
                data.phone || '',
                data.website || '',
                data.revenue || '',
                data.budget || '',
                data.problem || data.bottleneck || '',
                data.formType || 'unknown',
                JSON.stringify(data)
            ];

            await pool.query(query, values);

            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: true, message: "Lead captured to Postgres" }));

        } catch (e) {
            console.error("Lead submission error:", e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Failed to save lead to Postgres" }));
        }
    });
}

function handleScalingSurveySubmit(req, res) {
    if (!pool) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "DATABASE_URL not set. Use GOD_MODE_API_URL to proxy to FastAPI." }));
    }
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        let data;
        try {
            if (req.headers['content-type']?.includes('application/json')) {
                data = JSON.parse(body);
            } else {
                data = qs.parse(body); // Fallback, though we expect JSON
            }

            const query = `
                INSERT INTO scaling_survey_submissions 
                (name, email, company, role, current_revenue, target_revenue, team_size, industry, challenges, marketing_spend, channels, biggest_goal, raw_data)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `;

            const values = [
                data.name,
                data.email,
                data.company,
                data.role,
                data.currentRevenue ? Number(data.currentRevenue) : null,
                data.targetRevenue ? Number(data.targetRevenue) : null,
                data.teamSize ? parseInt(data.teamSize) : null,
                data.industry,
                JSON.stringify(data.challenges || []),
                data.marketingSpend ? Number(data.marketingSpend) : null,
                JSON.stringify(data.channels || []),
                data.biggestGoal,
                JSON.stringify(data)
            ];

            await pool.query(query, values);

            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: true, message: "Survey submitted successfully" }));

        } catch (e) {
            console.error("Survey submission error:", e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Failed to save survey to Postgres" }));
        }
    });
}

function handleAdminView(req, res, url) {
    if (!pool) {
        res.writeHead(503, { 'Content-Type': 'text/html' });
        return res.end('<h1>503</h1><p>DATABASE_URL not set. Use GOD_MODE_API_URL to proxy to FastAPI.</p>');
    }

    pool.query("SELECT * FROM leads ORDER BY created_at DESC", (err, result) => {
        if (err) {
            res.writeHead(500);
            res.end("Postgres Error: " + err.message);
            return;
        }

        const rows = result.rows;

        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Leads Dashboard</title>
            <style>
                body { font-family: sans-serif; background: #111; color: #eee; padding: 2rem; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #333; padding: 12px; text-align: left; }
                th { background: #222; color: #C9A961; }
                tr:nth-child(even) { background: #1a1a1a; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
                .js { background: #C9A961; color: #000; }
                .ca { background: #00FF94; color: #000; }
            </style>
        </head>
        <body>
            <h1>🚀 Leads Dashboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Source</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Details</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rows.forEach(row => {
            const badgeClass = row.source === 'ChrisAmaya' ? 'ca' : 'js';
            const details = row.data_json ? JSON.stringify(JSON.parse(row.data_json), null, 2) : '';
            html += `
                <tr>
                    <td>${row.id}</td>
                    <td><span class="badge ${badgeClass}">${row.source}</span></td>
                    <td>${row.name}</td>
                    <td><a href="mailto:${row.email}" style="color: #4da6ff">${row.email}</a></td>
                    <td>${row.phone}</td>
                    <td>
                        <!-- Core Fields -->
                        ${row.website ? `<div>🌐 ${row.website}</div>` : ''}
                        ${row.revenue ? `<div>💰 ${row.revenue}</div>` : ''}
                        ${row.problem ? `<div>⚠️ ${row.problem}</div>` : ''}
                        
                        <!-- JSON Data Extraction -->
                        ${(() => {
                    try {
                        const d = JSON.parse(row.data_json || '{}');
                        let extra = '';
                        if (d.industry) extra += `<div>🏭 ${d.industry}</div>`;
                        if (d.team) extra += `<div>👥 ${d.team}</div>`;

                        // Tracking Info
                        let tracking = [];
                        if (d.utm_source) tracking.push(`Src: ${d.utm_source}`);
                        if (d.utm_campaign) tracking.push(`Cmp: ${d.utm_campaign}`);
                        if (d.page_url) tracking.push(`Page: ${new URL(d.page_url).pathname}`);

                        if (tracking.length > 0) {
                            extra += `<div style="margin-top:8px; font-size:0.75rem; color:#888; border-top:1px solid #333; padding-top:4px;">
                                        ${tracking.join(' • ')}
                                    </div>`;
                        }
                        return extra;
                    } catch (e) { return ''; }
                })()}
                    </td>
                    <td>${new Date(row.created_at).toLocaleString()}</td>
                </tr>
            `;
        });

        html += `</tbody></table></body></html>`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
}


const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check for Docker/Coolify/Traefik - must return 200 when server is up
    const urlPath = (req.url || '/').split('?')[0];
    if (urlPath === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'jfactory-router' }));
        return;
    }

    // /api/health fallback when GOD_MODE_API_URL not set — admin pages fetch this
    if (urlPath === '/api/health' && !GOD_MODE_API_URL) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'router-ok', api: 'not-configured', service: 'jfactory-router' }));
        return;
    }

    // Capture API Routes
    const host = req.headers.host || 'localhost';
    const hostname = host.split(':')[0];

    const isFactory = hostname === 'factory.jumpstartscaling.com' || hostname === 'www.factory.jumpstartscaling.com';

    // factory.jumpstartscaling.com/ → redirect to /jumpstart/admin (path-based preview)
    if (isFactory && (urlPath === '/' || urlPath === '')) {
        const qs = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        res.writeHead(302, { Location: '/jumpstart/admin/' + qs });
        return res.end();
    }
    // factory /admin → redirect to /jumpstart/admin (legacy bookmark support)
    if (isFactory && (urlPath === '/admin' || urlPath.startsWith('/admin/'))) {
        const rest = urlPath === '/admin' ? '' : urlPath.slice(6);
        const qs = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        res.writeHead(302, { Location: '/jumpstart/admin' + rest + (qs ? '?' + qs.slice(1) : '') });
        return res.end();
    }

    if (urlPath.startsWith('/api/') && GOD_MODE_API_URL) {
        if (proxyToGodMode(req, res, req.url || '/')) return;
    } else if (urlPath.startsWith('/admin') && !isFactory && GOD_MODE_API_URL) {
        if (proxyToGodMode(req, res, req.url || '/')) return;
    } else if (urlPath.startsWith('/admin') && isFactory && !GOD_MODE_API_URL) {
            // Factory /admin/ requested but GOD_MODE_API_URL not set — show setup instructions
            res.writeHead(503, { 'Content-Type': 'text/html' });
            res.end(`<!DOCTYPE html><html><head><title>Admin unavailable</title></head><body style="font-family:sans-serif;background:#111;color:#eee;padding:2rem;max-width:600px">
<h1>Admin unavailable</h1>
<p>GOD_MODE_API_URL is not set. Add it in Coolify (JFactory environment variables):</p>
<ul>
<li><code>GOD_MODE_API_URL=https://api.jumpstartscaling.com</code></li>
</ul>
<p>Ensure <strong>god-mode-api</strong> is deployed at <code>api.jumpstartscaling.com</code> first.</p>
</body></html>`);
        return;
    }

    if (req.url === '/api/submit-lead' && req.method === 'POST') {
        return handleLeadSubmit(req, res);
    }

    if (req.url === '/api/submit-scaling-survey' && req.method === 'POST') {
        return handleScalingSurveySubmit(req, res);
    }

    // --- PATH-BASED /chrisamaya: proxy to SSR 8101 ---
    const domain = hostname.split(':')[0];
    const usePathBased = domain === 'factory.jumpstartscaling.com' || domain === 'www.factory.jumpstartscaling.com' || domain === 'localhost';
    if (usePathBased && (urlPath === '/chrisamaya' || urlPath === '/chrisamaya/' || urlPath.startsWith('/chrisamaya/'))) {
        // Pass full path so SSR receives /chrisamaya/_astro/* etc (Astro base is /chrisamaya)
        const fullPath = (urlPath.slice(10) || '/') + (req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
        const pathForSSR = '/chrisamaya' + (fullPath === '/' ? '' : fullPath);
        (async () => {
            let tenant = null;
            if (GOD_MODE_API_URL) {
                let t = RESOLVE_CACHE.get('chrisamaya.work');
                if (!t || Date.now() > (t.expiry || 0)) {
                    tenant = await resolveDomain('chrisamaya.work');
                    if (tenant) RESOLVE_CACHE.set('chrisamaya.work', { ...tenant, expiry: Date.now() + RESOLVE_TTL_MS });
                } else {
                    tenant = { site_id: t.site_id, theme_config: t.theme_config };
                }
            }
            if (tenant) {
                proxyToSSR(req, res, tenant, 'chrisamaya.work', pathForSSR);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404</h1><p>Chrisamaya tenant not resolved.</p></body></html>');
            }
        })().catch((err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Proxy failed', detail: String(err) }));
        });
        return;
    }

    // --- UNKNOWN DOMAIN: resolve via API and proxy to SSR tenant ---
    if (!isKnownDomain(hostname) && GOD_MODE_API_URL) {
        resolveAndProxy(domain, req, res, urlPath, hostname).catch((err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Resolve failed', detail: String(err) }));
        });
        return;
    }
    if (!isKnownDomain(hostname)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404</h1><p>Site not found.</p></body></html>');
        return;
    }

    // --- STATIC FILE SERVING ---
    const { root: siteRoot, stripPrefix } = getSiteRoot(hostname, urlPath);

    let pathForFile = urlPath;
    if (stripPrefix) {
        pathForFile = urlPath.slice(stripPrefix.length) || '/';
    }
    if (pathForFile !== '/' && pathForFile.endsWith('/')) pathForFile = pathForFile.slice(0, -1);

    let filePath;
    if (pathForFile === '/' || pathForFile === '') {
        filePath = path.join(siteRoot, 'index.html');
    } else {
        filePath = path.join(siteRoot, pathForFile);
        if (!path.extname(filePath)) {
            const htmlPath = filePath + '.html';
            if (fs.existsSync(htmlPath)) filePath = htmlPath;
            else {
                const indexPath = path.join(filePath, 'index.html');
                if (fs.existsSync(indexPath)) filePath = indexPath;
            }
        }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Aggressive caching for static assets (1 year for immutable _astro assets)
    let cacheControl = 'public, max-age=0, must-revalidate'; // Default: HTML (no cache)

    if (pathForFile.includes('/_astro/')) {
        // Astro assets are content-hashed, safe to cache forever
        cacheControl = 'public, max-age=31536000, immutable';
    } else if (['.woff', '.woff2'].includes(ext)) {
        cacheControl = 'public, max-age=31536000, immutable';
    } else if (['.css', '.js', '.png', '.jpg', '.svg', '.webp', '.ico'].includes(ext)) {
        cacheControl = 'public, max-age=604800';
    }

    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
            } else {
                const headers = { 'Content-Type': contentType, 'Cache-Control': cacheControl };
                const ae = req.headers['accept-encoding'] || '';
                if (COMPRESSIBLE.has(contentType) && ae.includes('gzip')) {
                    zlib.gzip(data, (e, compressed) => {
                        if (e) { res.writeHead(200, headers); res.end(data); return; }
                        headers['Content-Encoding'] = 'gzip';
                        headers['Vary'] = 'Accept-Encoding';
                        res.writeHead(200, headers);
                        res.end(compressed);
                    });
                } else {
                    res.writeHead(200, headers);
                    res.end(data);
                }
            }
        });
    } else {
        const notFoundPath = path.join(siteRoot, '404.html');
        if (fs.existsSync(notFoundPath)) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            fs.createReadStream(notFoundPath).pipe(res);
        } else {
            res.writeHead(404);
            res.end('404 Not Found');
        }
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[3/3] Router listening on port ${PORT}`);
});
