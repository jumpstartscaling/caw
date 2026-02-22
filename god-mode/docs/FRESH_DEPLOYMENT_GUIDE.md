# Fresh Deployment Setup Guide

## 🚀 Quick Answer

**NO** - A fresh deployment will NOT have the database tables automatically created. You need to run ONE setup script after the first deployment.

---

## 📋 Fresh Deployment Process

### Step 1: Deploy to Coolify (Automatic)
```bash
# Coolify will:
1. Pull code from Gitea
2. Build Docker containers
3. Start PostgreSQL, Redis, Directus, Frontend
4. Initialize Directus (creates directus_* system tables)
```

**Result:** 
- ✅ Directus is running
- ✅ Admin login works
- ❌ NO custom collections or tables yet

---

### Step 2: Run Database Setup Script (ONE TIME)

**Option A: Automated Script (Recommended)**

Create and run this script on the server:

```bash
#!/bin/bash
# setup_database.sh - Run this ONCE after first deployment

# 1. Copy SQL file to server
scp -i /tmp/coolify_key complete_schema.sql root@YOUR_SERVER_IP:/tmp/

# 2. Execute SQL in PostgreSQL container
ssh -i /tmp/coolify_key root@YOUR_SERVER_IP << 'ENDSSH'
  # Find PostgreSQL container
  PG_CONTAINER=$(docker ps --filter 'name=postgresql' --format '{{.Names}}' | head -1)
  
  # Copy SQL into container
  docker cp /tmp/complete_schema.sql $PG_CONTAINER:/tmp/
  
  # Execute SQL
  docker exec $PG_CONTAINER psql -U postgres -d directus -f /tmp/complete_schema.sql
  
  # Verify tables created
  docker exec $PG_CONTAINER psql -U postgres -d directus -c "
    SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'directus_%' 
    AND tablename NOT LIKE 'spatial_%';
  "
ENDSSH

# 3. Restart Directus to recognize new tables
ssh -i /tmp/coolify_key root@YOUR_SERVER_IP "
  DIRECTUS_CONTAINER=\$(docker ps --filter 'name=directus' --format '{{.Names}}' | head -1)
  docker restart \$DIRECTUS_CONTAINER
"

echo "✅ Database setup complete!"
```

**Option B: Manual Steps**

```bash
# 1. SSH into server
ssh root@YOUR_SERVER_IP

# 2. Find PostgreSQL container
docker ps | grep postgresql

# 3. Copy complete_schema.sql to container
docker cp /path/to/complete_schema.sql POSTGRESQL_CONTAINER:/tmp/

# 4. Execute SQL
docker exec POSTGRESQL_CONTAINER psql -U postgres -d directus -f /tmp/complete_schema.sql

# 5. Restart Directus
docker restart DIRECTUS_CONTAINER
```

---

## 📦 What Gets Created

### 39 Database Tables:
- sites, pages, posts, globals, navigation
- campaign_masters, generated_articles, headline_inventory
- avatar_intelligence, avatar_variants, geo_clusters
- locations_states, locations_counties, locations_cities
- forms, leads, events, pageviews, conversions
- And 20 more...

### All with:
- ✅ Proper field types
- ✅ Foreign key relationships
- ✅ Performance indexes
- ✅ Default values

---

## 🔄 Alternative: Directus Schema Sync (Future)

**For future deployments, we can automate this with:**

### Option 1: Directus Schema Snapshot
```bash
# Export schema from working instance
npx directus schema snapshot ./schema.yaml

# Apply to new instance
npx directus schema apply ./schema.yaml
```

### Option 2: Migration Files
Create Directus migrations that run automatically on startup.

### Option 3: Init Container
Add an init container to docker-compose that runs the SQL automatically.

---

## 🎯 Recommended Setup for New Projects

### 1. Update docker-compose.yaml

Add an init script that runs automatically:

```yaml
services:
  postgresql:
    image: postgis/postgis:17-3.5
    # ... existing config ...
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d  # Auto-run SQL on first start

  directus:
    image: directus/directus:11
    # ... existing config ...
    depends_on:
      postgresql:
        condition: service_healthy
```

### 2. Create init-db directory

```bash
mkdir -p init-db
cp complete_schema.sql init-db/01-schema.sql
```

