#!/usr/bin/env node
/**
 * Create chrisamaya.work app in Coolify (caw-jump/caw standalone shell).
 * Same project/server as JFactory and god-mode-api. Copies DATABASE_URL from god-mode-api.
 *
 * Usage: node scripts/create-chrisamaya-coolify-app.mjs [--deploy]
 * Requires: COOLIFY_TOKEN in .env.local or env
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const GOD_MODE_API_UUID = 'd8ws44sgkcs4wkog8gsokgok';
const CAW_GIT_REPO = 'https://github.com/caw-jump/caw';
const CAW_GIT_BRANCH = process.env.CAW_BRANCH || 'main';

function getToken() {
  let token = process.env.COOLIFY_TOKEN || process.env.COOLIFY_API_TOKEN;
  if (!token) {
    for (const f of ['.env.local', '.env', '../.env.deploy', '../.env.production', 'docs/archive/TROUBLESHOOTING.md', '../docs/archive/TROUBLESHOOTING.md']) {
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
  if (!token) throw new Error('Set COOLIFY_TOKEN or COOLIFY_API_TOKEN in .env.local, .env, or env.');
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
  const paths = [`/applications/${uuid}/envs`, `/services/${uuid}/envs`];
  for (const p of paths) {
    const data = await api('GET', p).catch(() => null);
    if (!data) continue;
    const list = Array.isArray(data) ? data : data?.data ?? data?.envs ?? [];
    for (const e of list) {
      const k = e.key ?? e.name;
      if (k === key) return (e.real_value ?? e.value ?? '').trim();
    }
  }
  return null;
}

async function discover() {
  const projects = await api('GET', '/projects');
  const list = Array.isArray(projects) ? projects : projects?.data ?? [];
  const project = list[0];
  if (!project) throw new Error('No project found.');

  const servers = await api('GET', '/servers');
  const srvList = Array.isArray(servers) ? servers : servers?.data ?? [];
  const server = srvList[0];
  if (!server) throw new Error('No server found.');

  const envs = await api('GET', `/projects/${project.uuid}/environments`);
  const envList = Array.isArray(envs) ? envs : envs?.data ?? [];
  const env = envList.find((e) => e.name === 'production') || envList[0];
  if (!env) throw new Error('No environment found.');

  return {
    project_uuid: project.uuid,
    server_uuid: server.uuid,
    environment_name: env.name,
  };
}

async function main() {
  const deploy = process.argv.includes('--deploy');

  console.log('>>> Discovering Coolify project/server...');
  const { project_uuid, server_uuid, environment_name } =
    process.env.COOLIFY_PROJECT_UUID && process.env.COOLIFY_SERVER_UUID
      ? {
          project_uuid: process.env.COOLIFY_PROJECT_UUID,
          server_uuid: process.env.COOLIFY_SERVER_UUID,
          environment_name: process.env.COOLIFY_ENV_NAME || 'production',
        }
      : await discover();
  console.log(`    Project: ${project_uuid}, Server: ${server_uuid}\n`);

  console.log('>>> Fetching DATABASE_URL from god-mode-api...');
  const databaseUrl = await fetchEnvFromApp(GOD_MODE_API_UUID, 'DATABASE_URL');
  if (!databaseUrl) {
    console.warn('    ⚠ DATABASE_URL not found in god-mode-api. Add it manually in Coolify after creation.');
  } else {
    console.log('    ✅ Got DATABASE_URL\n');
  }

  console.log('>>> Creating chrisamaya.work (caw) app...');
  const body = {
    project_uuid,
    server_uuid,
    environment_name,
    name: 'chrisamaya.work',
    description: 'Standalone Astro shell, direct Postgres, no factory',
    git_repository: CAW_GIT_REPO,
    git_branch: CAW_GIT_BRANCH,
    build_pack: 'dockerfile',
    dockerfile_location: 'Dockerfile',
    base_directory: '',
    ports_exposes: '4321',
    domains: 'https://chrisamaya.work,https://www.chrisamaya.work',
    health_check_enabled: false,
    is_force_https_enabled: true,
  };
  const result = await api('POST', '/applications/public', body);
  const appId = typeof result === 'object' ? (result.uuid ?? result.id) : result;
  console.log(`  ✅ Created: ${appId}`);

  const envData = [
    { key: 'HOST', value: '0.0.0.0' },
    { key: 'PORT', value: '4321' },
  ];
  if (databaseUrl) envData.push({ key: 'DATABASE_URL', value: databaseUrl });

  await api('PATCH', `/applications/${appId}/envs/bulk`, { data: envData });
  console.log('  ✅ Env vars: HOST, PORT' + (databaseUrl ? ', DATABASE_URL' : ''));
  if (!databaseUrl) console.log('     Add DATABASE_URL manually in Coolify.\n');

  console.log('\n>>> chrisamaya.work app created in same project as god-mode.');

  if (deploy) {
    console.log('\n>>> Triggering deploy...');
    try {
      await api('POST', '/deploy', { uuid: appId });
      console.log('  ✅ Deploy triggered');
    } catch (e) {
      console.error('  ❌', e.message);
    }
  } else {
    console.log('\nTo deploy: node scripts/create-chrisamaya-coolify-app.mjs --deploy');
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
