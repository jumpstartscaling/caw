#!/usr/bin/env node
/**
 * Launch first chrisamaya.work factory campaign (target_quantity=2000).
 * Resolves site_id and campaign_id from API, then POSTs generation job.
 *
 * Usage:
 *   ADMIN_KEY=xxx API_URL=https://api.jumpstartscaling.com node scripts/launch-chrisamaya-campaign.mjs [--dry-run] [--quantity=2000]
 *
 * Requires: Run seed_chrisamaya_v4.py first. ADMIN_KEY in env. API may need POST /api/generation-jobs.
 * Fallback: Use launch_chrisamaya_campaign.py to insert directly into DB.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const API_URL = process.env.API_URL || 'https://api.jumpstartscaling.com';
const ADMIN_KEY = process.env.ADMIN_KEY;

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

  // 1. Resolve site + campaign
  const resolveRes = await fetch(`${API_URL}/api/sites/resolve?domain=chrisamaya.work`);
  if (!resolveRes.ok) {
    console.error('Failed to resolve site:', resolveRes.status, await resolveRes.text());
    process.exit(1);
  }
  const resolveData = await resolveRes.json();
  if (!resolveData.found || !resolveData.site_id) {
    console.error('chrisamaya.work site not found. Run seed_chrisamaya_v4.py first.');
    process.exit(1);
  }
  const siteId = resolveData.site_id;

  const sitesRes = await fetch(`${API_URL}/api/sites`, { headers });
  const sites = await sitesRes.json();
  const site = sites.find((s) => s.id === siteId || String(s.id) === siteId);
  if (!site) {
    console.error('Could not fetch site details');
    process.exit(1);
  }

  const campaignsRes = await fetch(`${API_URL}/api/campaign-masters`, { headers });
  const campaigns = await campaignsRes.json();
  const campaign = campaigns.find((c) => c.site_id === siteId || String(c.site_id) === siteId);
  if (!campaign) {
    console.error('No campaign for chrisamaya. Run seed_chrisamaya_v4.py first.');
    process.exit(1);
  }
  const campaignId = campaign.id;

  console.log('chrisamaya.work:');
  console.log('  site_id:', siteId);
  console.log('  campaign_id:', campaignId);
  console.log('  target_quantity:', targetQuantity);
  if (dryRun) {
    console.log('\n[--dry-run] Would POST /api/generation-jobs. Exiting.');
    return;
  }

  // 2. POST generation job (if API supports it)
  const createRes = await fetch(`${API_URL}/api/generation-jobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      site_id: siteId,
      campaign_id: campaignId,
      target_quantity: targetQuantity,
      dry_run: false,
    }),
  });

  if (createRes.ok) {
    const job = await createRes.json();
    console.log('\n✅ Generation job created:', job.id);
    console.log('   Check factory admin for progress.');
  } else {
    console.error('\n❌ API may not support POST /api/generation-jobs:', createRes.status, await createRes.text());
    console.log('\nFallback: Use Python to insert directly:');
    console.log('  cd python-api && python scripts/launch_chrisamaya_campaign.py');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