**Important:** This only works on FIRST deployment (empty database). For existing databases, use the manual script.

---

## 📝 Complete Fresh Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to Gitea
- [ ] `complete_schema.sql` file ready
- [ ] SSH access to server configured

### Deployment
- [ ] Deploy via Coolify
- [ ] Wait for containers to start (~2-3 minutes)
- [ ] Verify Directus is accessible (https://spark.jumpstartscaling.com/admin)

### Post-Deployment (ONE TIME)
- [ ] Run database setup script
- [ ] Verify 39 tables created
- [ ] Restart Directus container
- [ ] Test admin login
- [ ] Check one collection (e.g., /items/sites)

### Verification
- [ ] Frontend loads (https://launch.jumpstartscaling.com)
- [ ] Admin pages work (https://launch.jumpstartscaling.com/admin/sites)
- [ ] No QueryClient errors in console
- [ ] API calls return data (not 403/500 errors)

---

## 🔧 Troubleshooting Fresh Deployments

### Issue: "No tables found"
**Solution:** Run the database setup script

### Issue: "Permission denied"
**Solution:** The script creates tables but doesn't set permissions. Permissions are handled by Directus automatically when `admin_access = true` on the policy.

### Issue: "QueryClient error"
**Solution:** Wait for Coolify to rebuild frontend with latest code (includes CoreProvider fix)

### Issue: "CORS error"
**Solution:** Verify `docker-compose.yaml` has correct CORS_ORIGIN setting

---

## 🎯 Ideal Future State

**Goal:** Zero manual steps after deployment

**How:**
1. **Schema Migrations:** Directus migrations that auto-run
2. **Init Container:** SQL runs automatically on first start
3. **Health Checks:** Verify tables exist before marking as "ready"
4. **Seed Data:** Optional sample data for testing

**Implementation:**
```yaml
# docker-compose.yaml (future)
services:
  db-init:
    image: postgres:17
    depends_on:
      postgresql:
        condition: service_healthy
    volumes:
      - ./complete_schema.sql:/schema.sql
    command: >
      psql -h postgresql -U postgres -d directus -f /schema.sql
    restart: "no"  # Only run once
```

---

## 📊 Current vs Future Comparison

| Step | Current (Manual) | Future (Automated) |
|------|------------------|-------------------|
| Deploy | Coolify | Coolify |
| Create Tables | Manual SQL script | Auto via init container |
| Set Permissions | Auto (admin_access) | Auto (admin_access) |
| Verify | Manual check | Health check |
| Total Time | ~10 minutes | ~3 minutes |
| Manual Steps | 1 (run script) | 0 |

---

## 🚀 Quick Start for New Deployment

**Fastest way to deploy from scratch:**

```bash
# 1. Clone and configure
git clone https://gitthis.jumpstartscaling.com/gatekeeper/net.git spark
cd spark

# 2. Deploy to Coolify (via UI)
# - Connect to Gitea repo
# - Use docker-compose.yaml
# - Set domain names
# - Deploy

# 3. Wait for deployment (3-5 minutes)

# 4. Run ONE command to setup database
./setup_database.sh YOUR_SERVER_IP

# 5. Done! ✅
```

---

## 📄 Files Needed for Fresh Deployment

### Required Files:
1. `docker-compose.yaml` - Service configuration
2. `complete_schema.sql` - Database schema
3. `frontend/` - Frontend code
4. `CREDENTIALS.md` - Access credentials

### Optional Files:
1. `setup_database.sh` - Automated setup script
2. `unified_schema.json` - Directus schema definition
3. `DEPLOYMENT_VERIFICATION.md` - Verification checklist

---

## ✅ Summary

**Current State:**
- ❌ NOT 100% automatic
- ✅ ONE manual step required (run SQL script)
- ⏱️ Takes ~10 minutes total

**After Running Setup Script:**
- ✅ 100% functional
- ✅ All 39 tables created
- ✅ All collections accessible
- ✅ Frontend connected to backend
- ✅ Ready for production use

**Recommendation:**
Create a `setup_database.sh` script in the repo that automates the post-deployment setup. This makes it a ONE-COMMAND process instead of multiple manual steps.

---

**Created:** December 14, 2025  
**Status:** Current deployment requires ONE manual setup step  
**Future:** Can be fully automated with init container
