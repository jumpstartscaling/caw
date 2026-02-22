#!/usr/bin/env node
/**
 * Fetch ADMIN_KEY from Coolify, then seed chrisamaya via API.
 * No SSH or direct DB needed. Uses COOLIFY_TOKEN to read god-mode-api env.
 *
 * Usage: node scripts/seed-via-coolify.mjs [--launch] [--quantity=2000]
 * Requires: COOLIFY_TOKEN in .env.local (Coolify → Keys & Tokens → API tokens)
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://86.48.23.38:8000';
const GOD_MODE_API_UUID = 'd8ws44sgkcs4wkog8gsokgok';
const API_URL = process.env.API_URL || 'https://api.jumpstartscaling.com';

function getCoolifyToken() {
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
  return token?.replace(/^["']|["']$/g, '');
}

async function fetchAdminKey() {
  const token = getCoolifyToken();
  if (!token) {
    throw new Error('Set COOLIFY_TOKEN in .env.local. Get from Coolify → Keys & Tokens → API tokens.');
  }
  const paths = [
    `/applications/${GOD_MODE_API_UUID}/envs`,
    `/services/${GOD_MODE_API_UUID}/envs`,
  ];
  for (const path of paths) {
    const r = await fetch(`${COOLIFY_URL}/api/v1${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) continue;
    const data = await r.json().catch(() => null);
    const list = Array.isArray(data) ? data : data?.data ?? data?.envs ?? [];
    for (const e of list) {
      if ((e.key || e.name) === 'ADMIN_KEY') {
        return (e.real_value ?? e.value ?? '').trim();
      }
    }
  }
  throw new Error('ADMIN_KEY not found in god-mode-api env. Check Coolify → god-mode-api → Environment.');
}

async function runSeed(adminKey, launch = false, quantity = 2000) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Admin-Key': adminKey,
  };
  console.log('Seeding chrisamaya.work via', API_URL);
  const seedRes = await fetch(`${API_URL}/api/seed/chrisamaya`, {
    method: 'POST',
    headers,
  });
  const body = await seedRes.json().catch(() => ({}));
  if (!seedRes.ok) {
    throw new Error(`Seed failed: ${seedRes.status} ${body?.detail ?? JSON.stringify(body)}`);
  }
  console.log('\n✅', body.message ?? 'Seed complete');
  console.log('   site_id:', body.site_id);
  console.log('   campaign_id:', body.campaign_id);
  if (body.counts) console.log('   counts:', JSON.stringify(body.counts));

  if (launch) {
    console.log('\n>>> Launching campaign (target_quantity=' + quantity + ')');
    const jobRes = await fetch(`${API_URL}/api/generation-jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        site_id: body.site_id,
        campaign_id: body.campaign_id,
        target_quantity: quantity,
        dry_run: false,
      }),
    });
    if (jobRes.ok) {
      const job = await jobRes.json();
      console.log('✅ Generation job created:', job.id);
    } else {
      console.error('❌ Launch failed:', jobRes.status, await jobRes.text());
    }
  } else {
    console.log('\nTo launch: node scripts/seed-via-coolify.mjs --launch --quantity=2000');
  }
}

async function main() {
  const launch = process.argv.includes('--launch');
  const qArg = process.argv.find((a) => a.startsWith('--quantity='));
  const quantity = qArg ? parseInt(qArg.split('=')[1], 10) : 2000;

  console.log('>>> Fetching ADMIN_KEY from Coolify...');
  const adminKey = await fetchAdminKey();
  console.log('    Got ADMIN_KEY (length', adminKey.length, ')');

  await runSeed(adminKey, launch, quantity);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
