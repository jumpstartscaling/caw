#!/usr/bin/env node
/**
 * Plant the seed and make it live.
 * 1. Seed chrisamaya via API (requires ADMIN_KEY)
 * 2. Git add, commit, push
 * 3. Trigger Coolify deploy (requires COOLIFY_TOKEN)
 *
 * Usage: node scripts/seed-and-deploy.mjs [--no-seed] [--no-deploy] [--dry-run]
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const env = {};
  for (const f of ['.env.local', '.env']) {
    try {
      const content = readFileSync(resolve(ROOT, f), 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          let val = trimmed.slice(eq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
      break;
    } catch (_) {}
  }
  return env;
}

const dryRun = process.argv.includes('--dry-run');
const noSeed = process.argv.includes('--no-seed');
const noDeploy = process.argv.includes('--no-deploy');

async function main() {
  const env = loadEnv();
  const API_URL = process.env.API_URL || env.API_URL || 'https://api.jumpstartscaling.com';
  const ADMIN_KEY = process.env.ADMIN_KEY || env.ADMIN_KEY;
  const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN || env.COOLIFY_TOKEN;

  console.log('>>> Seed and Deploy\n');

  if (!noSeed && ADMIN_KEY) {
    console.log('1. Seeding chrisamaya via API...');
    if (dryRun) {
      console.log('   [--dry-run] Would POST /api/seed/chrisamaya\n');
    } else {
      try {
        const r = await fetch(`${API_URL}/api/seed/chrisamaya`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
        });
        const data = await r.json();
        if (r.ok) {
          console.log('   ✅', data.message || 'Seeded');
          console.log('   ', JSON.stringify(data.counts || data));
        } else {
          console.log('   ❌', r.status, data.detail || data);
        }
      } catch (e) {
        console.log('   ❌', e.message);
      }
      console.log('');
    }
  } else if (!noSeed && !ADMIN_KEY) {
    console.log('1. Skip seed (ADMIN_KEY not in .env.local). Run manually:');
    console.log('   node scripts/seed-chrisamaya-via-api.mjs\n');
  }

  if (!noDeploy) {
    console.log('2. Git push and deploy...');
    if (dryRun) {
      console.log('   [--dry-run] Would: git add, commit, push; node configure-coolify-via-api.mjs --deploy\n');
    } else {
      try {
        execSync('git add -A && git status --short', { cwd: ROOT, stdio: 'inherit' });
        execSync('git commit -m "chrisamaya: DB-driven template, offer pages, KB, cache"', { cwd: ROOT, stdio: 'inherit' });
        execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
        console.log('   ✅ Pushed\n');
        if (COOLIFY_TOKEN) {
          console.log('3. Triggering Coolify deploy...');
          execSync('node scripts/configure-coolify-via-api.mjs --deploy', { cwd: ROOT, stdio: 'inherit' });
        } else {
          console.log('3. Skip Coolify (COOLIFY_TOKEN not set). Deploy manually if needed.');
        }
      } catch (e) {
        console.log('   ❌', e.message);
      }
    }
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
