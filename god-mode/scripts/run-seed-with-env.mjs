#!/usr/bin/env node
/**
 * Load DATABASE_URL from .env.local and run seed_chrisamaya.py.
 * Usage: node scripts/run-seed-with-env.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

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

async function main() {
  const env = loadEnv();
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env.local. Add it or set in Coolify.');
    process.exit(1);
  }
  console.log('>>> Running seed_chrisamaya.py with DATABASE_URL from .env.local\n');
  const child = spawn('python3', [resolve(ROOT, 'python-api/scripts/seed_chrisamaya.py')], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
    cwd: resolve(ROOT, 'python-api'),
  });
  child.on('close', (code) => process.exit(code || 0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
