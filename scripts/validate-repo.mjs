#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'server/index.mjs',
  'server/db.js',
  'server/blocks.js',
  'views/page.ejs',
  'views/homepage.ejs',
  'views/404.ejs',
  '.env.example',
];

const failures = [];
const warnings = [];

for (const file of requiredFiles) {
  try {
    await access(file);
  } catch {
    failures.push(`Missing required runtime file: ${file}`);
  }
}

try {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  if (pkg.scripts?.start !== 'node server/index.mjs') {
    failures.push('package.json start script must point to server/index.mjs');
  }

  const legacyPackages = Object.keys(pkg.dependencies || {}).filter((name) =>
    name === 'astro' ||
    name.startsWith('@astrojs/') ||
    name.startsWith('@react-three/') ||
    ['react', 'react-dom', 'three', 'vite', 'typescript'].includes(name)
  );

  if (legacyPackages.length) {
    warnings.push(
      `Legacy frontend dependencies remain installed: ${legacyPackages.join(', ')}. ` +
      'Do not remove them until the old Astro tree and deployment process are confirmed unused.'
    );
  }
} catch (error) {
  failures.push(`Unable to parse package.json: ${error.message}`);
}

try {
  const server = await readFile('server/index.mjs', 'utf8');
  if (server.includes('autoGeneratePage(slug)')) {
    warnings.push(
      'Unknown routes can call autoGeneratePage(slug). Gate this behind an explicit admin-only workflow before production expansion.'
    );
  }
  if (!server.includes("fastify.post('/api/submit-lead'")) {
    failures.push('Lead intake route /api/submit-lead was not found.');
  }
} catch (error) {
  failures.push(`Unable to inspect server/index.mjs: ${error.message}`);
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const failure of failures) console.error(`ERROR: ${failure}`);

if (failures.length) process.exit(1);

console.log(`Repository validation passed with ${warnings.length} warning(s).`);
