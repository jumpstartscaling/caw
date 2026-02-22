# Simplified Domain Architecture

## ✅ New Domain Configuration (Simplified!)

### Primary Domain: `spark.jumpstartscaling.com`
**Hosts BOTH:**
- 🎨 Frontend Admin UI (`/admin/*`)
- 🔌 Directus Backend API (`/items/*`, `/collections/*`, etc.)

**Routes:**
- `/admin` - Admin dashboard
- `/admin/sites` - Sites manager
- `/admin/pages` - Pages manager
- `/items/sites` - Directus API
- `/collections` - Directus collections API
- `/auth/login` - Authentication

### Preview/Staging Domain: `launch.jumpstartscaling.com`
**Used ONLY for:**
- 👁️ Site previews (`/preview/site/[id]`)
- 👁️ Page previews (`/preview/page/[id]`)
- 👁️ Post previews (`/preview/post/[id]`)
- 👁️ Article previews (`/preview/article/[id]`)

---

## 🎯 Why This is Better

### Before (Complicated):
```
launch.jumpstartscaling.com → Frontend
spark.jumpstartscaling.com  → Backend
❌ Confusing
❌ CORS complexity
❌ Two domains to remember
```

### After (Simplified):
```
spark.jumpstartscaling.com   → Everything (Frontend + Backend)
launch.jumpstartscaling.com  → Preview/Staging only
✅ Simple
✅ Same domain = no CORS issues
✅ One domain for daily use
```

---

## 📦 Updated Configuration

### docker-compose.yaml Changes

#### Directus (Backend)
```yaml
directus:
  environment:
    PUBLIC_URL: 'https://spark.jumpstartscaling.com'
    CORS_ORIGIN: 'https://spark.jumpstartscaling.com,https://launch.jumpstartscaling.com,http://localhost:4321'
  labels:
    coolify.fqdn: 'spark.jumpstartscaling.com'
    coolify.port: '8055'
```

#### Frontend
```yaml
frontend:
  environment:
    PUBLIC_DIRECTUS_URL: 'https://spark.jumpstartscaling.com'
    PUBLIC_PLATFORM_DOMAIN: 'spark.jumpstartscaling.com'
    PREVIEW_DOMAIN: 'launch.jumpstartscaling.com'
  labels:
    coolify.fqdn: 'spark.jumpstartscaling.com'
    coolify.port: '4321'
```

---

## 🌐 How Coolify Serves Both

### Traefik Routing (Coolify handles this automatically)

```
https://spark.jumpstartscaling.com/*
  ↓
Traefik inspects path:
  ↓
/admin*, /preview*, /*, etc. → Frontend container (port 4321)
/items/*, /collections/*, /auth/*, etc. → Passed through to Directus
  ↓
Frontend makes API calls to same domain
  ↓
Directus API (port 8055 internal, exposed via Traefik)
```

**Key:** Both services on same domain, Traefik routes based on path

---

## 🔗 API Calls (Same Domain!)

### Before (Cross-Domain):
```javascript
// Frontend at launch.jumpstartscaling.com
fetch('https://spark.jumpstartscaling.com/items/sites')
// ❌ CORS needed
```

### After (Same Domain):
```javascript
// Frontend at spark.jumpstartscaling.com
fetch('https://spark.jumpstartscaling.com/items/sites')
// ✅ No CORS issues!
```

Or even simpler:
```javascript
// Relative URL works!
fetch('/items/sites')
// ✅ Same domain, no CORS
```

---

## 📍 URL Examples

### Main App (spark.jumpstartscaling.com)

**Admin Pages:**
- `https://spark.jumpstartscaling.com/admin`
- `https://spark.jumpstartscaling.com/admin/sites`
- `https://spark.jumpstartscaling.com/admin/content/avatars`

**API Endpoints:**
- `https://spark.jumpstartscaling.com/items/sites`
- `https://spark.jumpstartscaling.com/collections`
- `https://spark.jumpstartscaling.com/auth/login`

**Direct Directus Admin:**
- `https://spark.jumpstartscaling.com/admin` (Directus Studio)

### Preview/Staging (launch.jumpstartscaling.com)

