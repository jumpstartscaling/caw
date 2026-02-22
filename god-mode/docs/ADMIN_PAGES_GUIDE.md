# ADMIN PAGES GUIDE: Spark Platform

> **BLUF**: 25+ admin page directories, 66 admin page files. All routes prefixed with `/admin/`.

---

## 1. Command Station

### Main Dashboard

| Path | File | Purpose |
|------|------|---------|
| `/admin` | `pages/admin/index.astro` | Mission Control overview |

Components: `SystemMonitor.tsx`, `SystemStatusBar.tsx`

Features:
- Sub-station status indicators
- API health monitoring
- Content integrity checks
- Quick actions

---

## 2. Launchpad (Sites Module)

### Site Management

| Path | File | Purpose |
|------|------|---------|
| `/admin/sites` | `pages/admin/sites/index.astro` | Site list |
| `/admin/sites/[id]` | `pages/admin/sites/[id]/index.astro` | Site dashboard |
| `/admin/sites/edit` | `pages/admin/sites/edit.astro` | Site settings editor |
| `/admin/sites/jumpstart` | `pages/admin/sites/jumpstart.astro` | Quick setup wizard |
| `/admin/sites/import` | `pages/admin/sites/import.astro` | WordPress importer |
| `/admin/sites/editor/[id]` | `pages/admin/sites/editor/[id].astro` | Page block editor |

Components: `SitesManager.tsx`, `SiteEditor.tsx`, `SiteDashboard.tsx`, `JumpstartWizard.tsx`, `WPImporter.tsx`

---

## 3. Content Factory

### Factory Dashboard

| Path | File | Purpose |
|------|------|---------|
| `/admin/factory` | `pages/admin/factory/index.astro` | Kanban board |
| `/admin/factory/articles` | `pages/admin/factory/articles.astro` | Article workbench |
| `/admin/content-factory` | `pages/admin/content-factory.astro` | Simple generator |

Components: `KanbanBoard.tsx`, `ArticleWorkbench.tsx`, `ContentFactoryDashboard.tsx`

---

## 4. Intelligence Library

### Intelligence Hub

| Path | File | Purpose |
|------|------|---------|
| `/admin/intelligence` | `pages/admin/intelligence/index.astro` | Module overview |
| `/admin/intelligence/avatars` | `pages/admin/intelligence/avatars.astro` | Avatar manager |
| `/admin/intelligence/variants` | `pages/admin/intelligence/variants.astro` | Avatar variants |
| `/admin/intelligence/geo` | `pages/admin/intelligence/geo.astro` | Geo intelligence map |
| `/admin/intelligence/spintax` | `pages/admin/intelligence/spintax.astro` | Spintax dictionaries |
| `/admin/intelligence/patterns` | `pages/admin/intelligence/patterns.astro` | Cartesian patterns |

Components: `AvatarIntelligenceManager.tsx`, `GeoIntelligenceManager.tsx`, `SpintaxManager.tsx`, `CartesianManager.tsx`

---

## 5. SEO Engine

### Campaign & Article Management

| Path | File | Purpose |
|------|------|---------|
| `/admin/seo/campaigns` | `pages/admin/seo/campaigns.astro` | Campaign list |
| `/admin/seo/articles` | `pages/admin/seo/articles.astro` | Article management |
| `/admin/seo/headlines` | `pages/admin/seo/headlines.astro` | Headline inventory |
| `/admin/seo/fragments` | `pages/admin/seo/fragments.astro` | Content fragments |
| `/admin/seo/wizard` | `pages/admin/seo/wizard.astro` | Campaign wizard |

Components: `CampaignWizard.tsx`, `ArticleList.tsx`, `HeadlineGenerator.tsx`, `FragmentsManager.tsx`

---

## 6. Content Management

### Pages & Posts

| Path | File | Purpose |
|------|------|---------|
| `/admin/pages` | `pages/admin/pages/index.astro` | Pages list |
| `/admin/pages/edit/[id]` | `pages/admin/pages/edit/[id].astro` | Page editor |
| `/admin/posts` | `pages/admin/posts/index.astro` | Posts list |
| `/admin/posts/edit/[id]` | `pages/admin/posts/edit/[id].astro` | Post editor |
| `/admin/content/avatars` | `pages/admin/content/avatars.astro` | Legacy avatar content |
| `/admin/content/geo_clusters` | `pages/admin/content/geo_clusters.astro` | Legacy geo content |

Components: `PageEditor.tsx`, `PostEditor.tsx`, `PageList.tsx`, `PostList.tsx`

---

## 7. Collections (Generic CRUD)

### Collection Manager

| Path | File | Purpose |
|------|------|---------|
| `/admin/collections` | `pages/admin/collections/index.astro` | Collection browser |
| `/admin/collections/page-blocks` | `pages/admin/collections/page-blocks.astro` | Page blocks |
| `/admin/collections/offer-blocks` | `pages/admin/collections/offer-blocks.astro` | Offer templates |
| `/admin/collections/headline-inventory` | `pages/admin/collections/headline-inventory.astro` | Headlines |
| `/admin/collections/content-fragments` | `pages/admin/collections/content-fragments.astro` | Fragments |

Components: `GenericCollectionManager.tsx`

---

## 8. Analytics

### Analytics Dashboard

