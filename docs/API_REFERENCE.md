# API REFERENCE: Spark Platform Endpoints

> **BLUF**: 30+ API endpoints organized by module. Public endpoints require no auth. Admin endpoints require Bearer token. God-mode requires X-God-Token header.

---

## 1. Authentication

### Header Format

```
Authorization: Bearer <DIRECTUS_ADMIN_TOKEN>
```

### God-Mode Header

```
X-God-Token: <GOD_MODE_TOKEN>
```

---

## 2. Public Endpoints (No Auth Required)

### 2.1 Lead Submission

**POST** `/api/lead`

Submit a lead form.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Contact name |
| email | string | Yes | Contact email |
| site_id | string | No | Originating site UUID |
| source | string | No | Lead source identifier |

**Request:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "site_id": "uuid-here",
    "source": "landing-page"
}
```

**Response:** `201 Created`
```json
{
    "success": true,
    "id": "lead-uuid"
}
```

---

### 2.2 Form Submission

**POST** `/api/forms/submit`

Submit a generic form.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| form_id | string | Yes | Form definition UUID |
| data | object | Yes | Form field values |

**Request:**
```json
{
    "form_id": "form-uuid",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "message": "Hello"
    }
}
```

**Response:** `201 Created`
```json
{
    "success": true,
    "submission_id": "submission-uuid"
}
```

---

### 2.3 Analytics Tracking

**POST** `/api/track/pageview`

Record a page view.

| Field | Type | Description |
|-------|------|-------------|
| site_id | string | Site UUID |
| page_path | string | URL path |
| session_id | string | Anonymous session |

**POST** `/api/track/event`

Record a custom event.

| Field | Type | Description |
|-------|------|-------------|
| site_id | string | Site UUID |
| event_name | string | Event identifier |
| page_path | string | URL path |

**POST** `/api/track/conversion`

Record a conversion.

| Field | Type | Description |
|-------|------|-------------|
| site_id | string | Site UUID |
| lead_id | string | Lead UUID |
| conversion_type | string | Conversion category |
| value | number | Monetary value |

---

## 3. SEO Engine Endpoints (Auth Required)

### 3.1 Headline Generation

**POST** `/api/seo/generate-headlines`

Generate headline permutations from spintax.

| Field | Type | Description |
|-------|------|-------------|
| campaign_id | string | Campaign UUID |
| spintax_root | string | Spintax template |
| limit | number | Max headlines (default: 1000) |

**Request:**
```json
{
    "campaign_id": "campaign-uuid",
    "spintax_root": "{Best|Top|Leading} {Dentist|Dental Clinic} in {City}",
    "limit": 100
}
```

**Response:**
```json
{
    "generated": 100,
    "headlines": [
        "Best Dentist in Austin",
        "Top Dental Clinic in Austin",
        ...
    ]
}
```

---

### 3.2 Article Generation

**POST** `/api/seo/generate-article`

Generate a single article.

| Field | Type | Description |
|-------|------|-------------|
| campaign_id | string | Campaign UUID |
| headline | string | Article headline |
| location | object | {city, state, county} |
| avatar_id | string | Target avatar UUID |

**Request:**
```json
{
    "campaign_id": "campaign-uuid",
    "headline": "Best Dentist in Austin",
    "location": {
        "city": "Austin",
        "state": "TX",
        "county": "Travis"
    },
    "avatar_id": "avatar-uuid"
}
```

**Response:**
```json
{
    "article_id": "article-uuid",
    "title": "Best Dentist in Austin",
    "content": "<html content>",
    "meta_title": "Best Dentist in Austin, TX | YourBrand",
    "meta_description": "Looking for..."
}
```

---

### 3.3 Batch Operations

**GET** `/api/seo/articles`

List generated articles.

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| site_id | string | Filter by site |
| campaign_id | string | Filter by campaign |
| status | string | Filter by status |
| limit | number | Results per page |
| offset | number | Pagination offset |

**POST** `/api/seo/approve-batch`

Approve multiple articles.

| Field | Type | Description |
|-------|------|-------------|
| article_ids | string[] | Article UUIDs to approve |

**POST** `/api/seo/publish-article`

Publish a single article.

| Field | Type | Description |
|-------|------|-------------|
| article_id | string | Article UUID |

---

### 3.4 Content Processing

**POST** `/api/seo/insert-links`

Insert internal links into article content.

| Field | Type | Description |
|-------|------|-------------|
| article_id | string | Article UUID |
| max_links | number | Maximum links to insert |
| min_distance | number | Minimum words between links |

**POST** `/api/seo/scan-duplicates`

Scan for duplicate content.

| Field | Type | Description |
|-------|------|-------------|
| site_id | string | Site to scan |
| threshold | number | Similarity threshold (0-1) |

---

### 3.5 Scheduling

**POST** `/api/seo/schedule-production`

Schedule article production.

| Field | Type | Description |
|-------|------|-------------|
| campaign_id | string | Campaign UUID |
| target_count | number | Articles to generate |
| velocity_mode | string | RAMP_UP, STEADY, SPIKES |
| start_date | string | ISO date |

**POST** `/api/seo/sitemap-drip`

Update sitemap visibility.

| Field | Type | Description |
|-------|------|-------------|
| site_id | string | Site UUID |
| batch_size | number | URLs per update |

---

### 3.6 Queue

**POST** `/api/seo/process-queue`

Process pending queue items.

| Field | Type | Description |
|-------|------|-------------|
| limit | number | Items to process |
| priority | string | Filter by priority |

**GET** `/api/seo/stats`

Get SEO statistics.

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| site_id | string | Filter by site |
| campaign_id | string | Filter by campaign |

---

## 4. Location Endpoints (Auth Required)

### 4.1 States

**GET** `/api/locations/states`

List all US states.

**Response:**
```json
[
    { "id": "uuid", "name": "Texas", "code": "TX" },
    { "id": "uuid", "name": "California", "code": "CA" },
    ...
]
```

### 4.2 Counties

**GET** `/api/locations/counties`

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| state | string | State UUID or code |

### 4.3 Cities

**GET** `/api/locations/cities`

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| county | string | County UUID |
| limit | number | Results (default: 50) |

---

## 5. Campaign Endpoints (Auth Required)

### 5.1 Campaigns CRUD

**GET** `/api/campaigns`

List campaigns.

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| site_id | string | Filter by site |
| status | string | Filter by status |

**POST** `/api/campaigns`

Create campaign.

| Field | Type | Description |
|-------|------|-------------|
| site_id | string | Site UUID |
| name | string | Campaign name |
| headline_spintax_root | string | Spintax template |
| target_word_count | number | Word count target |
| location_mode | string | city, county, state |

---

## 6. Admin Endpoints (Auth Required)

### 6.1 Import

**POST** `/api/admin/import-blueprint`

Import site from external source.

| Field | Type | Description |
|-------|------|-------------|
| source_url | string | WordPress URL |
| site_name | string | New site name |
| import_pages | boolean | Include pages |
| import_posts | boolean | Include posts |

### 6.2 Work Log

**GET** `/api/admin/worklog`

Get system activity log.

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| limit | number | Results per page |
| level | string | Filter by level |
| entity_type | string | Filter by entity |

### 6.3 Queue Status

**GET** `/api/admin/queues`

Get queue status.

**Response:**
```json
{
    "pending": 42,
    "processing": 5,
    "completed_today": 150,
    "failed_today": 3
}
```

---

## 7. Analytics Endpoints (Auth Required)

### 7.1 Dashboard

**GET** `/api/analytics/dashboard`

Get analytics summary.

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| site_id | string | Site UUID |
| start_date | string | ISO date |
| end_date | string | ISO date |

**Response:**
```json
{
    "pageviews": 1234,
    "unique_sessions": 567,
    "events": 89,
    "conversions": 12,
    "top_pages": [...],
    "trend": [...]
}
```

---

## 8. Intelligence Endpoints (Auth Required)

### 8.1 Patterns

**GET** `/api/intelligence/patterns`

Get Cartesian patterns.

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category |

---

## 9. Media Endpoints (Auth Required)

### 9.1 Templates

**GET** `/api/media/templates`

List image templates.

**POST** `/api/media/templates`

Create image template.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Template name |
| svg_content | string | SVG markup |
| variables | object | Token definitions |

---

## 10. Assembler Endpoints (Auth Required)

### 10.1 Preview

**POST** `/api/assembler/preview`

Preview assembled article.

| Field | Type | Description |
|-------|------|-------------|
| template_id | string | Template UUID |
| variables | object | Token values |

### 10.2 Templates

**GET** `/api/assembler/templates`

List assembly templates.

---

## 11. Factory Endpoints (Auth Required)

### 11.1 Send to Factory

**POST** `/api/factory/send-to-factory`

Queue content for processing.

| Field | Type | Description |
|-------|------|-------------|
| source | string | wordpress, manual |
| source_id | string | Source item ID |
| target_site_id | string | Destination site |

---

## 12. God-Mode Endpoints (Elevated Auth)

### 12.1 Schema Operations

**POST** `/god/schema/collections/create`

Create new collection.

**POST** `/god/schema/relations/create`

Create new relation.

**GET** `/god/schema/snapshot`

Export full schema YAML.

### 12.2 Data Operations

**POST** `/god/data/bulk-insert`

Insert multiple records.

| Field | Type | Description |
|-------|------|-------------|
| collection | string | Target collection |
| items | object[] | Records to insert |

---

## 13. Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - invalid input |
| 401 | Unauthorized - missing/invalid token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found - resource doesn't exist |
| 500 | Server Error - internal failure |

**Error Format:**
```json
{
    "error": true,
    "message": "Description of error",
    "code": "ERROR_CODE"
}
```