**Preview Routes:**
- `https://launch.jumpstartscaling.com/preview/site/abc123`
- `https://launch.jumpstartscaling.com/preview/page/def456`
- `https://launch.jumpstartscaling.com/preview/post/ghi789`

---

## 🔧 Frontend Code Updates

### Environment Variables Available

```javascript
// In frontend components:
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL;
// → 'https://spark.jumpstartscaling.com'

const PLATFORM_DOMAIN = import.meta.env.PUBLIC_PLATFORM_DOMAIN;
// → 'spark.jumpstartscaling.com'

const PREVIEW_DOMAIN = import.meta.env.PREVIEW_DOMAIN;
// → 'launch.jumpstartscaling.com'
```

### API Client Usage

```typescript
import { getDirectusClient } from '@/lib/directus/client';

// Automatically connects to spark.jumpstartscaling.com
const client = getDirectusClient();

// All API calls go to same domain
const sites = await client.request(readItems('sites'));
```

### Preview Links

```typescript
// Use PREVIEW_DOMAIN for staging/preview
const previewUrl = `https://${import.meta.env.PREVIEW_DOMAIN}/preview/site/${siteId}`;

// Example:
// https://launch.jumpstartscaling.com/preview/site/abc123
```

---

## 🚀 Deployment Impact

### What Changes After Redeploy:

#### ✅ Works Immediately:
- Admin dashboard
- All admin pages
- API calls (same domain!)
- Authentication
- Data fetching

#### ✅ Still Works:
- Preview links (launch domain)
- Existing data
- Database tables
- Permissions

#### ❌ Breaks (temporarily):
- Old bookmarks to `launch.jumpstartscaling.com/admin`
  - **Fix:** Update bookmark to `spark.jumpstartscaling.com/admin`

---

## 📊 Comparison Table

| Feature | Old (2 domains) | New (1 + preview) |
|---------|-----------------|-------------------|
| **Main App** | launch.jumpstartscaling.com | spark.jumpstartscaling.com |
| **API** | spark.jumpstartscaling.com | spark.jumpstartscaling.com |
| **CORS** | Required | Not needed (same domain) |
| **Preview** | N/A | launch.jumpstartscaling.com |
| **Complexity** | High | Low |
| **URLs to Remember** | 2 | 1 |

---

## 🎯 User Workflow

### Daily Use:
1. Go to `https://spark.jumpstartscaling.com/admin`
2. Everything works on one domain
3. No confusion!

### Preview/Staging:
1. Click "Preview" button in admin
2. Opens `https://launch.jumpstartscaling.com/preview/...`
3. See how content will look
4. Close preview, back to admin

---

## 🔐 Security & CORS

### CORS Configuration:
```yaml
CORS_ORIGIN: 'https://spark.jumpstartscaling.com,https://launch.jumpstartscaling.com,http://localhost:4321'
```

**Why both domains in CORS?**
- `spark.jumpstartscaling.com` - Main app (technically same origin, but explicit is good)
- `launch.jumpstartscaling.com` - Preview pages calling API
- `localhost:4321` - Local development

---

## 📝 Migration Notes

### For Existing Users:
- Update browser bookmarks from `launch` to `spark`
- API tokens still work (same backend)
- All data preserved
- No database changes needed

### For New Deployments:
- Everything works out of the box
- One domain to configure
- Preview domain is bonus feature

---

## ✅ Verification After Deploy

### Test Checklist:
- [ ] `https://spark.jumpstartscaling.com/admin` loads
- [ ] Login works
- [ ] Sites manager shows data
- [ ] API calls in browser console show `spark.jumpstartscaling.com`
- [ ] No CORS errors
- [ ] Preview links use `launch.jumpstartscaling.com`

---

## 🎉 Summary

**One domain for everything:**
- ✅ `spark.jumpstartscaling.com` - Your main Spark Platform
- ✅ `launch.jumpstartscaling.com` - Preview/staging for content

**Benefits:**
- 🎯 Simple mental model
- 🚀 No CORS complexity
- 📱 One URL to remember
- 👁️ Dedicated preview domain

**Status:** Ready to deploy!

---

**Updated:** December 14, 2025  
**Architecture:** Simplified to single-domain with preview subdomain
