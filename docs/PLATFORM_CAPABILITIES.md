# PLATFORM CAPABILITIES: Spark Feature Catalog

> **BLUF**: Spark contains 5 major modules with 27+ subcomponents. This document catalogs all functional capabilities.

---

## 1. Intelligence Library

**Purpose**: Centralized storage and management of content generation data assets.

**Location**: `/admin/intelligence/*`

### 1.1 Avatar Intelligence
| Feature | Function |
|---------|----------|
| Avatar Manager | CRUD operations for buyer personas |
| Stats Dashboard | 4 metric cards: total, by cluster, by gender, variants |
| Variant Generator | Creates male/female/neutral variations |
| Persona Editor | Psychographics, pain points, tech stack |

**Data Model**: `avatar_intelligence` → `avatar_variants`

### 1.2 Geo Intelligence
| Feature | Function |
|---------|----------|
| Interactive Map | Leaflet-based US map with markers |
| Cluster Manager | Group cities by wealth profile |
| City Stats | Population, landmarks, targeting data |
| Hybrid View | Map + List with synchronized filtering |

**Data Model**: `locations_states` → `locations_counties` → `locations_cities`

### 1.3 Spintax Dictionaries
| Feature | Function |
|---------|----------|
| Dictionary Manager | Category-organized word variations |
| Live Preview | Real-time spintax resolution testing |
| Import/Export | JSON batch operations |
| Test Spinner | Verify output distribution |

**Data Model**: `spintax_dictionaries` (legacy) mapped to new schema

### 1.4 Cartesian Patterns
| Feature | Function |
|---------|----------|
| Pattern Builder | Formula editor for title combinations |
| Dynamic Preview | Uses live Geo + Spintax data |
| Permutation Calculator | Shows total combination count |
| Pattern Library | Saved reusable formulas |

**Data Model**: `cartesian_patterns`

### 1.5 Offer Blocks
| Feature | Function |
|---------|----------|
| Block Editor | Rich text with token placeholders |
| Avatar Mapping | Match blocks to persona pain points |
| Token Preview | See rendered output |
| Template Library | Promotional content templates |

**Data Model**: `offer_blocks`

---

## 2. Content Factory

**Purpose**: Article production pipeline from queue to publication.

**Location**: `/admin/factory/*`

### 2.1 Kanban Board
| Column | Status | Actions |
|--------|--------|---------|
| Queued | `status: queued` | Prioritize, schedule |
| Processing | `status: processing` | Monitor, cancel |
| QC | `status: qc` | Review, approve |
| Approved | `status: approved` | Publish, hold |
| Published | `status: published` | Archive, analytics |

**Implementation**: @dnd-kit drag-and-drop library

### 2.2 Jobs Queue
| Feature | Function |
|---------|----------|
| Job Monitor | Real-time progress bars |
| Batch Status | Completion percentage |
| Retry Failed | Re-queue failed items |
| Job Details | Config, errors, timing |

**Data Model**: `generation_jobs`

### 2.3 Scheduler
| Feature | Function |
|---------|----------|
| Calendar View | Scheduled posts by date |
| Gaussian Distribution | Natural spacing algorithm |
| Bulk Schedule | Date range assignment |
| Velocity Modes | RAMP_UP, STEADY, SPIKES |

### 2.4 Campaign Wizard
| Mode | Description |
|------|-------------|
| Geo Mode | State → County → City selection |
| Spintax Mode | Variable template expansion |
| Hybrid Mode | Geographic + linguistic targeting |

**Data Model**: `campaign_masters`

### 2.5 Article Assembly
| Feature | Function |
|---------|----------|
| Fragment Composition | 6-pillar structure assembly |
| Token Replacement | `{{CITY}}`, `{{NICHE}}`, `{{AVATAR}}` |
| SEO Meta Generation | Title (60 char), Description (160 char) |
| Schema.org JSON-LD | Structured data insertion |

