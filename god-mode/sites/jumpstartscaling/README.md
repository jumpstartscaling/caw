# Jumpstart Scaling - Production Site

## 🔒 Production Status: LOCKED & STABLE

This site is currently **LIVE** at [https://jumpstartscaling.com](https://jumpstartscaling.com)

**DO NOT** make changes directly to production without testing first.

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run dev server (localhost:8100)
npm run dev

# Build for production
npm run build

# Test production build locally
npm run preview
```

## Safe Deployment

### Option 1: Use the Deploy Script (Recommended)
```bash
# From god-mode directory
cd sites/jumpstartscaling
./deploy.sh
```

This will:
1. ✅ Create automatic backup
2. ✅ Upload your changes
3. ✅ Build on server
4. ✅ Restart PM2
5. ✅ Verify site is up

### Option 2: Manual Deployment
See `DEPLOYMENT.md` for detailed instructions.

## Current Architecture

```
Production Server (Oracle ARM64)
├── jumpstartscaling.com (Port 8100)
│   ├── PM2 Process: jumpstart-v2
│   ├── Server: Node.js (server.js)
│   └── Content: Static files in dist/
│
├── n8n.jumpstartscaling.com (Port 5678)
│   └── PM2 Process: ion-n8n
│
└── Cloudflare Tunnel
    └── Routes all traffic via HTTPS
```

## Performance Metrics

- 📱 Mobile Performance: **96+**
- 🖥️ Desktop Performance: **100**
- 🔍 SEO Score: **95+**
- ♿ Accessibility: **100**

## Key Files

- `src/` - Source code (edit here)
- `dist/` - Production build (auto-generated)
- `server.js` - Production server
- `deploy.sh` - Safe deployment script
- `DEPLOYMENT.md` - Detailed deployment guide

## Emergency Rollback

If something breaks after deployment:

```bash
# List available backups
ssh opc@150.136.117.198 "ls -lh /home/opc/sites/jumpstartscaling-backup-*"

# Restore specific backup
ssh opc@150.136.117.198 "cd /home/opc/sites/jumpstartscaling && tar -xzf ../jumpstartscaling-backup-YYYYMMDD-HHMMSS.tar.gz && pm2 restart jumpstart-v2"
```

## Support

- Server: `150.136.117.198`
- SSH: `ssh opc@150.136.117.198`
- PM2 Logs: `pm2 logs jumpstart-v2`

---

**Last Updated**: 2026-01-10  
**Status**: ✅ Production Locked
