# Content Generation Engine - API Documentation

## 🎯 Overview

The Content Generation Engine takes JSON blueprints containing spintax and variables, generates unique combinations via Cartesian expansion, resolves spintax to create unique variations, and produces full 2000-word articles.

## 📡 API Endpoints

### 1. Create Campaign
**POST** `/api/god/campaigns/create`

Creates a new campaign from a JSON blueprint.

**Headers:**
```
X-God-Token: <your_god_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Campaign Name (optional)",
  "blueprint": {
    "asset_name": "{{CITY}} Solar Revenue",
    "deployment_target": "High-Value Funnel",
    "variables": {
      "STATE": "California",
      "CITY": "San Diego|Irvine|Anaheim",
      "AVATAR_A": "Solar CEO"
    },
    "content": {
      "url_path": "{{CITY}}.example.com",
      "meta_description": "{Stop|Eliminate} waste in {{CITY}}",
      "body": [
        {
          "block_type": "Hero",
          "content": "<h1>{Title A|Title B}</h1><p>Content for {{CITY}}</p>"
        }
      ]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "campaignId": "uuid",
  "message": "Campaign created. Use /launch/<id> to generate."
}
```

---

### 2. Launch Campaign
**POST** `/api/god/campaigns/launch/:id`

Queues a campaign for content generation.

**Headers:**
```
X-God-Token: <your_god_token>
```

**Response:**
```json
{
  "success": true,
  "campaignId": "uuid",
  "status": "processing"
}
```

---

### 3. Check Status
**GET** `/api/god/campaigns/status/:id`

Get campaign generation status and stats.

**Headers:**
```
X-God-Token: <your_god_token>
```

**Response:**
```json
{
  "campaignId": "uuid",
  "name": "Campaign Name",
  "status": "completed",
  "postsCreated": 15,
  "blockUsage": [
    { "block_type": "Hero", "total_uses": 15 }
  ]
}
```

---

## 🎨 Blueprint Structure

### Variables
Pipe-separated values generate Cartesian products:
```json
{
  "CITY": "A|B|C",     // 3 values
  "STATE": "X|Y"       // 2 values
  // = 6 total combinations
}
```

### Spintax Syntax
```
{Option A|Option B|Option C}
```

### Variable Placeholders
```
{{VARIABLE_NAME}}
```

## 📊 Usage Tracking

Every block use and spintax choice is tracked:
- `block_usage_stats` - How many times each block was used
- `spintax_variation_stats` - Which spintax choices were selected
- `variation_registry` - Hash of every unique variation

## 🔧 Worker Process

The BullMQ worker (`contentGenerator.ts`):
1. Fetches blueprint from DB
2. Generates Cartesian product of variables
3. For each combination:
   - Expands `{{VARIABLES}}`
   - Resolves `{spin|tax}`
   - Checks uniqueness hash
   - Creates post in DB
   - Records variation & updates stats

## 🚀 Quick Start

### Via UI
1. Go to `/admin/content-generator`
2. Paste JSON blueprint
3. Click "Create Campaign"
4. Launch from campaigns list

### Via API
```bash
# 1. Create
curl -X POST https://spark.jumpstartscaling.com/api/god/campaigns/create \
  -H "X-God-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @blueprint.json

# 2. Launch
curl -X POST https://spark.jumpstartscaling.com/api/god/campaigns/launch/CAMPAIGN_ID \
  -H "X-God-Token: YOUR_TOKEN"

# 3. Check status
curl https://spark.jumpstartscaling.com/api/god/campaigns/status/CAMPAIGN_ID \
  -H "X-God-Token: YOUR_TOKEN"
```

## 📦 Database Schema

Key tables:
- `campaign_masters` - Stores blueprints
- `content_fragments` - Individual blocks
- `variation_registry` - Unique variations
- `block_usage_stats` - Block usage counts
- `posts` - Final generated content
