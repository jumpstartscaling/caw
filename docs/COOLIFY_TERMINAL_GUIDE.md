# Coolify Terminal Deployment Guide

## 🖥️ What Happens When You Start from Coolify Terminal?

When you deploy Spark Platform via Coolify and access the terminal, you're inside the **application container** (frontend or directus), NOT the host server.

---

## 📍 Understanding Coolify's Container Architecture

### What Coolify Creates:
```
Host Server (72.61.15.216)
├── postgresql-xxxxx (PostgreSQL container)
├── redis-xxxxx (Redis container)
├── directus-xxxxx (Directus container)
└── frontend-xxxxx (Frontend container)
```

### When You Open "Terminal" in Coolify:
- You're inside ONE specific container (e.g., `frontend-xxxxx`)
- You can't directly access other containers
- You need to use `docker exec` to access PostgreSQL

---

## 🚀 Setup from Coolify Terminal

### Option 1: From Directus Container Terminal

**Steps:**
1. Go to Coolify dashboard
2. Click on your Spark project
3. Click on "Directus" service
4. Click "Terminal" button
5. Run these commands:

```bash
# You're now inside the Directus container

# 1. Install PostgreSQL client (if not already installed)
apt-get update && apt-get install -y postgresql-client

# 2. Download the schema file from your repo
curl -o /tmp/complete_schema.sql https://raw.githubusercontent.com/YOUR_USERNAME/spark/main/complete_schema.sql

# OR if you have it locally, use Coolify's file upload feature

# 3. Find PostgreSQL container name
PGHOST=$(echo $DB_HOST)  # Should be 'postgresql'

# 4. Execute SQL
psql -h $PGHOST -U postgres -d directus -f /tmp/complete_schema.sql

# 5. Restart Directus (from host, see below)
```

### Option 2: From Host Server Terminal (Recommended)

**This is easier because you have full access to all containers:**

1. SSH into the host server:
```bash
ssh root@72.61.15.216
```

2. Run the setup:
```bash
# Find PostgreSQL container
PG_CONTAINER=$(docker ps --filter 'name=postgresql' --format '{{.Names}}' | head -1)

# Copy SQL file (if you have it on the server)
docker cp /path/to/complete_schema.sql $PG_CONTAINER:/tmp/

# Execute SQL
docker exec $PG_CONTAINER psql -U postgres -d directus -f /tmp/complete_schema.sql

# Restart Directus
DIRECTUS_CONTAINER=$(docker ps --filter 'name=directus' --format '{{.Names}}' | head -1)
docker restart $DIRECTUS_CONTAINER
```

---

## 🎯 Best Approach: Use Coolify's Built-in Features

### Method 1: Add Init Script to Docker Compose

**Update `docker-compose.yaml` to include init script:**

```yaml
services:
  postgresql:
    image: postgis/postgis:17-3.5
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./complete_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql  # Auto-run on first start
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: Idk@2026lolhappyha232
      POSTGRES_DB: directus
```

**How it works:**
- PostgreSQL automatically runs any `.sql` files in `/docker-entrypoint-initdb.d/`
- **Only runs on FIRST start** (when database is empty)
- No manual steps needed!

**Limitation:**
- Only works for brand new deployments
- Won't run if database already exists

---

### Method 2: Add a Setup Service

**Add this to `docker-compose.yaml`:**

```yaml
services:
  # ... existing services ...

  db-setup:
    image: postgres:17
    depends_on:
      postgresql:
        condition: service_healthy
    volumes:
      - ./complete_schema.sql:/schema.sql
    environment:
      PGHOST: postgresql
      PGUSER: postgres
      PGPASSWORD: Idk@2026lolhappyha232
      PGDATABASE: directus
    command: >
      sh -c "
        echo 'Waiting for PostgreSQL...';
        sleep 10;
        echo 'Checking if tables exist...';
        TABLE_COUNT=$$(psql -t -c \"SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE 'directus_%'\");
        if [ $$TABLE_COUNT -lt 10 ]; then
          echo 'Creating tables...';
          psql -f /schema.sql;
          echo 'Tables created!';
        else
          echo 'Tables already exist, skipping...';
        fi
      "
    restart: "no"  # Only run once
```

**How it works:**
- Runs automatically after PostgreSQL starts
- Checks if tables exist
- Creates them if missing
- Doesn't run again after first success

---

## 📋 Step-by-Step: Fresh Deployment with Auto-Setup

