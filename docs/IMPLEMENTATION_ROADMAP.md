# 🎯 SPARK PLATFORM - COMPLETE IMPLEMENTATION ROADMAP

**Priority**: Make Intelligence Library fully interactive + All collections working  
**Format**: Milestones → Tasks → Commands to build structure

---

## 🔥 MILESTONE 1: INTELLIGENCE LIBRARY - FULL CRUD (TOP PRIORITY)

**Goal**: All 5 Intelligence Library pages fully editable with stats and cool UX

### Current Status:
- ✅ Pages exist and load data
- ❌ Not editable (read-only)
- ❌ No stats/analytics
- ❌ No "Send to Engine" buttons
- ❌ Basic UI (not cool experience)

### Tasks for Milestone 1:

#### Task 1.1: Avatar Intelligence - Full CRUD ✅ (COMPLETED)
**What Was Built**:
- ✅ Fully interactive manager component
- ✅ Real-time stats dashboard (4 metric cards)
- ✅ Search functionality
- ✅ Beautiful card grid with animations
- ✅ Edit/Delete actions
- ✅ "Generate Variants" button


**Files to Create**:
```bash
# Create these files:
frontend/src/components/admin/intelligence/AvatarIntelligenceManager.tsx
frontend/src/components/admin/intelligence/AvatarCard.tsx
frontend/src/components/admin/intelligence/AvatarEditModal.tsx
frontend/src/components/admin/intelligence/AvatarStats.tsx
```

**Command to Build Structure**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
mkdir -p components/admin/intelligence
touch components/admin/intelligence/AvatarIntelligenceManager.tsx
touch components/admin/intelligence/AvatarCard.tsx
touch components/admin/intelligence/AvatarEditModal.tsx
touch components/admin/intelligence/AvatarStats.tsx
touch components/admin/intelligence/GenerateVariantsModal.tsx
```

---

#### Task 1.2: Avatar Variants - Full CRUD ✅ (COMPLETED)
**What Was Built**:
- ✅ Grouped variants by avatar (Accordion view)
- ✅ Stats: Gender breakdown, total variants
- ✅ Visuals: Color-coded badges, DNA style UI
- ✅ Actions: Clone, Test, Delete


**Files to Create**:
```bash
# Create these files:
frontend/src/components/admin/intelligence/AvatarVariantsManager.tsx
frontend/src/components/admin/intelligence/VariantCard.tsx
frontend/src/components/admin/intelligence/VariantEditModal.tsx
frontend/src/components/admin/intelligence/VariantPreview.tsx
```

**Command to Build Structure**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
touch components/admin/intelligence/AvatarVariantsManager.tsx
touch components/admin/intelligence/VariantCard.tsx
touch components/admin/intelligence/VariantEditModal.tsx
touch components/admin/intelligence/VariantPreview.tsx
```

---

#### Task 1.3: Geo Intelligence - Full CRUD ✅ (COMPLETED)
**What Was Built**:
- ✅ Interactive Map (React Leaflet)
- ✅ Hybrid View: Map + List synced filtering
- ✅ Stats: Market penetration, coverage area
- ✅ Actions: Target location, cluster management


**Files to Create**:
```bash
# Create these files:
frontend/src/components/admin/intelligence/GeoIntelligenceManager.tsx
frontend/src/components/admin/intelligence/GeoMap.tsx
frontend/src/components/admin/intelligence/ClusterCard.tsx
frontend/src/components/admin/intelligence/LocationEditModal.tsx
frontend/src/components/admin/intelligence/GeoStats.tsx
```

**Command to Build Structure**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
touch components/admin/intelligence/GeoIntelligenceManager.tsx
touch components/admin/intelligence/GeoMap.tsx
touch components/admin/intelligence/ClusterCard.tsx
touch components/admin/intelligence/LocationEditModal.tsx
touch components/admin/intelligence/GeoStats.tsx
```

---

#### Task 1.4: Spintax Dictionaries - Full CRUD ✅ (COMPLETED)
**What Was Built**:
- ✅ Interactive Spintax Manager (React)
- ✅ Live "Test Spintax" preview
- ✅ Mapped to new Directus fields (base_word, data)
- ✅ Import/Export capabilities (via page actions)


**Files to Create**:
```bash
# Create these files:
frontend/src/components/admin/intelligence/SpintaxManager.tsx
frontend/src/components/admin/intelligence/SpintaxCategory.tsx
frontend/src/components/admin/intelligence/SpintaxEditModal.tsx
frontend/src/components/admin/intelligence/SpintaxPreview.tsx
frontend/src/components/admin/intelligence/SpintaxImport.tsx
```

**Command to Build Structure**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
touch components/admin/intelligence/SpintaxManager.tsx
touch components/admin/intelligence/SpintaxCategory.tsx
touch components/admin/intelligence/SpintaxEditModal.tsx
touch components/admin/intelligence/SpintaxPreview.tsx
touch components/admin/intelligence/SpintaxImport.tsx
```