### 2.6 Bulk Operations
| Feature | Function |
|---------|----------|
| Bulk Grid | Multi-select with actions |
| Approve Batch | Mass status change |
| Publish Batch | Multi-article publication |
| Export | CSV/JSON data export |

**Data Model**: `generated_articles`

---

## 3. Launchpad (Site Builder)

**Purpose**: Multi-site management and page construction.

**Location**: `/admin/sites/*`

### 3.1 Site Manager
| Feature | Function |
|---------|----------|
| Site List | All tenant sites with stats |
| Site Creation | Domain, settings, defaults |
| Site Dashboard | Tabs: Pages, Nav, Theme |
| Site Analytics | Per-site metrics |

**Data Model**: `sites`

### 3.2 Page Builder
| Feature | Function |
|---------|----------|
| Block Editor | Visual block placement |
| Block Types | Hero, Content, Features, Gallery, FAQ, Form |
| Preview | Real-time rendering |
| JSON State | Block configuration storage |

**Block Types**:
| Block | Purpose |
|-------|---------|
| HeroBlock | Full-width header with CTA |
| RichTextBlock | SEO-optimized prose |
| ColumnsBlock | Multi-column layouts |
| MediaBlock | Images/videos with captions |
| StepsBlock | Numbered process visualization |
| QuoteBlock | Testimonials, blockquotes |
| GalleryBlock | Image grids |
| FAQBlock | Accordions with schema.org |
| PostsBlock | Blog listing layouts |
| FormBlock | Lead capture forms |

**Data Model**: `pages` (blocks stored as JSON in `blocks` field)

### 3.3 Navigation Editor
| Feature | Function |
|---------|----------|
| Menu Builder | Add/remove/sort links |
| Parent/Child | Hierarchical structure |
| Target Control | `_self`, `_blank` |
| Sort Order | Drag-drop reordering |

**Data Model**: `navigation`

### 3.4 Theme Settings
| Feature | Function |
|---------|----------|
| Color Palette | Primary, accent, background |
| Logo Upload | Site branding |
| Footer Config | Links, copyright |
| Font Selection | Typography settings |

**Data Model**: `globals` (site singleton)

---

## 4. SEO Engine

**Purpose**: Content optimization and search visibility tools.

**Location**: `/admin/seo/*`

### 4.1 Headline Generation
| Feature | Function |
|---------|----------|
| Spintax Input | Root template entry |
| Permutation Engine | Cartesian product calculation |
| Inventory Storage | Generated variations database |
| Deduplication | Unique output enforcement |

**Endpoint**: `POST /api/seo/generate-headlines`

### 4.2 Fragment Manager
| Feature | Function |
|---------|----------|
| 6-Pillar Structure | Intro, Keyword, Uniqueness, Relevance, Quality, Authority |
| Campaign Linking | Fragments per campaign |
| Variable Support | Token placeholders |
| Word Count Tracking | Target enforcement |

**Data Model**: `content_fragments`

### 4.3 Article Generator
| Feature | Function |
|---------|----------|
| Batch Generation | Configurable batch size |
| Progress Monitoring | Real-time job updates |
| Queue Integration | BullMQ backend |
| Error Handling | Retry logic, logging |

**Endpoint**: `POST /api/seo/generate-article`

### 4.4 Link Insertion
| Feature | Function |
|---------|----------|
| Anchor Text Mapping | Keyword → URL pairs |
| Proximity Rules | Min distance between links |
| Density Control | Max links per article |
| Internal Link Graph | Hub → child relationships |

**Endpoint**: `POST /api/seo/insert-links`

**Data Model**: `link_targets`

### 4.5 Duplicate Detection
| Feature | Function |
|---------|----------|
| Content Hashing | Similarity scoring |
| Threshold Config | Match percentage |
| Conflict Resolution | Merge, delete, ignore |
| Scan Reports | Duplicate groups |

**Endpoint**: `POST /api/seo/scan-duplicates`

