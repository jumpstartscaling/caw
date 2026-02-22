# God Mode — Terminal Commands

Run these from the **spark repo root** (`/path/to/spark` or `~/Downloads/spark`). Use `cd god-mode` first so you're in the right folder.

---

## Push & Deploy

```bash
# 1. Push to GitHub
cd god-mode && git add -A && git status
cd god-mode && git commit -m "Your message" && git push origin main

# 2. Trigger Coolify redeploy for both apps (JFactory + god-mode-api)
cd god-mode && node scripts/configure-coolify-via-api.mjs --deploy
```
Requires `COOLIFY_TOKEN` in god-mode/.env.local.

---

## Coolify: Delete & Recreate Apps

```bash
# 1. Delete JFactory and god-mode-api
cd god-mode && node scripts/delete-factory-and-godmode.mjs --confirm

# 2. Create new JFactory and god-mode-api (discovers project/server automatically)
cd god-mode && node scripts/create-factory-and-godmode.mjs --deploy

# Add DATABASE_URL to god-mode-api in Coolify UI, then redeploy.
```
Requires COOLIFY_TOKEN. See docs/TENANT_DNS_SETUP.md for tenant DNS without adding domains to Coolify.

## Seed & Campaign

```bash
# Seed via Coolify (recommended - fetches ADMIN_KEY from Coolify, then seeds production)
cd god-mode && node scripts/seed-via-coolify.mjs
# Requires COOLIFY_TOKEN in .env.local (Coolify → Keys & Tokens → API tokens)

# Seed with campaign launch
cd god-mode && node scripts/seed-via-coolify.mjs --launch --quantity=2000

# Seed via API (when you already have ADMIN_KEY)
cd god-mode && ADMIN_KEY=xxx node scripts/seed-chrisamaya-via-api.mjs

# Seed via direct DB (when SSH tunnel is up: localhost:5433 -> production Postgres)
cd god-mode && node scripts/seed-via-db.mjs
# Start tunnel: ssh -f -N -L 5433:localhost:5432 -i ~/.ssh/coolify_key root@spark.jumpstartscaling.com
# (SSH key must be authorized on the server)
```

---

## Verify

```bash
# Check API counts
curl -s https://api.jumpstartscaling.com/api/counts | jq

# Handshake check
cd god-mode && API_URL=https://api.jumpstartscaling.com node scripts/verify-handshake.mjs
```