---

#### Task 1.5: Cartesian Patterns - Full CRUD ✅ (COMPLETED)
**What Was Built**:
- ✅ Interactive Cartesian Manager
- ✅ Pattern Builder with Formula Editor
- ✅ Dynamic Preview (uses real Geo/Spintax data)
- ✅ Create/Edit/Delete functionality


**Files to Create**:
```bash
# Create these files:
frontend/src/components/admin/intelligence/CartesianManager.tsx
frontend/src/components/admin/intelligence/PatternCard.tsx
frontend/src/components/admin/intelligence/PatternEditModal.tsx
frontend/src/components/admin/intelligence/PatternBuilder.tsx
frontend/src/components/admin/intelligence/PatternPreview.tsx
```

**Command to Build Structure**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
touch components/admin/intelligence/CartesianManager.tsx
touch components/admin/intelligence/PatternCard.tsx
touch components/admin/intelligence/PatternEditModal.tsx
touch components/admin/intelligence/PatternBuilder.tsx
touch components/admin/intelligence/PatternPreview.tsx
```

---

### Milestone 1 - Complete Build Command:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src

# Create intelligence components directory
mkdir -p components/admin/intelligence

# Avatar Intelligence
touch components/admin/intelligence/AvatarIntelligenceManager.tsx
touch components/admin/intelligence/AvatarCard.tsx
touch components/admin/intelligence/AvatarEditModal.tsx
touch components/admin/intelligence/AvatarStats.tsx
touch components/admin/intelligence/GenerateVariantsModal.tsx

# Avatar Variants
touch components/admin/intelligence/AvatarVariantsManager.tsx
touch components/admin/intelligence/VariantCard.tsx
touch components/admin/intelligence/VariantEditModal.tsx
touch components/admin/intelligence/VariantPreview.tsx

# Geo Intelligence
touch components/admin/intelligence/GeoIntelligenceManager.tsx
touch components/admin/intelligence/GeoMap.tsx
touch components/admin/intelligence/ClusterCard.tsx
touch components/admin/intelligence/LocationEditModal.tsx
touch components/admin/intelligence/GeoStats.tsx

# Spintax
touch components/admin/intelligence/SpintaxManager.tsx
touch components/admin/intelligence/SpintaxCategory.tsx
touch components/admin/intelligence/SpintaxEditModal.tsx
touch components/admin/intelligence/SpintaxPreview.tsx
touch components/admin/intelligence/SpintaxImport.tsx

# Cartesian Patterns
touch components/admin/intelligence/CartesianManager.tsx
touch components/admin/intelligence/PatternCard.tsx
touch components/admin/intelligence/PatternEditModal.tsx
touch components/admin/intelligence/PatternBuilder.tsx
touch components/admin/intelligence/PatternPreview.tsx

echo "✅ Milestone 1 file structure created!"
```

---

## 🎯 MILESTONE 2: CONTENT FACTORY - KANBAN & FORMS

**Goal**: Kanban board working, forms for leads, editable tables with stats

### Current Status:
- ❌ Kanban board not visible/working
- ❌ No lead forms
- ❌ Tables are read-only
- ❌ No "Send to Engine" functionality
- ❌ No scheduler integration

### Tasks for Milestone 2:

#### Task 2.1: Kanban Board - Full Implementation ✅ (COMPLETED)
**What Was Built**:
- ✅ Drag-and-Drop Kanban Board (@dnd-kit)
- ✅ Columns: Queued → Processing → QC → Approved → Published
- ✅ Cards with Priority, Assignee, Status
- ✅ Directus Backend Schema Integration
- ✅ Fixed Preview URL Integration
- ✅ "New Article" flow connected


**Files to Create**:
```bash
frontend/src/components/admin/factory/KanbanBoard.tsx
frontend/src/components/admin/factory/KanbanColumn.tsx
frontend/src/components/admin/factory/ArticleCard.tsx
frontend/src/components/admin/factory/CardActions.tsx
frontend/src/components/admin/factory/BulkActions.tsx
```