### 4.6 Sitemap Drip
| Feature | Function |
|---------|----------|
| Status Stages | ghost → queued → indexed |
| Exposure Schedule | Configurable timing |
| Batch Control | URLs per update |
| XML Generation | sitemap.xml output |

**Endpoint**: `POST /api/seo/sitemap-drip`

### 4.7 Queue Processor
| Feature | Function |
|---------|----------|
| FIFO Processing | First-in first-out |
| Priority Override | Urgent item boost |
| Parallel Workers | Configurable concurrency |
| Dead Letter Queue | Failed item handling |

**Endpoint**: `POST /api/seo/process-queue`

### 4.8 Statistics
| Feature | Function |
|---------|----------|
| Article Counts | By status, site, campaign |
| Generation Velocity | Articles per time period |
| Queue Depth | Pending item count |
| Error Rate | Failure percentage |

**Endpoint**: `GET /api/seo/stats`

---

## 5. Analytics

**Purpose**: User behavior tracking and metrics aggregation.

**Location**: `/admin/analytics/*`

### 5.1 Dashboard
| Feature | Function |
|---------|----------|
| Metrics Cards | Pageviews, events, conversions |
| Time Range | Day, week, month, custom |
| Site Filter | Per-tenant isolation |
| Trend Charts | Historical comparison |

**Endpoint**: `GET /api/analytics/dashboard`

### 5.2 Event Tracking
| Feature | Function |
|---------|----------|
| Custom Events | Named action logging |
| Page Path | URL association |
| Session Linking | User journey |
| Timestamp | UTC standardized |

**Endpoint**: `POST /api/track/event`

**Data Model**: `events`

### 5.3 Pageview Tracking
| Feature | Function |
|---------|----------|
| Path Logging | URL capture |
| Session ID | Anonymous user grouping |
| Referrer | Traffic source |
| Device Info | User agent parsing |

**Endpoint**: `POST /api/track/pageview`

**Data Model**: `pageviews`

### 5.4 Conversion Tracking
| Feature | Function |
|---------|----------|
| Lead Linking | Form → conversion |
| Conversion Type | Category classification |
| Value Assignment | Monetary attribution |
| Source Tracking | Campaign attribution |

**Endpoint**: `POST /api/track/conversion`

**Data Model**: `conversions`

---

## 6. Lead Capture

**Purpose**: Form submission handling and lead management.

### 6.1 Form Builder
| Feature | Function |
|---------|----------|
| Field Types | Text, email, select, textarea |
| Validation Rules | Required, pattern, min/max |
| Submit Actions | Webhook, email, store |
| Success Config | Message, redirect |

**Data Model**: `forms`

### 6.2 Submission Handler
| Feature | Function |
|---------|----------|
| Data Storage | JSON field storage |
| Spam Filtering | Honeypot, rate limiting |
| Notification | Email alerts |
| Integration | Webhook dispatch |

**Endpoint**: `POST /api/forms/submit`

**Data Model**: `form_submissions`

### 6.3 Lead Management
| Feature | Function |
|---------|----------|
| Lead List | Filterable table |
| Status Workflow | New → Contacted → Qualified → Converted |
| Export | CSV download |
| Source Tracking | Origin capture |

**Data Model**: `leads`

---

## 7. System Administration

### 7.1 Work Log
| Feature | Function |
|---------|----------|
| Activity Stream | All system actions |
| Entity Linking | What was affected |
| User Attribution | Who performed action |
| Level Filtering | Debug, info, warning, error |

**Data Model**: `work_log`

### 7.2 Test Suite
| Feature | Function |
|---------|----------|
| Connection Tests | Directus API health |
| Schema Validation | Collection verification |
| Permission Check | Role access testing |
| Performance Metrics | Response timing |

**Location**: `/admin/testing/*`

### 7.3 Settings Manager
| Feature | Function |
|---------|----------|
| API Configuration | URLs, tokens |
| Queue Settings | Concurrency, retry |
| Cache Control | TTL, invalidation |
| Feature Flags | Enable/disable modules |

**Location**: `/admin/settings`
