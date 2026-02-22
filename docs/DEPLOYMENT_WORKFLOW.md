# 🚀 HOW TO DEPLOY CHANGES TO LIVE SITE

**Last Updated**: December 13, 2025

---

## 📋 DEPLOYMENT CHECKLIST

### Step 1: Commit Changes to GitHub ✅

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add 10 collection management pages with Titanium Pro design"

# Push to main branch
git push origin main
```

---

### Step 2: Fix Directus Permissions (ONE-TIME) ⚠️

**CRITICAL**: This must be done ONCE before the frontend can access data.

1. **Log into Directus Admin**
   ```
   URL: https://spark.jumpstartscaling.com/admin
   Email: insanecorp@gmail.com
   Password: Idk@ai2026yayhappy
   ```

2. **Navigate to Access Control**
   - Click **Settings** (⚙️ gear icon at bottom left)
   - Click **Access Control** (🔑 key icon)

3. **Grant Permissions to Collections**
   
   Find your role (e.g., "Administrator" or the role assigned to your API token).
   
   Enable **Read** permission (eye icon 👁️) for these collections:
   - `avatar_intelligence` ✅
   - `avatar_variants` ✅
   - `campaign_masters` ✅
   - `cartesian_patterns` ✅
   - `content_fragments` ✅
   - `generated_articles` ✅
   - `generation_jobs` ✅
   - `geo_intelligence` ✅
   - `headline_inventory` ✅
   - `leads` ✅
   - `offer_blocks` ✅
   - `spintax_dictionaries` ✅

4. **Verify API Token**
   ```
   Token: eufOJ_oKEx_FVyGoz1GxWu6nkSOcgIVS
   ```
   
   Make sure this token uses the role you just updated.

---

### Step 3: Rebuild Frontend Container 🐳

**Option A: SSH Method (Recommended)**

```bash
# 1. SSH into server
ssh root@72.61.15.216

# 2. Navigate to Coolify app directory
cd /data/coolify/applications/i8cswkos04c4s08404ok0ws4

# 3. Pull latest code from GitHub
docker exec frontend-i8cswkos04c4s08404ok0ws4-021136192114 sh -c "cd /app && git pull"

# 4. Rebuild frontend container
docker compose build frontend

# 5. Restart frontend with new build
docker compose up -d frontend

# 6. Check logs for errors
docker logs -f frontend-i8cswkos04c4s08404ok0ws4-021136192114
```

**Option B: Coolify UI Method**

1. Go to your Coolify dashboard: http://72.61.15.216:8000
2. Find the "launch.jumpstartscaling.com" application
3. Click **"Redeploy"** or **"Force Rebuild"**
4. Wait for build to complete (~2-3 minutes)
5. Check deployment logs

---

### Step 4: Verify Deployment ✅

**Test Frontend is Live:**
```bash
curl -I https://launch.jumpstartscaling.com
# Should return: HTTP/2 200
```

**Test Admin Dashboard:**
```bash
curl https://launch.jumpstartscaling.com/admin
# Should return HTML (not error page)
```

**Test API Connection:**
```bash
curl https://launch.jumpstartscaling.com/api/health
# Should return: {"status":"ok"}
```

**Manual Browser Test:**
1. Open https://launch.jumpstartscaling.com
2. Navigate to `/admin`
3. Check that command palette (Cmd+K) works
4. Verify no console errors (F12)
5. Test at least 2-3 collection pages

---

### Step 5: Monitor for Issues 🔍

**Check Container Health:**
```bash
ssh root@72.61.15.216
docker ps | grep -E 'directus|frontend|postgres|redis'
```

**Check Frontend Logs:**
```bash
docker logs --tail 100 frontend-i8cswkos04c4s08404ok0ws4-021136192114
```

**Check Directus Logs:**
```bash
docker logs --tail 100 directus-i8cswkos04c4s08404ok0ws4-021136158139
```

---

## 🆘 TROUBLESHOOTING

### "Site shows old build"
```bash
# Force rebuild from scratch
ssh root@72.61.15.216
cd /data/coolify/applications/i8cswkos04c4s08404ok0ws4
docker compose build --no-cache frontend
docker compose up -d frontend
```

### "API returns 403 Forbidden"
- Check Directus permissions (Step 2 above)
- Verify API token is still valid
- Check role has read access to collections

### "Container won't start"
```bash
# Check for port conflicts
docker ps -a

# Check build logs
docker compose logs frontend

# Restart all services
docker compose restart
```

### "Changes not appearing"
```bash
# Clear browser cache (Cmd+Shift+R on Mac)
# Or use incognito mode to test

# Verify Git commit reached server
ssh root@72.61.15.216
cd /data/coolify/applications/i8cswkos04c4s08404ok0ws4
docker exec frontend-i8cswkos04c4s08404ok0ws4-021136192114 sh -c "cd /app && git log -1"
```

---

## 🎯 QUICK DEPLOY SCRIPT

Save this as `deploy.sh` for one-command deployments:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Spark Alpha..."

# Step 1: Commit changes
echo "📝 Committing changes..."
git add .
git commit -m "${1:-Update Spark Alpha}" || echo "No changes to commit"
git push origin main

# Step 2: SSH and rebuild
echo "🐳 Rebuilding on server..."
ssh root@72.61.15.216 << 'ENDSSH'
  cd /data/coolify/applications/i8cswkos04c4s08404ok0ws4
  docker compose pull frontend
  docker compose build frontend
  docker compose up -d frontend
  echo "✅ Deployment complete!"
  docker logs --tail 20 frontend-i8cswkos04c4s08404ok0ws4-021136192114
ENDSSH

echo "🎉 Done! Check https://launch.jumpstartscaling.com"
```

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh "Add new collection pages"
```

---

## 📊 DEPLOYMENT CHECKLIST

Before deploying to production, verify:

- [ ] All tests pass locally
- [ ] No console errors in browser
- [ ] API connections working
- [ ] Directus permissions configured
- [ ] Docker containers healthy
- [ ] SSL certificates valid
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Backup recent data
- [ ] Commit message is descriptive

---

## 🔐 CREDENTIALS REFERENCE

### SSH Access
```
Server: root@72.61.15.216
Method: SSH key authentication
```

### Directus Admin
```
URL: https://spark.jumpstartscaling.com/admin
Email: insanecorp@gmail.com
Password: Idk@ai2026yayhappy
```

### API Token
```
Token: eufOJ_oKEx_FVyGoz1GxWu6nkSOcgIVS
Usage: Set as DIRECTUS_TOKEN in frontend .env
```

### Database (Coolify-generated)
```
User: wdoC78BlbpuP82SO
Password: KVvgCRzH0yy7p7R9TVYBooDjE073Pbq4
Database: directus
Host: postgresql (internal network)
```

---

## 📚 ADDITIONAL RESOURCES

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Directus API Docs](https://docs.directus.io/reference/introduction.html)

---

**IMPORTANT**: Always test on a development environment first if making major changes!