**Command**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
mkdir -p components/admin/factory
touch components/admin/factory/KanbanBoard.tsx
touch components/admin/factory/KanbanColumn.tsx
touch components/admin/factory/ArticleCard.tsx
touch components/admin/factory/CardActions.tsx
touch components/admin/factory/BulkActions.tsx
```

---

#### Task 2.2: Lead Forms & Management ✅ (COMPLETED)
**What Was Built**:
- ✅ Leads Collection in Directus (Status, Source, Niche)
- ✅ Leads Manager UI (Table, Add/Edit Modal)
- ✅ Status Workflow (New -> Converted)
- ✅ /admin/leads page

**What to Build**:
- Lead capture forms
- Editable leads table
- Stats: Total leads, by source, conversion rate
- "Send to Campaign" button → Add to campaign
- "Export Leads" button → CSV export
- Cool UX: Form builder, drag-drop fields, validation

**Files to Create**:
```bash
frontend/src/components/admin/leads/LeadManager.tsx
frontend/src/components/admin/leads/LeadForm.tsx
frontend/src/components/admin/leads/LeadTable.tsx
frontend/src/components/admin/leads/LeadStats.tsx
frontend/src/components/admin/leads/LeadExport.tsx
frontend/src/pages/admin/leads/index.astro
```

**Command**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
mkdir -p components/admin/leads
mkdir -p pages/admin/leads
touch components/admin/leads/LeadManager.tsx
touch components/admin/leads/LeadForm.tsx
touch components/admin/leads/LeadTable.tsx
touch components/admin/leads/LeadStats.tsx
touch components/admin/leads/LeadExport.tsx
touch pages/admin/leads/index.astro
```

---

#### Task 2.3: Generation Jobs - Table with Actions
**What to Build**:
- Editable jobs table
- Stats: Total jobs, by status, success rate
- "Retry Failed" button
- "Cancel Job" button
- "View Details" modal → Show job config, errors
- Cool UX: Status badges, progress bars, real-time updates

**Files to Create**:
```bash
frontend/src/components/admin/jobs/JobsManager.tsx
frontend/src/components/admin/jobs/JobTable.tsx
frontend/src/components/admin/jobs/JobStats.tsx
frontend/src/components/admin/jobs/JobDetails.tsx
frontend/src/components/admin/jobs/JobActions.tsx
```

**Command**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
mkdir -p components/admin/jobs
touch components/admin/jobs/JobsManager.tsx
touch components/admin/jobs/JobTable.tsx
touch components/admin/jobs/JobStats.tsx
touch components/admin/jobs/JobDetails.tsx
touch components/admin/jobs/JobActions.tsx
```

---

#### Task 2.4: Scheduler Integration
**What to Build**:
- Calendar view for scheduled posts
- Drag-drop to reschedule
- "Schedule Post" button on articles
- Stats: Posts scheduled, by date, by site
- Cool UX: Calendar with drag-drop, time picker, bulk scheduling

**Files to Create**:
```bash
frontend/src/components/admin/scheduler/SchedulerCalendar.tsx
frontend/src/components/admin/scheduler/ScheduleModal.tsx
frontend/src/components/admin/scheduler/ScheduleStats.tsx
frontend/src/components/admin/scheduler/BulkSchedule.tsx
frontend/src/pages/admin/scheduler/index.astro
```

**Command**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
mkdir -p components/admin/scheduler
mkdir -p pages/admin/scheduler
touch components/admin/scheduler/SchedulerCalendar.tsx
touch components/admin/scheduler/ScheduleModal.tsx
touch components/admin/scheduler/ScheduleStats.tsx
touch components/admin/scheduler/BulkSchedule.tsx
touch pages/admin/scheduler/index.astro
```

---

### Milestone 2 - Complete Build Command:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src

# Kanban Board (already built)
mkdir -p components/admin/factory

# Leads
mkdir -p components/admin/leads
mkdir -p pages/admin/leads
touch components/admin/leads/LeadManager.tsx
touch components/admin/leads/LeadForm.tsx
touch components/admin/leads/LeadTable.tsx
touch components/admin/leads/LeadStats.tsx
touch components/admin/leads/LeadExport.tsx
touch pages/admin/leads/index.astro

# Jobs
mkdir -p components/admin/jobs
touch components/admin/jobs/JobsManager.tsx
touch components/admin/jobs/JobTable.tsx
touch components/admin/jobs/JobStats.tsx
touch components/admin/jobs/JobDetails.tsx
touch components/admin/jobs/JobActions.tsx

