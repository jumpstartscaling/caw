#!/usr/bin/env node
/**
 * Debug factory/admin 503 via Coolify API (no SSH needed).
 * Requires COOLIFY_TOKEN in .env.local or env.
 * Writes NDJSON to .cursor/debug-e58866.log
 */
import { readFileSync, appendFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOG_PATH = resolve(ROOT, '.cursor/debug-e58866.log');

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const APPS = { JFactory: 'asws8oco480c8s8k8c408css', godModeApi: 'd8ws44sgkcs4wkog8gsokgok' };

function log(entry) {
  appendFileSync(LOG_PATH, JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n', 'utf8');
}

async function main() {
  let token = process.env.COOLIFY_TOKEN;
  if (!token) {
    try {
      const env = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
      const m = env.match(/COOLIFY_TOKEN[=\s]+([^\s#]+)/);
      if (m) token = m[1].trim();
    } catch (_) {}
  }
  if (!token) {
    log({ hypothesisId: 'INIT', message: 'No COOLIFY_TOKEN', error: 'missing_token' });
    console.error('Set COOLIFY_TOKEN in .env.local or env. Get from Coolify → Keys & Tokens.');
    process.exit(1);
  }

  const auth = { Authorization: `Bearer ${token}` };

  for (const [label, uuid] of Object.entries(APPS)) {
    try {
      const r = await fetch(`${COOLIFY_URL}/api/v1/applications/${uuid}`, { headers: auth });
      const app = await r.json();
      log({ hypothesisId: 'H_APP', message: `${label} config`, data: { name: app.name, ports_exposes: app.ports_exposes, status: app.status, fqdn: app.fqdn } });
      console.log(`${label}: status=${app.status} port=${app.ports_exposes}`);
    } catch (e) {
      log({ hypothesisId: 'H_APP', message: `${label} error`, error: String(e.message) });
      console.error(`${label}: ${e.message}`);
    }
  }

  // Coolify logs API returns 400; need SSH for container logs

  const urls = ['https://factory.jumpstartscaling.com/health', 'https://factory.jumpstartscaling.com/admin/', 'https://api.jumpstartscaling.com/health'];
  for (const url of urls) {
    try {
      const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10000) });
      log({ hypothesisId: 'H_HTTP', message: 'Production fetch', data: { url, status: r.status } });
      console.log(`${url}: ${r.status}`);
    } catch (e) {
      log({ hypothesisId: 'H_HTTP', message: 'Fetch failed', data: { url, error: String(e.message) } });
      console.log(`${url}: error - ${e.message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
