# God Mode - Database Access & Troubleshooting Guide

**Professional Reference for Database Management**

---

## 🔧 Available Database Access Methods

### Method 1: SQL Console (Primary Backdoor) ⭐

**URL:** https://spark.jumpstartscaling.com/admin/database/sql-console

**Best For:**
- Quick database queries
- Schema verification
- Emergency fixes when app is down

**Example Usage:**
```sql
-- Verify schema fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_fragments' 
  AND column_name IN ('fragment_text', 'content_body', 'date_updated', 'updated_at')
ORDER BY column_name;
```

**Verified Response (2025-12-19):**
```json
[
  {"column_name": "content_body", "data_type": "text"},
  {"column_name": "date_updated", "data_type": "timestamp with time zone"},
  {"column_name": "fragment_text", "data_type": "text"},
  {"column_name": "updated_at", "data_type": "timestamp with time zone"}
]
```

✅ **All columns exist and are properly typed**

---

### Method 2: God Mode API

**Endpoint:** `POST https://god.jumpstartscaling.com/api/god/sql`

**Authentication:**
```bash
X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA
```

**Example:**
```bash
curl -X POST "https://god.jumpstartscaling.com/api/god/sql" \
  -H "Content-Type: application/json" \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA" \
  -d '{"query": "SELECT * FROM sites LIMIT 5;"}'
```

**Note:** Only works when God Mode app is running

---

### Method 3: Direct PostgreSQL Access

**Via Coolify Container:**
```bash
psql -U spark-god-mode -d arc-net -c "SELECT NOW();"
```

---

## 📋 Common Diagnostic Queries

### Check Schema Alignment
```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check specific table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'content_fragments'
ORDER BY ordinal_position;
```

### Database Health
```sql
-- Active connections
SELECT count(*) as connections, state 
FROM pg_stat_activity GROUP BY state;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
```

### Data Verification
```sql
-- Count records in key tables
SELECT 'sites' as table, COUNT(*) as records FROM sites
UNION ALL SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL SELECT 'posts', COUNT(*) FROM posts;
```

---

## 🚨 Emergency Schema Fixes

```sql
-- Add missing columns (idempotent - safe to run multiple times)
ALTER TABLE content_fragments 
ADD COLUMN IF NOT EXISTS fragment_text TEXT 
GENERATED ALWAYS AS (content_body) STORED;

ALTER TABLE content_fragments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE content_fragments 
ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ 
GENERATED ALWAYS AS (updated_at) STORED;
```

---

## 🔍 Troubleshooting Workflow

1. **Access SQL Console** → https://spark.jumpstartscaling.com/admin/database/sql-console
2. **Run diagnostic query** → Verify schema/data
3. **Apply fix if needed** → Use idempotent commands
4. **Restart application** → `docker restart [container]`
5. **Verify fix** → Test app endpoints

---

## ✅ Best Practices

- **Always use SQL Console first** - Fastest for quick checks
- **Use idempotent commands** - `IF NOT EXISTS`, `IF EXISTS`
- **Test on small datasets** - Add `LIMIT` clause
- **Document fixes** - Add to migration files later

---

**Last Updated:** 2025-12-19  
**Verified By:** Production SQL Console