# Scheduler
mkdir -p components/admin/scheduler
mkdir -p pages/admin/scheduler
touch components/admin/scheduler/SchedulerCalendar.tsx
touch components/admin/scheduler/ScheduleModal.tsx
touch components/admin/scheduler/ScheduleStats.tsx
touch components/admin/scheduler/BulkSchedule.tsx
touch pages/admin/scheduler/index.astro

echo "✅ Milestone 2 file structure created!"
```

---

## 🎯 MILESTONE 3: ALL COLLECTIONS - PAGES & CRUD

**Goal**: Every Directus collection has a working admin page

### Collections Needing Pages:

#### Task 3.1: Content Collections ✅ (COMPLETED)
**What Was Built**:
- ✅ GenericCollectionManager (reused for CRUD)
- ✅ /admin/collections/page-blocks
- ✅ /admin/collections/offer-blocks
- ✅ /admin/collections/headline-inventory
- ✅ /admin/collections/content-fragments

#### Task 3.2: Site & Content Management ✅ (COMPLETED via M4)
- See Milestone 4.

#### Task 3.3: Campaign & Scheduler ✅ (COMPLETED)
**What Was Built**:
- ✅ Campaigns Collection & Schema
- ✅ Scheduler Dashboard
- ✅ Campaign Wizard (Geo & Spintax Modes)


---

## 🎯 MILESTONE 4: LAUNCHPAD - SITE BUILDER

**Goal**: Build a fully functional site builder for managing sites, pages, navigation, and global settings.

#### Task 4.1: Sites Manager & Dashboard ✅ (COMPLETED)
**What Was Built**:
- ✅ Sites Collection & Manager
- ✅ Site Dashboard with Tabs (Pages, Nav, Theme)
- ✅ Launchpad Schema Setup

#### Task 4.2: Page Builder ✅ (COMPLETED)
**What Was Built**:
- ✅ Block-based Page Editor (Hero, Content, Features)
- ✅ Real-time JSON state management
- ✅ Draft/Published status workflow
- ✅ /admin/sites/editor/[id]

#### Task 4.3: Navigation & Globals ✅ (COMPLETED)
**What Was Built**:
- ✅ Navigation Editor (Add/Sort links)
- ✅ Theme Settings (Colors, Logo, Footer)
- ✅ Global singleton schema

#### Task 4.4: Launchpad Frontend ✅ (COMPLETED)
**What Was Built**:
- ✅ Frontend Engine (`[...slug].astro`)
- ✅ Block Renderer (Hero, Content, Features)
- ✅ Public & Preview Routing
- ✅ Dynamic Meta Tags & SEO

---

#### Task 3.3: Campaign & Work Log
**Collections**:
- Campaign Masters
- Work Log

**Files to Create**:
```bash
frontend/src/pages/admin/campaigns/index.astro
frontend/src/pages/admin/system/work-log.astro
frontend/src/components/admin/campaigns/CampaignManager.tsx
frontend/src/components/admin/system/WorkLogViewer.tsx
```

**Command**:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src
mkdir -p pages/admin/campaigns
mkdir -p pages/admin/system
mkdir -p components/admin/campaigns
mkdir -p components/admin/system
touch pages/admin/campaigns/index.astro
touch pages/admin/system/work-log.astro
touch components/admin/campaigns/CampaignManager.tsx
touch components/admin/system/WorkLogViewer.tsx
```

---

### Milestone 3 - Complete Build Command:
```bash
cd /Users/christopheramaya/Downloads/spark/frontend/src

# Content Collections
touch pages/admin/collections/page-blocks.astro
touch pages/admin/collections/content-fragments.astro
touch pages/admin/collections/headline-inventory.astro
touch pages/admin/collections/offer-blocks.astro
touch components/admin/collections/PageBlocksManager.tsx
touch components/admin/collections/FragmentsManager.tsx
touch components/admin/collections/HeadlinesManager.tsx
touch components/admin/collections/OffersManager.tsx

# Sites & Content
mkdir -p pages/admin/sites
mkdir -p components/admin/sites
mkdir -p components/admin/content
touch pages/admin/sites/index.astro
touch pages/admin/content/posts.astro
touch pages/admin/content/pages.astro
touch components/admin/sites/SitesManager.tsx
touch components/admin/content/PostsManager.tsx
touch components/admin/content/PagesManager.tsx
touch components/admin/content/ArticlesManager.tsx

# Campaigns & Logs
mkdir -p pages/admin/campaigns
mkdir -p pages/admin/system
mkdir -p components/admin/campaigns
mkdir -p components/admin/system
touch pages/admin/campaigns/index.astro
touch pages/admin/system/work-log.astro
touch components/admin/campaigns/CampaignManager.tsx
touch components/admin/system/WorkLogViewer.tsx

echo "✅ Milestone 3 file structure created!"
```

