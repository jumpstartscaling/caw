#!/usr/bin/env node
/**
 * Run schema.sql against the god-mode DB via the API.
 * Usage: node scripts/run-schema-via-api.mjs
 * Requires: ADMIN_KEY and GOD_MODE_API_URL in .env.local or env
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    try {
      const env = readFileSync(resolve(ROOT, f), 'utf8');
      for (const line of env.split('\n')) {
        const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
      break;
    } catch (_) {}
  }
}

loadEnv();

const API_URL = process.env.GOD_MODE_API_URL || process.env.PUBLIC_GOD_MODE_API_URL || 'https://api.jumpstartscaling.com';
const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const GOD_MODE_API_APP = 'd8ws44sgkcs4wkog8gsokgok';

async function fetchAdminKeyFromCoolify() {
  const token = process.env.COOLIFY_TOKEN;
  if (!token) return null;
  const r = await fetch(`${COOLIFY_URL}/api/v1/applications/${GOD_MODE_API_APP}/envs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const data = await r.json().catch(() => null);
  const envs = Array.isArray(data) ? data : data?.data ?? [];
  const row = envs.find((e) => e.key === 'ADMIN_KEY');
  return row?.value ?? row?.real_value ?? null;
}

async function main() {
  let adminKey = process.env.ADMIN_KEY;
  if (!adminKey && process.env.COOLIFY_TOKEN) {
    adminKey = await fetchAdminKeyFromCoolify();
  }
  if (!adminKey) {
    console.error('Set ADMIN_KEY in .env.local or env (must match god-mode-api Coolify env)');
    console.error('Or set COOLIFY_TOKEN to fetch it from Coolify.');
    process.exit(1);
  }
  const url = `${API_URL.replace(/\/$/, '')}/api/run-schema`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'X-Admin-Key': adminKey },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('run-schema failed:', res.status, body?.detail ?? body);
    process.exit(1);
  }
  console.log('Schema applied:', body.message ?? body);
}

main();
