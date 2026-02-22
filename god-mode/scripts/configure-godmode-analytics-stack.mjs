#!/usr/bin/env node
/**
 * Configure God Mode Analytics Stack (Metabase + Rudderstack) in Coolify via API.
 * Integrates with god-mode Postgres (same DB as API) and god-mode API.
 *
 * Usage: node scripts/configure-godmode-analytics-stack.mjs [--deploy]
 * Requires: COOLIFY_TOKEN in .env.local or env
 * Env vars (from .env.local or env): DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, GOD_MODE_API_INTERNAL_URL, RUDDER_WORKSPACE_TOKEN
 * --deploy: trigger redeploy after config
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
// Service stack UUID from Coolify (override with COOLIFY_SERVICE_UUID env; run --discover to list)
const SERVICE_UUID = process.env.COOLIFY_SERVICE_UUID || 'cgow4owswok80084sccsww00';

function getToken() {
  let token = process.env.COOLIFY_TOKEN;
  if (!token) {
    for (const f of ['.env.local', '.env']) {
      try {
        const env = readFileSync(resolve(ROOT, f), 'utf8');
        const m = env.match(/COOLIFY_TOKEN[=\s]+([^\s\n#]+)/);
        if (m) {
          token = m[1].trim();
          break;
        }
      } catch (_) {}
    }
  }
  return token;
}

function loadEnv(key, defaultValue = '') {
  let val = process.env[key];
  if (val != null) return cleanEnvVal(val);
  for (const f of ['.env.local', '.env']) {
    try {
      const env = readFileSync(resolve(ROOT, f), 'utf8');
      const m = env.match(new RegExp(`${key}[=\s]+([^\n#]*)`));
      if (m) return cleanEnvVal(m[1]);
    } catch (_) {}
  }
  return defaultValue;
}
function cleanEnvVal(s) {
  return String(s || '').replace(/\r/g, '').replace(/^["'\s]+|["'\s]+$/g, '').trim();
}

async function api(method, path, body = null) {
  const token = getToken();
  if (!token) {
    throw new Error('Set COOLIFY_TOKEN in .env.local or env. Coolify → Keys & Tokens.');
  }
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const base = '/api/v1';
  const r = await fetch(`${COOLIFY_URL}${base}${path}`, opts);
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  if (process.argv.includes('--discover')) {
    console.log('>>> Listing Coolify services (use uuid with COOLIFY_SERVICE_UUID)...\n');
    try {
      const services = await api('GET', '/services');
      const list = Array.isArray(services) ? services : services?.data ?? [];
      for (const s of list) {
        console.log(`  ${s.uuid || s.id}  ${s.name || s.description || '(no name)'}`);
      }
      if (list.length === 0) console.log('  (none found)');
    } catch (e) {
      console.error('  ❌', e.message);
    }
    return;
  }

  console.log('>>> Configuring God Mode Analytics Stack via Coolify API...\n');

  const dbHost = loadEnv('DB_HOST');
  const dbUser = loadEnv('DB_USER');
  const dbPassword = loadEnv('DB_PASSWORD');
  const dbName = loadEnv('DB_NAME') || loadEnv('DB_DATABASE', 'god_mode');
  const dbPort = loadEnv('DB_PORT', '5432');
  const godModeApiInternal = loadEnv(
    'GOD_MODE_API_INTERNAL_URL',
    'http://god-mode-api:8200'
  );
  const rudderToken = loadEnv('RUDDER_WORKSPACE_TOKEN');
  const rudderJobsDbPassword = loadEnv('RUDDER_JOBS_DB_PASSWORD', 'secure_rudder_password');
  const baseDomain = loadEnv('ANALYTICS_BASE_DOMAIN', 'jumpstartscaling.com');
  const metabaseSubdomain = loadEnv('METABASE_SUBDOMAIN', 'metabase');
  const rudderstackSubdomain = loadEnv('RUDDERSTACK_SUBDOMAIN', 'rudderstack');

  if (!dbHost || !dbUser || !dbPassword) {
    console.error(
      '❌ Set DB_HOST, DB_USER, DB_PASSWORD in .env.local (same as god-mode-api Postgres).'
    );
    console.error(
      '   For Coolify: DB_HOST = Postgres container name on coolify network (not localhost).'
    );
    console.error(
      '   Override: DB_HOST=postgres-container node scripts/configure-godmode-analytics-stack.mjs'
    );
    process.exit(1);
  }
  if (dbHost === 'localhost' || dbHost === '127.0.0.1') {
    console.warn(
      '⚠️ DB_HOST is localhost — analytics stack runs in Coolify and needs the Postgres container hostname.'
    );
    console.warn('   Set DB_HOST to your Postgres container name (e.g. postgres, godmode-db) and re-run.');
  }
  if (!rudderToken) {
    console.warn('⚠️ RUDDER_WORKSPACE_TOKEN not set. Rudderstack Server may not start correctly.');
  }

  const composePath = resolve(ROOT, 'docker/analytics-stack.compose.yml');
  let dockerComposeRaw;
  try {
    dockerComposeRaw = readFileSync(composePath, 'utf8');
  } catch (e) {
    throw new Error(`Could not read compose: ${composePath}`);
  }

  const metabaseUrl = `https://${metabaseSubdomain}.${baseDomain}`;
  const rudderstackUrl = `https://${rudderstackSubdomain}.${baseDomain}`;

  // 1. Update service with compose, domains, and connect to coolify network
  console.log('Updating service stack...');
  const composeBase64 = Buffer.from(dockerComposeRaw, 'utf8').toString('base64');
  let envPath;
  try {
    await api('PATCH', `/services/${SERVICE_UUID}`, {
      docker_compose_raw: composeBase64,
      connect_to_docker_network: true,
      urls: [
        { name: 'metabase', url: metabaseUrl },
        { name: 'rudderstack-server', url: rudderstackUrl },
      ],
    });
    envPath = `/services/${SERVICE_UUID}/envs/bulk`;
    console.log('  ✅ Compose file, network, and domains updated (service)');
  } catch (e) {
    if (e.message.includes('404')) {
      try {
        await api('PATCH', `/applications/${SERVICE_UUID}`, {
          docker_compose_raw: dockerComposeRaw,
          connect_to_docker_network: true,
        });
        envPath = `/applications/${SERVICE_UUID}/envs/bulk`;
        console.log('  ✅ Compose file and network settings updated (application)');
      } catch (e2) {
        console.error('  ❌ Service/Application not found. Try COOLIFY_SERVICE_UUID=<uuid>');
        throw e;
      }
    } else {
      throw e;
    }
  }

  // 2. Set environment variables (shared with god-mode Postgres + god-mode API)
  console.log('\nSetting environment variables...');
  const envs = [
    { key: 'DB_HOST', value: dbHost },
    { key: 'DB_USER', value: dbUser },
    { key: 'DB_PASSWORD', value: dbPassword },
    { key: 'DB_NAME', value: dbName },
    { key: 'DB_PORT', value: dbPort },
    { key: 'GOD_MODE_API_INTERNAL_URL', value: godModeApiInternal },
    { key: 'RUDDER_JOBS_DB_PASSWORD', value: rudderJobsDbPassword },
    { key: 'MB_SITE_URL', value: metabaseUrl },
  ];
  if (rudderToken) {
    envs.push({ key: 'RUDDER_WORKSPACE_TOKEN', value: rudderToken });
  }
  try {
    await api('PATCH', envPath, { data: envs });
    console.log('  ✅ DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, GOD_MODE_API_INTERNAL_URL, RUDDER_*, MB_SITE_URL');
    console.log(`     Metabase → ${metabaseUrl} (god-mode Postgres: ${dbHost}:${dbPort}/${dbName})`);
    console.log(`     Rudderstack → ${rudderstackUrl} (god-mode API: ${godModeApiInternal})`);
  } catch (e) {
    console.error('  ❌', e.message);
    throw e;
  }

  console.log('\n>>> Done.');

  if (process.argv.includes('--deploy')) {
    console.log('\n>>> Triggering deploy...');
    try {
      await api('POST', '/deploy', { uuid: SERVICE_UUID });
      console.log('  ✅ Deploy triggered');
    } catch (e) {
      console.error('  ❌', e.message);
    }
  } else {
    console.log('   Run with --deploy to trigger redeploy.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
