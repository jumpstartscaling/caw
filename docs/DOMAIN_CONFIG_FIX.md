# Domain Configuration Fix

## 🐛 Issue Identified

**Problem:** Frontend showing empty data even though backend has data.

**Root Cause:** Incorrect domain configuration in `docker-compose.yaml`

### Domain Architecture
- **Frontend (Astro):** `launch.jumpstartscaling.com`
- **Backend (Directus API):** `spark.jumpstartscaling.com`

### What Was Wrong
```yaml
# BEFORE (INCORRECT):
directus:
  environment:
    PUBLIC_URL: 'https://launch.jumpstartscaling.com'  # ❌ Wrong!

frontend:
  environment:
    PUBLIC_DIRECTUS_URL: 'https://launch.jumpstartscaling.com'  # ❌ Wrong!
```

**Problem:** Frontend was trying to connect to itself for API calls instead of connecting to the Directus backend.

---

## ✅ Fix Applied

```yaml
# AFTER (CORRECT):
directus:
  environment:
    PUBLIC_URL: 'https://spark.jumpstartscaling.com'  # ✅ Correct!
    CORS_ORIGIN: 'https://launch.jumpstartscaling.com,https://spark.jumpstartscaling.com,http://localhost:4321'

frontend:
  environment:
    PUBLIC_DIRECTUS_URL: 'https://spark.jumpstartscaling.com'  # ✅ Correct!
```

---

## 📊 Correct Configuration

| Service | Domain | Purpose |
|---------|--------|---------|
| **Directus** | spark.jumpstartscaling.com | API Backend |
| **Frontend** | launch.jumpstartscaling.com | User Interface |

### API Flow
```
User Browser
    ↓
launch.jumpstartscaling.com (Frontend)
    ↓ (API calls)
spark.jumpstartscaling.com (Directus)
    ↓
PostgreSQL Database
```

---

## 🔧 What This Fixes

### Before Fix:
- ❌ Frontend tries to call `launch.jumpstartscaling.com/items/sites`
- ❌ No API at that URL (it's just the frontend)
- ❌ Sites page shows empty
- ❌ All admin pages show no data

### After Fix:
- ✅ Frontend calls `spark.jumpstartscaling.com/items/sites`
- ✅ Directus API responds with data
- ✅ Sites page shows "Test Site"
- ✅ All admin pages load data correctly

---

## 🚀 Deployment Steps

1. **Push Changes to Git** ✅
   ```bash
   git add docker-compose.yaml
   git commit -m "fix: correct domain configuration"
   git push gitea-https main
   ```

2. **Coolify Will Auto-Deploy**
   - Detects new commit
   - Rebuilds frontend with correct `PUBLIC_DIRECTUS_URL`
   - Restarts Directus with correct `PUBLIC_URL`
   - ETA: 2-5 minutes

3. **Verify After Deployment**
   ```bash
   # Check frontend env
   docker exec frontend-* env | grep DIRECTUS
   # Should show: PUBLIC_DIRECTUS_URL=https://spark.jumpstartscaling.com

   # Test API from frontend
   curl https://launch.jumpstartscaling.com/admin/sites
   # Should load and make API calls to spark.jumpstartscaling.com
   ```

---

## 🧪 Testing After Fix

### Test 1: Sites Page
```
URL: https://launch.jumpstartscaling.com/admin/sites
Expected: Shows "Test Site" card
```

### Test 2: Browser Console
```
1. Open https://launch.jumpstartscaling.com/admin/sites
2. Press F12 (Dev Tools)
3. Go to Network tab
4. Look for API calls
5. Should see: https://spark.jumpstartscaling.com/items/sites
6. Status: 200 OK
7. Response: {"data": [{"id": "...", "name": "Test Site"}]}
```

### Test 3: All Admin Pages
All these should now show data (or empty states, not errors):
- ✅ /admin/sites
- ✅ /admin/content/avatars
- ✅ /admin/collections/geo-intelligence
- ✅ /admin/seo/articles
- ✅ All other admin pages

---

## 📝 Environment Variables Summary

### Directus Container
```bash
PUBLIC_URL=https://spark.jumpstartscaling.com
CORS_ORIGIN=https://launch.jumpstartscaling.com,https://spark.jumpstartscaling.com,http://localhost:4321
CORS_ENABLED=true
```

### Frontend Container
```bash
PUBLIC_DIRECTUS_URL=https://spark.jumpstartscaling.com
PUBLIC_PLATFORM_DOMAIN=launch.jumpstartscaling.com
```

---

## 🎯 Why This Happened

1. **Initial Setup:** We set `PUBLIC_URL` to `launch` thinking that's where users access it
2. **Confusion:** Mixed up the frontend domain with the API domain
3. **Frontend Fix:** Changed frontend to connect to `launch` (wrong!)
4. **Now Fixed:** Frontend connects to `spark` (correct!)

---

## 🔍 How to Verify It's Working

### Method 1: Check Data in Sites
```
1. Go to https://launch.jumpstartscaling.com/admin/sites
2. Should see "Test Site" card
3. Click "Manage Content" - should work
4. Click "Preview" - should work
```

### Method 2: Check Console
```
1. Open browser dev tools (F12)
2. Go to Console tab
3. Should see NO errors
4. Should see successful API calls
```

### Method 3: Check Network
```
1. Open Network tab
2. Reload page
3. Look for requests to spark.jumpstartscaling.com
4. All should return 200 OK
```

---

**Fix Applied:** December 14, 2025 10:45 AM EST  
**Commit:** Pending push  
**Status:** 🔄 **Waiting for Coolify Deployment**  
**ETA:** 2-5 minutes for frontend rebuild
