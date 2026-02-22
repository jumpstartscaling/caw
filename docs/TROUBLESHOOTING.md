# Database Credentials Issue - Troubleshooting

## Problem
Directus is trying to connect with user `sparkuser` but the database has user `bbdf554`.

## Root Cause
Coolify might have environment variables that override the docker-compose.yaml values.

## Solution Options

### Option 1: Check Coolify Environment Variables
In Coolify UI → Application → Environment Variables:
- Look for `DB_USER` variable
- If it says `sparkuser`, delete it or change to `bbdf554`

### Option 2: Add .env file to override
Create a `.env` file in the repo with:
```
DB_USER=bbdf554
DB_PASSWORD=Idk@2026lolhappyha232
```

### Option 3: Hardcode in docker-compose (already done)
The docker-compose.yaml already has hardcoded values, but Coolify's `env_file: .env` might be overriding them.

## Current Status
- PostgreSQL: ✅ Running with user `bbdf554`
- Redis: ✅ Running
- Frontend: ✅ Running
- Directus: ❌ Can't connect (wrong username)

## Next Steps
1. Check if Coolify has environment variable overrides
2. Remove any `DB_USER=sparkuser` variables
3. Redeploy
