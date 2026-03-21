#!/usr/bin/env node
/**
 * Fix caw app DATABASE_URL for SSL cert verification.
 * Appends uselibpqcompat=true&sslmode=require per pg warning.
 * Run: node scripts/fix-caw-database-url-ssl.mjs [--deploy]
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const CAW_UUID = 'wcowowk4gc8o0kowc8wsocgk';

function getToken() {
  let token = process.env.COOLIFY_TOKEN || process.env.COOLIFY_API_TOKEN;
  if (!token) {
    for (const f of ['.env.local', '.env', '../.env.deploy']) {
      try {
        const env = readFileSync(resolve(ROOT, f), 'utf8');
        const m = env.match(/(?:COOLIFY_TOKEN|COOLIFY_API_TOKEN)[=\s"']*["']?([^\s\n#"']+)["']?/);
        if (m) {
          token = m[1].trim().replace(/^["']|["']$/g, '');
          break;
        }
      } catch (_) {}
    }
  }
  return token;
}

async function api(method, path, body = null) {
  const token = getToken();
  if (!token) throw new Error('Set COOLIFY_TOKEN in .env.local or env.');
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body && { 'Content-Type': 'application/json' }),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${COOLIFY_URL}/api/v1${path}`, opts);
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function appendSslParams(url) {
  const params = new URLSearchParams();
  if (url.includes('?')) {
    const [base, qs] = url.split('?');
    const existing = new URLSearchParams(qs);
    for (const [k, v] of existing) params.set(k, v);
    params.set('uselibpqcompat', 'true');
    params.set('sslmode', 'require');
    return `${base}?${params.toString()}`;
  }
  return `${url}?uselibpqcompat=true&sslmode=require`;
}

async function main() {
  const deploy = process.argv.includes('--deploy');
  console.log('>>> Fetching caw app envs...\n');

  const envs = await api('GET', `/applications/${CAW_UUID}/envs`);
  const list = Array.isArray(envs) ? envs : envs?.data ?? envs?.envs ?? [];
  const dbEntry = list.find((e) => (e.key ?? e.name) === 'DATABASE_URL');
  const currentUrl = (dbEntry?.real_value ?? dbEntry?.value ?? '').trim();

  if (!currentUrl) {
    console.error('DATABASE_URL not found in caw app envs.');
    process.exit(1);
  }

  const fixedUrl = appendSslParams(currentUrl);
  if (fixedUrl === currentUrl) {
    console.log('DATABASE_URL already has SSL params.');
  } else {
    console.log('Updating DATABASE_URL with uselibpqcompat=true&sslmode=require');
  }

  const updates = list
    .filter((e) => (e.key ?? e.name) !== 'DATABASE_URL')
    .map((e) => ({ key: e.key ?? e.name, value: e.real_value ?? e.value ?? '' }));
  updates.push({ key: 'DATABASE_URL', value: fixedUrl });

  await api('PATCH', `/applications/${CAW_UUID}/envs/bulk`, {
    data: updates,
  });
  console.log('✅ DATABASE_URL updated.\n');

  if (deploy) {
    console.log('>>> Triggering caw deploy...');
    await api('POST', '/deploy', { uuid: CAW_UUID });
    console.log('✅ Deploy triggered.\n');
  } else {
    console.log('Run with --deploy to trigger redeploy.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
