#!/usr/bin/env node
/**
 * Hit all God Mode admin pages and API endpoints. Reports status codes.
 * Usage: node scripts/endpoints-full.mjs [--api-only | --admin-only]
 */
const API = process.env.API_URL || 'https://api.jumpstartscaling.com';
const ROUTER = process.env.ROUTER_URL || 'https://factory.jumpstartscaling.com';

const ADMIN_PAGES = [
  '/jumpstart/admin/',
  '/jumpstart/admin/leads',
  '/jumpstart/admin/scaling-surveys',
  '/jumpstart/admin/status',
  '/jumpstart/admin/seed-wizard',
  '/jumpstart/admin/debug',
  '/jumpstart/admin/locations',
  '/jumpstart/admin/pseo-services',
  '/jumpstart/admin/content-matrix',
  '/jumpstart/admin/content-factory',
  '/jumpstart/admin/factory',
  '/jumpstart/admin/factory/articles',
  '/jumpstart/admin/intelligence',
  '/jumpstart/admin/intelligence/avatars',
  '/jumpstart/admin/intelligence/variants',
  '/jumpstart/admin/intelligence/geo',
  '/jumpstart/admin/intelligence/spintax',
  '/jumpstart/admin/intelligence/patterns',
  '/jumpstart/admin/collections',
  '/jumpstart/admin/collections/index',
  '/jumpstart/admin/collections/page-blocks',
  '/jumpstart/admin/collections/offer-blocks',
  '/jumpstart/admin/collections/headline-inventory',
  '/jumpstart/admin/collections/content-fragments',
  '/jumpstart/admin/seo/articles',
  '/jumpstart/admin/seo/campaigns',
  '/jumpstart/admin/seo/wizard',
  '/jumpstart/admin/seo/headlines',
  '/jumpstart/admin/seo/fragments',
  '/jumpstart/admin/assembler',
  '/jumpstart/admin/assembler/templates',
  '/jumpstart/admin/assembler/preview',
  '/jumpstart/admin/scheduler',
  '/jumpstart/admin/media',
  '/jumpstart/admin/media/templates',
  '/jumpstart/admin/pages',
  '/jumpstart/admin/posts',
  '/jumpstart/admin/content/avatars',
  '/jumpstart/admin/content/geo_clusters',
  '/jumpstart/admin/automations',
  '/jumpstart/admin/analytics',
  '/jumpstart/admin/analytics/events',
  '/jumpstart/admin/analytics/pageviews',
  '/jumpstart/admin/analytics/conversions',
  '/jumpstart/admin/sites',
  '/jumpstart/admin/sites/edit',
  '/jumpstart/admin/sites/import',
  '/jumpstart/admin/sites/jumpstart',
  '/jumpstart/admin/settings',
  '/jumpstart/admin/system',
  '/jumpstart/admin/system/work-log',
  '/jumpstart/admin/testing',
  '/jumpstart/admin/testing/connection',
  '/jumpstart/admin/testing/render',
  '/jumpstart/admin/testing/schema',
  '/jumpstart/admin/testing/results',
];

const API_ENDPOINTS = [
  '/health',
  '/api/health',
  '/api/counts',
  '/api/debug',
  '/api/sites/resolve?domain=chrisamaya.work',
  '/api/public/posts?site_url=https://chrisamaya.work',
  '/api/seed/chrisamaya',
  '/api/generation-jobs',
  '/api/locations',
  '/api/pseo-services',
  '/api/content-matrix?limit=100',
  '/api/sites',
  '/api/campaign-masters',
  '/api/leads',
  '/api/avatar-intelligence',
  '/api/avatar-variants',
  '/api/geo-intelligence',
  '/api/spintax-dictionaries',
  '/api/synonym-groups',
  '/api/content-fragments',
  '/api/headline-inventory',
  '/api/offer-blocks',
  '/api/page-blocks',
  '/api/analytics/summary',
];

async function check(url) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    return { url, status: r.status };
  } catch (e) {
    return { url, status: 'ERR', error: e.message };
  }
}

async function main() {
  const apiOnly = process.argv.includes('--api-only');
  const adminOnly = process.argv.includes('--admin-only');

  const ok = (s) => s >= 200 && s < 400;
  let passed = 0, failed = 0;

  if (!adminOnly) {
    console.log('\n>>> API endpoints', API, '\n');
    for (const p of API_ENDPOINTS) {
      const url = API + p;
      const r = await check(url);
      const s = r.status;
      const emoji = typeof s === 'number' && ok(s) ? '✅' : '❌';
      console.log(`  ${emoji} ${s}  ${p}`);
      if (typeof s === 'number' && ok(s)) passed++; else failed++;
    }
  }

  if (!apiOnly) {
    console.log('\n>>> Admin pages', ROUTER, '\n');
    for (const p of ADMIN_PAGES) {
      const url = ROUTER + p;
      const r = await check(url);
      const s = r.status;
      const emoji = typeof s === 'number' && ok(s) ? '✅' : '❌';
      console.log(`  ${emoji} ${s}  ${p}`);
      if (typeof s === 'number' && ok(s)) passed++; else failed++;
    }
  }

  console.log(`\n>>> ${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}
main();
