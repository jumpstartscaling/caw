# Jumpstart Scaling - Production Deployment Guide

## Current Production Status
**LOCKED AND STABLE** ✅

### Live Sites (DO NOT TOUCH)
- **jumpstartscaling.com** - Port 8100 (PM2: jumpstart-v2)
- **n8n.jumpstartscaling.com** - Port 5678 (PM2: ion-n8n)

### Production Architecture
```
Cloudflare Tunnel (cloudflared)
  ↓
jumpstartscaling.com → localhost:8100 (Node.js static server)
n8n.jumpstartscaling.com → localhost:5678 (n8n)
```

## Safe Development Workflow

### Option 1: Local Development (Recommended)
Work on your local machine without affecting production:

```bash
# On your local machine
cd /Users/christopheramaya/Downloads/spark/god-mode/sites/jumpstartscaling

# Run dev server (port 8100 locally)
npm run dev

# Test at http://localhost:8100
# Make all your changes here
```

### Option 2: Staging Environment on Server
Create a staging instance on a different port:

```bash
# SSH to server
ssh opc@150.136.117.198

# Copy production to staging
cp -r /home/opc/sites/jumpstartscaling /home/opc/sites/jumpstartscaling-staging

# Edit staging package.json to use port 8102
cd /home/opc/sites/jumpstartscaling-staging
# Change "preview": "node server.js" to use PORT=8102

# Start staging
pm2 start npm --name "jumpstart-staging" --cwd /home/opc/sites/jumpstartscaling-staging -- run preview

# Access via: http://150.136.117.198:8102 (or add to Cloudflare Tunnel)
```

## Deployment Process (When Ready)

### Step 1: Test Locally
```bash
# Build and test
npm run build
npm run preview

# Verify everything works
```

### Step 2: Deploy to Production
```bash
# From your local machine
cd /Users/christopheramaya/Downloads/spark/god-mode

# Upload changes
scp -r sites/jumpstartscaling/src/* opc@150.136.117.198:/home/opc/sites/jumpstartscaling/src/

# SSH and rebuild
ssh opc@150.136.117.198 "cd /home/opc/sites/jumpstartscaling && npm run build && pm2 restart jumpstart-v2"
```

### Step 3: Rollback (If Needed)
```bash
# Keep a backup before deploying
ssh opc@150.136.117.198 "cp -r /home/opc/sites/jumpstartscaling/dist /home/opc/sites/jumpstartscaling/dist.backup"

# If something breaks, restore:
ssh opc@150.136.117.198 "rm -rf /home/opc/sites/jumpstartscaling/dist && mv /home/opc/sites/jumpstartscaling/dist.backup /home/opc/sites/jumpstartscaling/dist && pm2 restart jumpstart-v2"
```

## Critical Files (DO NOT DELETE)
- `/home/opc/sites/jumpstartscaling/dist/` - Production build
- `/home/opc/sites/jumpstartscaling/server.js` - Production server
- `/etc/cloudflared/config.yml` - Tunnel configuration
- PM2 process: `jumpstart-v2` - Must stay running

## PM2 Commands (For Reference)
```bash
# View all processes
pm2 list

# View logs
pm2 logs jumpstart-v2 --lines 50

# Restart (safe - uses new code)
pm2 restart jumpstart-v2

# Stop (DANGEROUS - site goes down)
pm2 stop jumpstart-v2

# Save current state
pm2 save
```

## Emergency Contacts
- Server IP: 150.136.117.198
- SSH User: opc
- Cloudflare Tunnel: Active via systemd

## Current Performance Metrics
- Mobile Performance: 96+
- Desktop Performance: 100
- SEO: 95+
- Accessibility: 100

---

**Last Updated**: 2026-01-10
**Status**: Production Locked ✅
**Next Deploy**: TBD (Test in staging first)
