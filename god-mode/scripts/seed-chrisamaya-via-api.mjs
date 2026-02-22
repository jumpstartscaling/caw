#!/usr/bin/env node
/**
 * Seed chrisamaya.work tenant via God Mode API (no DB/SSH required).
 *
 * Usage:
 *   node scripts/seed-chrisamaya-via-api.mjs [--dry-run] [--launch]
 *
 * Requires: ADMIN_KEY in .env.local or env. API_URL defaults to https://api.jumpstartscaling.com
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const API_URL = process.env.API_URL || 'https://api.jumpstartscaling.com';
const adminKeyArg = process.argv.find((a) => a.startsWith('--admin-key='));
const ADMIN_KEY = process.env.ADMIN_KEY || (adminKeyArg ? adminKeyArg.split('=')[1] : null);

function getAdminKey() {
  if (ADMIN_KEY) return ADMIN_KEY;
  for (const f of ['.env.local', '.env']) {
    try {
      const env = readFileSync(resolve(ROOT, f), 'utf8');
      const m = env.match(/ADMIN_KEY[=\s]+([^\s\n#]+)/);
      if (m) return m[1].trim();
    } catch (_) {}
  }
  return null;
}

const dryRun = process.argv.includes('--dry-run');
const launch = process.argv.includes('--launch');
const qArg = process.argv.find((a) => a.startsWith('--quantity='));
const targetQuantity = qArg ? parseInt(qArg.split('=')[1], 10) : 2000;

async function main() {
  const key = getAdminKey();
  if (!key) {
    console.error('Set ADMIN_KEY in .env.local or env');
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Admin-Key': key,
  };

  if (dryRun) {
    console.log('[--dry-run] Would POST /api/seed/chrisamaya. Exiting.');
    return;
  }

  console.log('Seeding chrisamaya.work via', API_URL);
  const seedRes = await fetch(`${API_URL}/api/seed/chrisamaya`, {
    method: 'POST',
    headers,
  });

  const body = await seedRes.json().catch(() => ({}));
  if (!seedRes.ok) {
    console.error('Seed failed:', seedRes.status, body?.detail ?? body);
    process.exit(1);
  }

  console.log('\n✅', body.message ?? 'Seed complete');
  console.log('   site_id:', body.site_id);
  console.log('   campaign_id:', body.campaign_id);
  if (body.counts) {
    console.log('   counts:', JSON.stringify(body.counts));
  }

  if (launch) {
    console.log('\n>>> Launching campaign (target_quantity=' + targetQuantity + ')');
    const jobRes = await fetch(`${API_URL}/api/generation-jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        site_id: body.site_id,
        campaign_id: body.campaign_id,
        target_quantity: targetQuantity,
        dry_run: false,
      }),
    });
    if (jobRes.ok) {
      const job = await jobRes.json();
      console.log('✅ Generation job created:', job.id);
      console.log('   Check factory admin for progress.');
    } else {
      const errText = await jobRes.text();
      console.error('❌ Launch failed:', jobRes.status, errText);
    }
  } else {
    console.log('\nTo launch campaign: node scripts/launch-chrisamaya-campaign.mjs --quantity=2000');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