---

## 🚀 COMPLETE BUILD COMMAND (ALL MILESTONES)

```bash
#!/bin/bash

cd /Users/christopheramaya/Downloads/spark/frontend/src

echo "🏗️  Building complete Spark Platform file structure..."

# Create all directories
mkdir -p components/admin/intelligence
mkdir -p components/admin/factory
mkdir -p components/admin/leads
mkdir -p components/admin/jobs
mkdir -p components/admin/scheduler
mkdir -p components/admin/collections
mkdir -p components/admin/sites
mkdir -p components/admin/content
mkdir -p components/admin/campaigns
mkdir -p components/admin/system
mkdir -p pages/admin/leads
mkdir -p pages/admin/scheduler
mkdir -p pages/admin/sites
mkdir -p pages/admin/campaigns
mkdir -p pages/admin/system

# MILESTONE 1: Intelligence Library
echo "📚 Creating Intelligence Library components..."
touch components/admin/intelligence/{AvatarIntelligenceManager,AvatarCard,AvatarEditModal,AvatarStats,GenerateVariantsModal}.tsx
touch components/admin/intelligence/{AvatarVariantsManager,VariantCard,VariantEditModal,VariantPreview}.tsx
touch components/admin/intelligence/{GeoIntelligenceManager,GeoMap,ClusterCard,LocationEditModal,GeoStats}.tsx
touch components/admin/intelligence/{SpintaxManager,SpintaxCategory,SpintaxEditModal,SpintaxPreview,SpintaxImport}.tsx
touch components/admin/intelligence/{CartesianManager,PatternCard,PatternEditModal,PatternBuilder,PatternPreview}.tsx

# MILESTONE 2: Factory & Forms
echo "🏭 Creating Factory components..."
touch components/admin/factory/{KanbanBoard,KanbanColumn,ArticleCard,CardActions,BulkActions}.tsx
touch components/admin/leads/{LeadManager,LeadForm,LeadTable,LeadStats,LeadExport}.tsx
touch pages/admin/leads/index.astro
touch components/admin/jobs/{JobsManager,JobTable,JobStats,JobDetails,JobActions}.tsx
touch components/admin/scheduler/{SchedulerCalendar,ScheduleModal,ScheduleStats,BulkSchedule}.tsx
touch pages/admin/scheduler/index.astro

# MILESTONE 3: All Collections
echo "📦 Creating Collection pages..."
touch pages/admin/collections/{page-blocks,content-fragments,headline-inventory,offer-blocks}.astro
touch components/admin/collections/{PageBlocksManager,FragmentsManager,HeadlinesManager,OffersManager}.tsx
touch pages/admin/sites/index.astro
touch pages/admin/content/{posts,pages}.astro
touch components/admin/sites/SitesManager.tsx
touch components/admin/content/{PostsManager,PagesManager,ArticlesManager}.tsx
touch pages/admin/campaigns/index.astro
touch pages/admin/system/work-log.astro
touch components/admin/campaigns/CampaignManager.tsx
touch components/admin/system/WorkLogViewer.tsx

echo "✅ Complete file structure created!"
echo "📊 Summary:"
echo "   - Intelligence Library: 25 files"
echo "   - Factory & Forms: 20 files"
echo "   - Collections: 16 files"
echo "   - Total: 61 new files"
echo ""
echo "🎯 Next: Start implementing Milestone 1 (Intelligence Library)"
```

---

## 📋 IMPLEMENTATION ORDER

### Priority 1 (This Week): Intelligence Library
1. Avatar Intelligence Manager
2. Avatar Variants Manager
3. Geo Intelligence Manager
4. Spintax Manager
5. Cartesian Manager

### Priority 2 (Next Week): Factory & Forms
1. Kanban Board
2. Lead Forms
3. Jobs Manager
4. Scheduler

### Priority 3 (Following Week): All Collections
1. Content Collections
2. Sites & Content
3. Campaigns & Logs

---

**Total Files to Create**: 61 files  
**Estimated Time**: 3 weeks (3 milestones)  
**Result**: Fully functional admin dashboard with all collections editable

🚀 **Ready to build!**
