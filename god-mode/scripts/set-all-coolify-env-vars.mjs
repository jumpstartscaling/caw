#!/usr/bin/env node
/**
 * Set env vars for all Coolify apps (JFactory, god-mode-api, chrisamaya.work).
 * Run: COOLIFY_TOKEN=xxx node scripts/set-all-coolify-env-vars.mjs [--deploy]
 * Optional: DATABASE_URL=... to add to god-mode-api and chrisamaya.work
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const APPS = {
  JFactory: 'asws8oco480c8s8k8c408css',
  godModeApi: 'd8ws44sgkcs4wkog8gsokgok',
  caw: 'wcowowk4gc8o0kowc8wsocgk', // chrisamaya.work
};

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

async function fetchEnvFromApp(uuid, key) {
  try {
    const data = await api('GET', `/applications/${uuid}/envs`);
    const list = Array.isArray(data) ? data : data?.data ?? data?.envs ?? [];
    for (const e of list) {
      if ((e.key ?? e.name) === key) return (e.real_value ?? e.value ?? '').trim();
    }
  } catch (_) {}
  return null;
}

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.DATABASE_URL_PROD) return process.env.DATABASE_URL_PROD;
  try {
    const env = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
    const m = env.match(/DATABASE_URL[=\s]+(["']?)([^\s#'"]+)\1/);
    if (m && m[2] && !m[2].startsWith('postgresql://user:pass')) return m[2].trim();
  } catch (_) {}
  return null;
}

async function findChrisamayaUuid() {
  try {
    const apps = await api('GET', '/applications');
    const list = Array.isArray(apps) ? apps : apps?.data ?? [];
    const caw = list.find((a) => (a.name || '').toLowerCase().includes('chrisamaya'));
    return caw ? (caw.uuid ?? caw.id) : null;
  } catch {
    return null;
  }
}

async function main() {
  const deploy = process.argv.includes('--deploy');
  let databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    databaseUrl = await fetchEnvFromApp(APPS.godModeApi, 'DATABASE_URL');
    if (databaseUrl) console.log('>>> Using DATABASE_URL from god-mode-api env\n');
  }

  let adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    try {
      adminKey = execSync('openssl rand -hex 24', { encoding: 'utf8' }).trim();
    } catch {
      adminKey = 'spark';
    }
  }

  console.log('>>> Setting Coolify env vars for all apps...\n');

  // JFactory
  console.log('JFactory:');
  try {
    await api('PATCH', `/applications/${APPS.JFactory}/envs/bulk`, {
      data: [
        { key: 'GOD_MODE_API_URL', value: 'https://api.jumpstartscaling.com' },
        { key: 'SITES_BASE_PATH', value: '/app' },
        { key: 'ADMIN_KEY', value: adminKey },
        { key: 'PUBLIC_N8N_WEBHOOK', value: 'https://n8n.jumpstartscaling.com/webhook/d282e622-9c83-4936-9d93-05c37eaa7b68' },
      ],
    });
    console.log('  ✅ GOD_MODE_API_URL, SITES_BASE_PATH, ADMIN_KEY, PUBLIC_N8N_WEBHOOK');
  } catch (e) {
    console.error('  ❌', e.message);
  }

  // god-mode-api
  console.log('\ngod-mode-api:');
  try {
    const godEnv = [
      { key: 'ADMIN_KEY', value: adminKey },
      { key: 'LOG_REQUESTS', value: 'true' },
      { key: 'PORT', value: '8200' },
      { key: 'AUTO_SEED_CHRISAMAYA', value: 'true' },
    ];
    if (databaseUrl) godEnv.push({ key: 'DATABASE_URL', value: databaseUrl });
    await api('PATCH', `/applications/${APPS.godModeApi}/envs/bulk`, { data: godEnv });
    console.log('  ✅ ADMIN_KEY, LOG_REQUESTS, PORT, AUTO_SEED_CHRISAMAYA' + (databaseUrl ? ', DATABASE_URL' : ''));
    if (!databaseUrl) console.log('     (DATABASE_URL not set – add it via env or Coolify UI)');
  } catch (e) {
    console.error('  ❌', e.message);
  }

  // chrisamaya.work
  let cawUuid = await findChrisamayaUuid();
  if (!cawUuid && APPS.caw) cawUuid = APPS.caw;
  if (cawUuid) {
    console.log('\nchrisamaya.work:');
    try {
      const cawEnv = [
        { key: 'HOST', value: '0.0.0.0' },
        { key: 'PORT', value: '4321' },
      ];
      if (databaseUrl) cawEnv.push({ key: 'DATABASE_URL', value: databaseUrl });
      await api('PATCH', `/applications/${cawUuid}/envs/bulk`, { data: cawEnv });
      console.log('  ✅ HOST, PORT' + (databaseUrl ? ', DATABASE_URL' : ''));
      if (!databaseUrl) console.log('     (DATABASE_URL not set – chrisamaya.work will 404 without it)');
    } catch (e) {
      console.error('  ❌', e.message);
    }
  } else {
    console.log('\nchrisamaya.work: app not found (run create-chrisamaya-coolify-app.mjs first)');
  }

  console.log('\n>>> Done.');
  if (deploy) {
    console.log('\n>>> Triggering deploys...');
    for (const [name, uuid] of Object.entries(APPS)) {
      try {
        await api('POST', '/deploy', { uuid });
        console.log(`  ✅ ${name}`);
      } catch (e) {
        console.error(`  ❌ ${name}:`, e.message);
      }
    }
    if (cawUuid) {
      try {
        await api('POST', '/deploy', { uuid: cawUuid });
        console.log('  ✅ chrisamaya.work');
      } catch (e) {
        console.error('  ❌ chrisamaya.work:', e.message);
      }
    }
  } else {
    console.log('\nRedeploy apps in Coolify, or run with --deploy to trigger automatically.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
