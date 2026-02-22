#!/usr/bin/env node
/**
 * Monitor Coolify deployment status for JFactory and god-mode-api.
 * Usage: node scripts/monitor-coolify-deploy.mjs [--watch]
 * --watch: poll every 15s until both apps report finished/failed
 * Requires: COOLIFY_TOKEN in .env.local or env
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const APPS = {
  JFactory: 'asws8oco480c8s8k8c408css',
  godModeApi: 'd8ws44sgkcs4wkog8gsokgok',
};

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

async function api(path) {
  const token = getToken();
  if (!token) throw new Error('Set COOLIFY_TOKEN in .env.local or env.');
  const r = await fetch(`${COOLIFY_URL}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`${r.status} ${path}: ${await r.text()}`);
  return r.json();
}

async function getLatestDeploy(uuid) {
  const deployments = await api(`/deployments/applications/${uuid}?take=3`);
  const list = Array.isArray(deployments) ? deployments : deployments.data || [];
  return list[0] || null;
}

function statusEmoji(status) {
  if (!status) return '❓';
  const s = String(status).toLowerCase();
  if (s.includes('finished') || s === 'success') return '✅';
  if (s.includes('failed') || s.includes('error')) return '❌';
  if (s.includes('in_progress') || s.includes('deploying')) return '🔄';
  return '⏳';
}

async function run() {
  console.log('>>> Coolify deployment status\n');

  for (const [name, uuid] of Object.entries(APPS)) {
    try {
      const d = await getLatestDeploy(uuid);
      const status = d?.status ?? d?.deployment_status ?? 'unknown';
      const emoji = statusEmoji(status);
      const commit = d?.commit ?? d?.commit_sha ?? '-';
      const updated = d?.updated_at ?? d?.created_at ?? '-';
      console.log(`${emoji} ${name} (${uuid}): ${status}`);
      console.log(`   Commit: ${commit}`);
      console.log(`   Updated: ${updated}`);
    } catch (e) {
      console.log(`❌ ${name}: ${e.message}`);
    }
    console.log('');
  }
}

async function watch() {
  console.log('>>> Watching deployments (Ctrl+C to stop)\n');
  const interval = 15000;

  while (true) {
    await run();
    const all = await Promise.all([
      getLatestDeploy(APPS.JFactory),
      getLatestDeploy(APPS.godModeApi),
    ]);
    const statuses = all.map((d) => {
      const s = d?.status ?? d?.deployment_status ?? '';
      return s.toLowerCase();
    });
    const bothDone = statuses.every(
      (s) => s.includes('finished') || s.includes('failed') || s.includes('success') || s.includes('error')
    );
    if (bothDone) {
      console.log('>>> Both deployments finished. Exiting.');
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
}

const doWatch = process.argv.includes('--watch');
(doWatch ? watch : run)().catch((e) => {
  console.error(e);
  process.exit(1);
});
