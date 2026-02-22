#!/usr/bin/env node
/**
 * Seed chrisamaya by connecting directly to DB.
 * Loads DATABASE_URL or builds from DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_DATABASE.
 *
 * Usage: node scripts/seed-via-db.mjs
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

function getDatabaseUrl(env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const host = env.DB_HOST || 'localhost';
  const port = env.DB_PORT || '5432';
  const user = encodeURIComponent(env.DB_USER || 'godmode');
  const pass = encodeURIComponent(env.DB_PASSWORD || '');
  const db = env.DB_DATABASE || env.DB_NAME || 'god_mode';
  return `postgresql://${user}:${pass}@${host}:${port}/${db}`;
}

async function main() {
  const env = loadEnv();
  const dbUrl = getDatabaseUrl(env);
  const safe = dbUrl.includes('@') ? '...@' + dbUrl.split('@')[1] : '***';
  console.log('Connecting to DB:', safe);
  const child = spawn('python3', [resolve(ROOT, 'python-api/scripts/run_router_seed.py')], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
    cwd: resolve(ROOT, 'python-api'),
  });
  child.on('close', (code) => process.exit(code || 0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
