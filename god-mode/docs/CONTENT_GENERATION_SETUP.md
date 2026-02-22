# Content Generation System - Complete Setup Guide

## 🎯 System Overview

The Content Generation Engine is now fully implemented with:
- **Spintax Resolution:** Handles `{A|B|C}` syntax
- **Variable Expansion:** Cartesian products of `{{VARIABLES}}`
- **Uniqueness Tracking:** Prevents duplicate variations
- **Usage Stats:** Tracks block/variation usage
- **Full Article Generation:** 2000-word articles from templates

## 📦 Components Built

### 1. Database Schema (`migrations/02_content_generation.sql`)
- `variation_registry` - Track unique combinations
- `block_usage_stats` - Block usage counts
- `spintax_variation_stats` - Spintax choice tracking
- Enhanced `avatars`, `campaign_masters`, `content_fragments`

### 2. Spintax Engine (`src/lib/spintax/resolver.ts`)
- `SpintaxResolver` - Resolves `{A|B|C}` deterministically
- `expandVariables()` - Replaces `{{CITY}}` etc
- `generateCartesianProduct()` - All variable combinations

### 3. API Endpoints
- `POST /api/god/campaigns/create` - Submit blueprints
- `POST /api/god/campaigns/launch/:id` - Queue generation
- `GET /api/god/campaigns/status/:id` - Check progress

### 4. BullMQ Worker (`src/workers/contentGenerator.ts`)
- Fetches campaign blueprints
- Generates Cartesian combinations
- Resolves spintax for each
- Creates posts in DB
- Records all usage stats

### 5. Admin UI (`/admin/content-generator`)
- Submit JSON blueprints
- View active campaigns
- Monitor generation stats

## 🚀 Quick Start

### Step 1: Apply Database Schema
```bash
# On your server (where DATABASE_URL is set)
psql $DATABASE_URL -f migrations/02_content_generation.sql
```

### Step 2: Start the Worker
```bash
# In a separate terminal/process
npm run worker
```

### Step 3: Submit a Campaign

**Via UI:**
1. Go to `https://spark.jumpstartscaling.com/admin/content-generator`
2. Click "Load Example"
3. Click "Create Campaign"
4. Launch from campaigns list

**Via API:**
```bash
curl -X POST https://spark.jumpstartscaling.com/api/god/campaigns/create \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Solar Test",
    "blueprint": {
      "asset_name": "{{CITY}} Solar",
      "variables": {
        "CITY": "Miami|Tampa",
        "STATE": "Florida"
      },
      "content": {
        "url_path": "{{CITY}}.solar.com",
        "meta_description": "{Stop|Eliminate} waste in {{CITY}}",
        "body": [
          {
            "block_type": "Hero",
            "content": "<h1>{Title A|Title B} for {{CITY}}</h1>"
          }
        ]
      }
    }
  }'

# Launch it
curl -X POST https://spark.jumpstartscaling.com/api/god/campaigns/launch/CAMPAIGN_ID \
  -H "X-God-Token: YOUR_TOKEN"
```

## 📊 How It Works

### 1. Blueprint Submission
User submits JSON with:
- Variables: `"CITY": "A|B|C"` creates 3 options
- Spintax: `{option1|option2}` in content
- Blocks: Array of content sections

### 2. Cartesian Expansion
```
CITY: "Miami|Tampa" (2 options)
STATE: "FL|CA" (2 options)
= 4 total combinations
```

### 3. Spintax Resolution
For each combination:
- Replace `{{CITY}}` → "Miami"
- Resolve `{Stop|Eliminate}` → "Stop" (deterministic)
- Generate hash of choices for uniqueness

### 4. Post Creation
- Check if variation hash exists
- If unique: Create post in DB
- Record variation + update stats
- Continue to next combination

## 📈 Usage Tracking

All usage is tracked automatically:

**Blocks:**
```sql
SELECT block_type, total_uses 
FROM block_usage_stats 
ORDER BY total_uses DESC;
```

**Vari ations:**
```sql
SELECT variation_path, variation_text, use_count
FROM spintax_variation_stats
ORDER BY use_count DESC;
```

**Created Posts:**
```sql
SELECT COUNT(*) FROM variation_registry WHERE campaign_id = 'YOUR_ID';
```

## 🔧 Testing

Test the full system:
```bash
npm run test:campaign
```

This will:
1. Create a test campaign
2. Queue 2 jobs (San Diego, Irvine)
3. Worker processes them
4. Check `posts` table for results

## ⚙️ Configuration

Required environment variables:
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GOD_TOKEN=your_secret_token
```

## 🎨 Blueprint Examples

See `CONTENT_GENERATION_API.md` for full examples and all the JSON blueprints you provided (Solar, Roofing, HVAC, MedSpa, etc.)

## ✅ Phase 6: Quality Checklist

- [x] Schema created with usage tracking
- [x] Spintax resolver handles nested syntax
- [x] Variables expand correctly
- [x] Cartesian products generate all combinations
- [x] Uniqueness prevents duplicates
- [x] Worker processes jobs asynchronously
- [x] API endpoints secured with GOD_TOKEN
- [x] UI allows blueprint submission
- [x] Usage stats track everything
- [x] Documentation complete
- [x] Build succeeds
- [x] Code pushed to Git

## 🚢 Deployment

Your code is already pushed to main. To deploy:

1. **Apply schema:**
   ```bash
   ssh your-server
   cd /path/to/spark
   psql $DATABASE_URL -f god-mode/migrations/02_content_generation.sql
   ```

2. **Start worker:**
   Add to your process manager (PM2, systemd, etc):
   ```bash
   cd god-mode && npm run worker
   ```

3. **Test:**
   ```bash
   npm run test:campaign
   ```

## 📞 Ready to Use

Your API is ready! Test it:
```bash
curl https://spark.jumpstartscaling.com/admin/content-generator
```

All the JSON blueprints you provided are ready to be submitted and will generate thousands of unique articles with full spintax resolution and usage tracking!