| Path | File | Purpose |
|------|------|---------|
| `/admin/analytics` | `pages/admin/analytics/index.astro` | Metrics overview |
| `/admin/analytics/events` | `pages/admin/analytics/events.astro` | Event log |
| `/admin/analytics/conversions` | `pages/admin/analytics/conversions.astro` | Conversion tracking |
| `/admin/analytics/pageviews` | `pages/admin/analytics/pageviews.astro` | Pageview data |

Components: `MetricsDashboard.tsx`, `StatCard.tsx`, `ChartWidget.tsx`

---

## 9. Leads

### Lead Management

| Path | File | Purpose |
|------|------|---------|
| `/admin/leads` | `pages/admin/leads/index.astro` | Leads list |
| `/admin/leads/[id]` | `pages/admin/leads/[id].astro` | Lead detail |

Components: `LeadManager.tsx`, `LeadTable.tsx`

---

## 10. Media

### Asset Management

| Path | File | Purpose |
|------|------|---------|
| `/admin/media` | `pages/admin/media/index.astro` | Media browser |
| `/admin/media/templates` | `pages/admin/media/templates.astro` | Image templates |

Components: `ImageTemplateEditor.tsx`

---

## 11. Locations

### Geographic Data

| Path | File | Purpose |
|------|------|---------|
| `/admin/locations` | `pages/admin/locations.astro` | Location browser |

Components: `LocationBrowser.tsx`

---

## 12. Scheduler

### Content Scheduling

| Path | File | Purpose |
|------|------|---------|
| `/admin/scheduler` | `pages/admin/scheduler/index.astro` | Calendar view |

Components: `SchedulerCalendar.tsx`

---

## 13. Assembler

### Article Assembly

| Path | File | Purpose |
|------|------|---------|
| `/admin/assembler` | `pages/admin/assembler/index.astro` | Assembly dashboard |
| `/admin/assembler/templates` | `pages/admin/assembler/templates.astro` | Template list |
| `/admin/assembler/preview` | `pages/admin/assembler/preview.astro` | Preview tool |

Components: `AssemblerDashboard.tsx`, `TemplateList.tsx`

---

## 14. Automations

### Workflow Automation

| Path | File | Purpose |
|------|------|---------|
| `/admin/automations` | `pages/admin/automations/index.astro` | Automation list |

Components: `AutomationBuilder.tsx`

---

## 15. System

### System Administration

| Path | File | Purpose |
|------|------|---------|
| `/admin/system` | `pages/admin/system/index.astro` | System overview |
| `/admin/system/work-log` | `pages/admin/system/work-log.astro` | Activity log |

Components: `LogViewer.tsx`, `WorkLogViewer.tsx`

---

## 16. Settings

### Platform Configuration

| Path | File | Purpose |
|------|------|---------|
| `/admin/settings` | `pages/admin/settings.astro` | Settings manager |

Components: `SettingsManager.tsx`

---

## 17. Testing

### Diagnostics

| Path | File | Purpose |
|------|------|---------|
| `/admin/testing` | `pages/admin/testing/index.astro` | Test suite |
| `/admin/testing/connection` | `pages/admin/testing/connection.astro` | API tests |
| `/admin/testing/schema` | `pages/admin/testing/schema.astro` | Schema validation |
| `/admin/testing/render` | `pages/admin/testing/render.astro` | Block render tests |
| `/admin/testing/results` | `pages/admin/testing/results.astro` | Test results |

Components: `TestRunner.tsx`, `ConnectionTester.tsx`, `TestResults.tsx`

---

## 18. Preview Routes

| Path | File | Purpose |
|------|------|---------|
| `/preview/site/[id]` | `pages/preview/site/[id].astro` | Site preview |
| `/preview/page/[id]` | `pages/preview/page/[id].astro` | Page preview |
| `/preview/post/[id]` | `pages/preview/post/[id].astro` | Post preview |
| `/preview/article/[id]` | `pages/preview/article/[id].astro` | Article preview |

---

## 19. Quick Reference Table

| Module | Root Path | Page Count |
|--------|-----------|------------|
| Command Station | `/admin` | 1 |
| Launchpad | `/admin/sites/*` | 6 |
| Factory | `/admin/factory/*` | 4 |
| Intelligence | `/admin/intelligence/*` | 6 |
| SEO Engine | `/admin/seo/*` | 5 |
| Content | `/admin/pages/*`, `/admin/posts/*` | 6 |
| Collections | `/admin/collections/*` | 10 |
| Analytics | `/admin/analytics/*` | 4 |
| Leads | `/admin/leads/*` | 2 |
| Media | `/admin/media/*` | 1 |
| Locations | `/admin/locations` | 1 |
| Scheduler | `/admin/scheduler/*` | 1 |
| Assembler | `/admin/assembler/*` | 5 |
| Automations | `/admin/automations/*` | 1 |
| System | `/admin/system/*` | 1 |
| Settings | `/admin/settings` | 1 |
| Testing | `/admin/testing/*` | 5 |
| Preview | `/preview/*` | 4 |
| **Total** | | **66** |

---

## 20. Access URLs

### Production

```
https://spark.jumpstartscaling.com/admin
https://launch.jumpstartscaling.com/preview/...
```

### Local Development

```
http://localhost:4321/admin
```