### 1. Update docker-compose.yaml

Add the `db-setup` service (see above)

### 2. Commit and Push

```bash
git add docker-compose.yaml complete_schema.sql
git commit -m "feat: add automatic database setup on deployment"
git push
```

### 3. Deploy via Coolify

- Coolify detects new commit
- Pulls latest code
- Starts all services
- `db-setup` runs automatically
- Creates all tables
- Restarts Directus

### 4. Done! ✅

No manual steps needed!

---

## 🔍 What Happens in Each Scenario

### Scenario 1: Brand New Deployment (Empty Database)

**With init script:**
```
1. PostgreSQL starts
2. Sees /docker-entrypoint-initdb.d/01-schema.sql
3. Runs SQL automatically
4. Creates all 39 tables
5. Directus starts
6. Recognizes tables
7. ✅ Everything works!
```

**Without init script:**
```
1. PostgreSQL starts (empty)
2. Directus starts
3. Creates only directus_* system tables
4. ❌ No custom tables
5. Need to run setup_database.sh manually
```

### Scenario 2: Existing Deployment (Database Has Data)

**With db-setup service:**
```
1. PostgreSQL starts (has data)
2. db-setup checks table count
3. Sees tables exist
4. Skips SQL execution
5. ✅ No duplicate tables
```

**With init script:**
```
1. PostgreSQL starts (has data)
2. Init script doesn't run (only runs on empty DB)
3. ✅ Existing data preserved
```

---

## 🎯 Recommended Setup for Production

### Use BOTH methods:

```yaml
services:
  postgresql:
    image: postgis/postgis:17-3.5
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./complete_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql  # For new deployments
    # ... rest of config ...

  db-setup:
    image: postgres:17
    depends_on:
      postgresql:
        condition: service_healthy
    volumes:
      - ./complete_schema.sql:/schema.sql
    environment:
      PGHOST: postgresql
      PGUSER: postgres
      PGPASSWORD: Idk@2026lolhappyha232
      PGDATABASE: directus
    command: >
      sh -c "
        sleep 10;
        TABLE_COUNT=$$(psql -t -c \"SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE 'directus_%' AND tablename NOT LIKE 'spatial_%'\" | tr -d ' ');
        if [ \"$$TABLE_COUNT\" -lt \"10\" ]; then
          echo '🚀 Creating database tables...';
          psql -f /schema.sql;
          echo '✅ Tables created successfully!';
        else
          echo '✅ Tables already exist ($$TABLE_COUNT tables found)';
        fi
      "
    restart: "no"
```

**Why both?**
- Init script: Handles brand new deployments
- db-setup: Handles edge cases and provides logging

---

## 🧪 Testing from Coolify Terminal

### To verify setup worked:

1. Open Coolify terminal (Directus service)
2. Run:

```bash
# Check environment variables
env | grep DB_

# Test database connection
apt-get update && apt-get install -y postgresql-client
psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -c "
  SELECT COUNT(*) as table_count 
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'directus_%';
"

# Should show: 39
```

---

## 📊 Comparison: Manual vs Automated

| Method | Steps | Time | Reliability |
|--------|-------|------|-------------|
| **Manual (setup_database.sh)** | 1 command | 2-3 min | ✅ Works always |
| **Init Script** | 0 (automatic) | 0 min | ✅ New deployments only |
| **db-setup Service** | 0 (automatic) | 0 min | ✅ Works always |
| **Coolify Terminal** | Multiple commands | 5-10 min | ⚠️ Manual, error-prone |

**Recommendation:** Use **db-setup service** for best results

---

## 🚀 Quick Answer to Your Question

**"What happens if you start from Coolify terminal?"**

### Current Setup (Without Automation):
1. Open Coolify terminal
2. You're inside a container (limited access)
3. Need to manually run SQL commands
4. More complex than using setup_database.sh

### With Automated Setup (Recommended):
1. Deploy via Coolify
2. db-setup service runs automatically
3. Tables created automatically
4. ✅ No terminal needed!

---

## 📝 Implementation Checklist

To enable automatic setup:

- [ ] Add `db-setup` service to docker-compose.yaml
- [ ] Ensure `complete_schema.sql` is in repo root
- [ ] Commit and push changes
- [ ] Redeploy via Coolify
- [ ] Verify tables created (check Directus admin)
- [ ] Test admin pages work

---

**Created:** December 14, 2025  
**Recommendation:** Add db-setup service for zero-manual-step deployments
