#!/usr/bin/env node
/**
 * Verify handshake: router health, API health, resolve, public posts.
 * Usage: node scripts/verify-handshake.mjs
 * Set ROUTER_URL (default http://localhost:8100), API_URL (default https://api.jumpstartscaling.com)
 */
const ROUTER_URL = process.env.ROUTER_URL || 'http://localhost:8100';
const API_URL = process.env.API_URL || 'https://api.jumpstartscaling.com';

async function check(name, url) {
  try {
    const r = await fetch(url);
    return r.ok ? { ok: true, status: r.status } : { ok: false, status: r.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  console.log('>>> Handshake verification\n');
  console.log('Router:', ROUTER_URL);
  console.log('API:', API_URL);

  const skipRouter = ROUTER_URL.includes('localhost') || ROUTER_URL.includes('127.0.0.1');
  const checks = [
    ...(skipRouter ? [] : [['Router /health', `${ROUTER_URL}/health`]]),
    ['API /health', `${API_URL}/health`],
    ['API /api/sites/resolve?domain=chrisamaya.work', `${API_URL}/api/sites/resolve?domain=chrisamaya.work`],
    ['API /api/tenant/page?domain=chrisamaya.work&slug=', `${API_URL}/api/tenant/page?domain=chrisamaya.work&slug=`],
    ['API /api/tenant/page?domain=chrisamaya.work&slug=services/custom-apps/python-api', `${API_URL}/api/tenant/page?domain=chrisamaya.work&slug=services/custom-apps/python-api`],
    ['API /api/public/generated-articles?site_url=chrisamaya.work', `${API_URL}/api/public/generated-articles?site_url=chrisamaya.work`],
    ['API /api/public/kb-categories?site_url=chrisamaya.work', `${API_URL}/api/public/kb-categories?site_url=chrisamaya.work`],
    ['API /api/public/search?site_url=chrisamaya.work&q=test', `${API_URL}/api/public/search?site_url=chrisamaya.work&q=test`],
  ];

  let failed = 0;
  for (const [name, url] of checks) {
    const r = await check(name, url);
    const status = r.ok ? `✅ ${r.status}` : `❌ ${r.status || r.error}`;
    console.log(`${name}: ${status}`);
    if (!r.ok) failed++;
  }
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
}
main();
