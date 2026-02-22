#!/usr/bin/env node
/**
 * Create new JFactory and god-mode-api applications in Coolify.
 * Run after delete-factory-and-godmode.mjs. Discovers project/server from Coolify.
 *
 * Usage: node scripts/create-factory-and-godmode.mjs [--deploy]
 * Requires: COOLIFY_TOKEN in .env.local or env
 * Optional: COOLIFY_PROJECT_UUID, COOLIFY_SERVER_UUID (auto-discovered if not set)
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const GIT_REPO = process.env.GIT_REPO || 'https://github.com/caw-jump/spark';
const GIT_BRANCH = process.env.JFACTORY_BRANCH || 'main';

function getToken() {
  let token = process.env.COOLIFY_TOKEN || process.env.COOLIFY_API_TOKEN;
  if (!token) {
    for (const f of ['.env.local', '.env', '../.env.deploy', '../.env.production', 'docs/archive/TROUBLESHOOTING.md', '../docs/archive/TROUBLESHOOTING.md']) {
      try {
        const env = readFileSync(resolve(ROOT, f), 'utf8');
        const m = env.match(/(?:COOLIFY_TOKEN|COOLIFY_API_TOKEN)[=\s"']*["']?([^\s\n#"']+)["']?/);
        if (m) {
          token = m[1].trim();
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

async function discover() {
  const projects = await api('GET', '/projects');
  const list = Array.isArray(projects) ? projects : projects?.data ?? [];
  const project = list[0];
  if (!project) throw new Error('No project found. Create a project in Coolify first.');

  const servers = await api('GET', '/servers');
  const srvList = Array.isArray(servers) ? servers : servers?.data ?? [];
  const server = srvList[0];
  if (!server) throw new Error('No server found. Add a server in Coolify first.');

  const envs = await api('GET', `/projects/${project.uuid}/environments`);
  const envList = Array.isArray(envs) ? envs : envs?.data ?? [];
  const env = envList.find((e) => e.name === 'production') || envList[0];
  if (!env) throw new Error('No environment found.');

  return {
    project_uuid: project.uuid,
    server_uuid: server.uuid,
    environment_name: env.name,
    environment_uuid: env.uuid ?? env.id,
  };
}

async function main() {
  const deploy = process.argv.includes('--deploy');
  let adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    try {
      adminKey = execSync('openssl rand -hex 24', { encoding: 'utf8' }).trim();
    } catch (_) {
      adminKey = 'spark';
    }
  }

  console.log('>>> Discovering Coolify project/server...');
  const { project_uuid, server_uuid, environment_name } =
    process.env.COOLIFY_PROJECT_UUID && process.env.COOLIFY_SERVER_UUID
      ? {
          project_uuid: process.env.COOLIFY_PROJECT_UUID,
          server_uuid: process.env.COOLIFY_SERVER_UUID,
          environment_name: process.env.COOLIFY_ENV_NAME || 'production',
        }
      : await discover();
  console.log(`    Project: ${project_uuid}, Server: ${server_uuid}, Env: ${environment_name}\n`);

  // --- JFactory ---
  console.log('>>> Creating JFactory...');
  const jfBody = {
    project_uuid,
    server_uuid,
    environment_name,
    name: 'JFactory',
    description: 'Multi-tenant router + tenant template SSR',
    git_repository: GIT_REPO,
    git_branch: GIT_BRANCH,
    build_pack: 'dockerfile',
    dockerfile_location: 'Dockerfile',
    base_directory: '',
    ports_exposes: '8100',
    domains: 'https://factory.jumpstartscaling.com,https://www.factory.jumpstartscaling.com',
    health_check_enabled: true,
    health_check_path: '/health',
    health_check_port: '8100',
    is_force_https_enabled: true,
  };
  const jfUuid = await api('POST', '/applications/public', jfBody);
  const jfId = typeof jfUuid === 'object' ? jfUuid.uuid : jfUuid;
  console.log(`  ✅ JFactory created: ${jfId}`);

  await api('PATCH', `/applications/${jfId}/envs/bulk`, {
    data: [
      { key: 'GOD_MODE_API_URL', value: 'https://api.jumpstartscaling.com' },
      { key: 'SITES_BASE_PATH', value: '/app' },
      { key: 'ADMIN_KEY', value: adminKey },
      { key: 'PUBLIC_N8N_WEBHOOK', value: 'https://n8n.jumpstartscaling.com/webhook/d282e622-9c83-4936-9d93-05c37eaa7b68' },
    ],
  });
  console.log('  ✅ Env vars set');
  console.log(`     ADMIN_KEY=${adminKey}\n`);

  // --- god-mode-api ---
  console.log('>>> Creating god-mode-api...');
  const apiBody = {
    project_uuid,
    server_uuid,
    environment_name,
    name: 'god-mode-api',
    description: 'FastAPI backend (leads, pSEO, tenant API, seed)',
    git_repository: GIT_REPO,
    git_branch: GIT_BRANCH,
    build_pack: 'dockerfile',
    dockerfile_location: 'Dockerfile',
    base_directory: 'python-api',
    ports_exposes: '8200',
    domains: 'https://api.jumpstartscaling.com',
    health_check_enabled: true,
    health_check_path: '/health',
    health_check_port: '8200',
    is_force_https_enabled: true,
  };
  const apiUuid = await api('POST', '/applications/public', apiBody);
  const apiId = typeof apiUuid === 'object' ? apiUuid.uuid : apiUuid;
  console.log(`  ✅ god-mode-api created: ${apiId}`);

  await api('PATCH', `/applications/${apiId}/envs/bulk`, {
    data: [
      { key: 'ADMIN_KEY', value: adminKey },
      { key: 'LOG_REQUESTS', value: 'true' },
      { key: 'PORT', value: '8200' },
      { key: 'AUTO_SEED_CHRISAMAYA', value: 'true' },
    ],
  });
  console.log('  ✅ Env vars set');
  console.log('     Add DATABASE_URL in Coolify UI (god-mode-api → Environment)\n');

  console.log('>>> Done. Add DATABASE_URL to god-mode-api, then redeploy both.');

  if (deploy) {
    console.log('\n>>> Triggering deploy...');
    for (const [name, uuid] of [
      ['JFactory', jfId],
      ['god-mode-api', apiId],
    ]) {
      try {
        await api('POST', '/deploy', { uuid });
        console.log(`  ✅ ${name} deploy triggered`);
      } catch (e) {
        console.error(`  ❌ ${name}:`, e.message);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
