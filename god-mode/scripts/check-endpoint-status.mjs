#!/usr/bin/env node
/**
 * Check which API endpoints return 404 vs OK.
 * Fetches OpenAPI schema from API, then probes each path.
 * Usage: node scripts/check-endpoint-status.mjs [BASE_URL]
 * Default BASE_URL: https://api.jumpstartscaling.com
 */
const BASE = process.argv[2] || process.env.API_BASE_URL || 'https://api.jumpstartscaling.com';

async function fetchJson(url) {
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

// Replace path params like {slug} with placeholder values
function resolvePath(path, params = {}) {
  let p = path;
  for (const [key, val] of Object.entries(params)) {
    p = p.replace(`{${key}}`, encodeURIComponent(val));
  }
  // Fallback: replace any remaining {param} with a safe value
  p = p.replace(/\{[^}]+\}/g, (m) => {
    const k = m.slice(1, -1);
    return params[k] ?? (k === 'slug' ? 'test-slug' : k === 'pk' ? '00000000-0000-0000-0000-000000000000' : k === 'cm_id' || k === 'loc_id' || k === 'svc_id' ? '1' : 'x'));
  });
  return p;
}

async function probe(method, path, pathParams = {}) {
  try {
    const resolved = resolvePath(path, pathParams);
    const url = resolved.startsWith('http') ? resolved : `${BASE}${resolved}`;
    const opts = { method };
    if (method === 'POST' || method === 'PATCH') {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify({});
    }
    const r = await fetch(url, opts);
    return r.status;
  } catch (e) {
    return 'ERR';
  }
}

async function main() {
  console.log(`\n>>> Endpoint Status Check: ${BASE}\n`);

  const schema = await fetchJson(`${BASE}/openapi.json`);
  if (!schema || !schema.paths) {
    console.error('Could not fetch OpenAPI schema. Is the API running?');
    process.exit(1);
  }

  const results = { ok: [], notFound: [], error: [], other: [] };
  const paths = Object.entries(schema.paths);

  for (const [path, methods] of paths) {
    for (const [method, spec] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) continue;
      const params = (spec.parameters || []).filter((p) => p.in === 'path').reduce((a, p) => {
        a[p.name] = p.name === 'slug' ? 'austin-tx-plumbing' : p.name === 'pk' ? '00000000-0000-0000-0000-000000000000' : p.name.includes('id') ? '1' : 'x';
        return a;
      }, {});

      const m = method.toUpperCase();
      const status = await probe(m, path, params);

      if (status >= 200 && status < 400) {
        results.ok.push({ method: m, path, status });
      } else if (status === 404) {
        results.notFound.push({ method: m, path });
      } else if (status === 'ERR') {
        results.error.push({ method: m, path });
      } else {
        results.other.push({ method: m, path, status });
      }
    }
  }

  console.log('✅ OK (2xx/3xx):');
  results.ok.forEach(({ method, path, status }) => console.log(`   ${status} ${method.padEnd(6)} ${path}`));

  if (results.notFound.length) {
    console.log('\n❌ 404 Not Found:');
    results.notFound.forEach(({ method, path }) => console.log(`   404 ${method.padEnd(6)} ${path}`));
  }

  if (results.other.length) {
    console.log('\n⚠️  Other (4xx/5xx):');
    results.other.forEach(({ method, path, status }) => console.log(`   ${status} ${method.padEnd(6)} ${path}`));
  }

  if (results.error.length) {
    console.log('\n🔌 Network/Connection errors:');
    results.error.forEach(({ method, path }) => console.log(`   ERR  ${method.padEnd(6)} ${path}`));
  }

  console.log(`\nSummary: ${results.ok.length} OK, ${results.notFound.length} 404, ${results.other.length} other, ${results.error.length} errors\n`);
  process.exit(results.notFound.length + results.error.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
