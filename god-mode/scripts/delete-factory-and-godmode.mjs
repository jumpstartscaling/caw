#!/usr/bin/env node
/**
 * Delete JFactory and god-mode-api applications in Coolify.
 * Usage: node scripts/delete-factory-and-godmode.mjs [--confirm]
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

async function api(method, path) {
  const token = getToken();
  if (!token) throw new Error('Set COOLIFY_TOKEN or COOLIFY_API_TOKEN in .env.local, .env, or env.');
  const r = await fetch(`${COOLIFY_URL}/api/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  const confirm = process.argv.includes('--confirm');
  if (!confirm) {
    console.log('>>> Delete JFactory and god-mode-api in Coolify');
    console.log('    Run with --confirm to proceed.');
    console.log('    node scripts/delete-factory-and-godmode.mjs --confirm');
    return;
  }

  for (const [name, uuid] of Object.entries(APPS)) {
    try {
      await api('DELETE', `/applications/${uuid}`);
      console.log(`  ✅ Deleted ${name} (${uuid})`);
    } catch (e) {
      if (e.message.includes('404')) {
        console.log(`  ⏭️  ${name} not found (already deleted?)`);
      } else {
        console.error(`  ❌ ${name}:`, e.message);
      }
    }
  }
  console.log('\n>>> Done. Run scripts/create-factory-and-godmode.mjs to create new apps.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
