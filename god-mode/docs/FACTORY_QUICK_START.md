# 🔱 AI Factory - Quick Start Guide

## What Was Built

Your AI Factory is now a **closed-loop autonomous system** with:

### 🎯 Core Systems
1. **51 Station Registry** - Complete map of all database tables
2. **God Mode API Wrapper** - Axios-based with logging
3. **Dual-Output Logger** - Terminal (Pino) + Database (work_log)
4. **60s Heartbeat Service** - Auto-monitoring background process

### 🎛️ Control Components
1. **Master Ignition** - 4-phase startup with speech + golden glow
2. **Emergency Kill-Switch** - Arm → Double-tap safety mechanism  
3. **Recovery Station** - 6-stage post-crash repair protocol
4. **Intelligence Stream** - Real-time scrolling telemetry feed
5. **Heartbeat Sparkline** - 12-bar animated pulse indicator
6. **Xterm Terminal** - Full emulator with SQL execution

---

## Files Created

```
src/lib/
├── stations/
│   └── registry.ts              # 51 stations mapped
└── factory/
    ├── index.ts                 # Auto-start heartbeat
    ├── api.ts                   # God Mode wrapper
    ├── logger.ts                # Pino + Postgres
    ├── heartbeat.ts             # 60s monitor
    └── awaken_recovery.sql      # 7-stage repair

src/components/admin/factory/
├── index.ts                     # Barrel exports
├── MasterIgnition.tsx          # 4-phase ignition
├── EmergencyKillSwitch.tsx     # Safety halt
├── RecoveryStation.tsx         # 6-stage recovery
├── IntelligenceStream.tsx      # Real-time logs
└── HeartbeatSparkline.tsx      # Pulse visual
```

---

## How To Use

### 1. Import Components
```tsx
import { 
  MasterIgnition, 
  EmergencyKillSwitch,
  RecoveryStation,
  IntelligenceStream,
  HeartbeatSparkline
} from '@/components/admin/factory';
```

### 2. Add to Dashboard
```astro
<!-- In your admin dashboard -->
<div class="grid grid-cols-2 gap-6">
  <MasterIgnition client:only="react" />
  <EmergencyKillSwitch client:only="react" />
</div>

<div class="grid grid-cols-2 gap-6 mt-6">
  <RecoveryStation client:only="react" />
  <IntelligenceStream client:only="react" />
</div>
```

### 3. Test The Flow

#### **Normal Startup**
1. Click "MASTER_IGNITION"
2. Listen for voice announcements
3. Watch golden glow on Phase 4
4. Check Intelligence Stream for logs

#### **Emergency Halt**
1. Click "Arm_Kill_Switch"
2. Double-tap "Double_Tap_To_HALT"
3. See full-screen "HALTED" overlay
4. Check `work_log` for audit entry

#### **Post-Crash Recovery**
1. Click "INITIATE_FULL_RECOVERY"
2. Watch 6-stage progress (0-100%)
3. Listen for completion announcement
4. Verify "All systems nominal"

### 4. Monitor Heartbeat
The heartbeat auto-starts in dev mode and:
- Checks random station every 60s
- Logs to `work_log` table
- Auto-heals on connection failure
- Shows in Intelligence Stream

---

## Terminal Commands

### Xterm Terminal
- Type `help` - Show available commands
- Type `status` - Show factory status
- Type `clear` - Clear terminal
- Type `SELECT * FROM sites LIMIT 10;` - Run SQL

### Recovery Protocol (Manual SQL)
```bash
psql $DATABASE_URL -f src/lib/factory/awaken_recovery.sql
```

---

## Visual Hierarchy

**Station Categories** (with colors):
- `core` - Yellow (sites, campaigns)
- `content` - Blue (posts, pages, blocks)
- `intelligence` - Purple (avatars, avatar_intelligence, geo_intelligence)
- `location` - Emerald (states, counties, cities)
- `lead` - Pink (forms, submissions, conversions)
- `system` - Red (jobs, work_log, api_keys)
- `directus` - Gray (users, roles, fields, etc.)

---

## Troubleshooting

### Speech Not Working
- Browser blocks audio until first user interaction
- Check browser console for autoplay policy errors
- Click anywhere on page first, then try ignition

### Heartbeat Not Starting
- Check `src/lib/factory/index.ts` is imported somewhere
- Verify `MODE=development` in env
- Check terminal for "🔱 INITIALIZING_FACTORY_HEARTBEAT"

### Intelligence Stream Empty
- Ensure `work_log` table exists
- Check that logger is persisting to DB
- Verify God Mode API token is correct

### Xterm Not Loading
- Check CDN: `https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.min.css`
- Verify `xterm` and `xterm-addon-fit` are in package.json
- Check browser console for import errors

---

## Production Deployment

### Before Deploy
1. ✅ Clear Astro cache: `rm -rf .astro`
2. ✅ Test all 5 components
3. ✅ Verify 51 stations in registry
4. ✅ Run recovery protocol once
5. ✅ Check Intelligence Stream populates

### Environment Variables
```bash
GOD_TOKEN=your-token-here
PUBLIC_API_URL=https://your-domain.com/api
DATABASE_URL=postgres://...
```

### Disable Dev Heartbeat
In production, comment out auto-start:
```typescript
// src/lib/factory/index.ts
// if (import.meta.env.MODE === 'development') {
//   startHeartbeat();
// }
```

---

## Architecture Summary

```
┌──────────────────────────────────────┐
│   USER CLICKS MASTER IGNITION        │
└──────────────┬───────────────────────┘
               │
               v
┌──────────────────────────────────────┐
│   godMode.checkHealth()              │
│   godMode.executeSQL()               │
└──────────────┬──────────────────────┘
               │
               v
┌──────────────────────────────────────┐
│   Axios Interceptors Log Request     │
└──────────────┬───────────────────────┘
               │
               v
┌──────────────────────────────────────┐
│   Pino Logger → Terminal Output      │
│   logAwakening() → work_log Table    │
└──────────────┬───────────────────────┘
               │
               v
┌──────────────────────────────────────┐
│   Intelligence Stream Polls work_log │
│   Displays Real-time Factory Logs    │
└──────────────────────────────────────┘
```

---

**The AI Factory is ready for production deployment.**

🔱 51 Stations Monitored | Voice Enabled | Self-Healing | Full Audit Trail
