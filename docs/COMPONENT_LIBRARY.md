# COMPONENT LIBRARY: Spark Platform UI Catalog

> **BLUF**: 182 React components in 14 directories. Admin (95 files), Blocks (25 files), UI (18 files).

---

## 1. Component Organization

```
frontend/src/components/
├── admin/              # 95 files - Dashboard components
├── analytics/          # 4 files - Analytics widgets
├── assembler/          # 8 files - Article assembly
├── automations/        # 1 file - Workflow automation
├── blocks/             # 25 files - Page builder blocks
├── collections/        # 1 file - Generic collection UI
├── debug/              # 1 file - Debug utilities
├── engine/             # 4 files - Rendering engine
├── factory/            # 9 files - Content Factory
├── intelligence/       # 7 files - Intelligence Library
├── layout/             # 1 file - Layout components
├── providers/          # 1 file - React providers
├── testing/            # 7 files - Test utilities
└── ui/                 # 18 files - Shadcn primitives
```

---

## 2. Admin Components

Location: `frontend/src/components/admin/`

### 2.1 Intelligence Managers

| Component | File | Purpose |
|-----------|------|---------|
| AvatarIntelligenceManager | `intelligence/AvatarIntelligenceManager.tsx` | Avatar CRUD + stats |
| GeoIntelligenceManager | `intelligence/GeoIntelligenceManager.tsx` | Map + location CRUD |
| SpintaxManager | `intelligence/SpintaxManager.tsx` | Dictionary editor |
| CartesianManager | `intelligence/CartesianManager.tsx` | Pattern builder |
| PatternAnalyzer | `intelligence/PatternAnalyzer.tsx` | Pattern testing |
| OfferBlocksManager | `intelligence/OfferBlocksManager.tsx` | Offer template CRUD |
| IntelligenceDashboard | `intelligence/IntelligenceDashboard.tsx` | Module overview |

### 2.2 Factory Components

| Component | File | Purpose |
|-----------|------|---------|
| KanbanBoard | `factory/KanbanBoard.tsx` | Drag-drop workflow |
| ArticleWorkbench | `factory/ArticleWorkbench.tsx` | Article editing |
| BulkGrid | `factory/BulkGrid.tsx` | Multi-select operations |
| JobsMonitor | `factory/JobsMonitor.tsx` | Queue status |
| SendToFactoryButton | `factory/SendToFactoryButton.tsx` | Factory trigger |

### 2.3 SEO Components

| Component | File | Purpose |
|-----------|------|---------|
| CampaignWizard | `seo/CampaignWizard.tsx` | Campaign creation wizard |
| ArticleList | `seo/ArticleList.tsx` | Article table |
| HeadlineGenerator | `seo/HeadlineGenerator.tsx` | Headline permutation UI |
| FragmentsManager | `seo/FragmentsManager.tsx` | Fragment CRUD |
| ArticleEditor | `seo/ArticleEditor.tsx` | Single article edit |
| ArticlePreview | `seo/ArticlePreview.tsx` | Preview renderer |

### 2.4 Sites Components

| Component | File | Purpose |
|-----------|------|---------|
| SitesManager | `sites/SitesManager.tsx` | Site list + actions |
| SiteEditor | `sites/SiteEditor.tsx` | Site settings |
| SiteDashboard | `sites/SiteDashboard.tsx` | Site overview |
| PagesList | `sites/PagesList.tsx` | Page management |
| NavigationEditor | `sites/NavigationEditor.tsx` | Menu builder |
| ThemeSettings | `sites/ThemeSettings.tsx` | Theme configuration |

### 2.5 Content Components

| Component | File | Purpose |
|-----------|------|---------|
| PageEditor | `content/PageEditor.tsx` | Block-based editor |
| PostEditor | `content/PostEditor.tsx` | Blog post editor |
| ContentFactoryDashboard | `content/ContentFactoryDashboard.tsx` | Factory overview |
| VisualBlockEditor | `content/VisualBlockEditor.tsx` | Visual editor |

### 2.6 System Components

| Component | File | Purpose |
|-----------|------|---------|
| SystemMonitor | `system/SystemMonitor.tsx` | Health dashboard |
| SystemStatusBar | `system/SystemStatusBar.tsx` | Status indicator |
| SettingsManager | `SettingsManager.tsx` | Platform settings |
| LogViewer | `system/LogViewer.tsx` | Work log viewer |
| WPImporter | `import/WPImporter.tsx` | WordPress import |
| JumpstartWizard | `jumpstart/JumpstartWizard.tsx` | Quick site setup |

### 2.7 Testing Components

| Component | File | Purpose |
|-----------|------|---------|
| TestRunner | `testing/TestRunner.tsx` | Test executor |
| TestResults | `testing/TestResults.tsx` | Results display |
| ConnectionTester | `testing/ConnectionTester.tsx` | API tests |

---

## 3. Block Components

Location: `frontend/src/components/blocks/`

### Page Builder Blocks

| Block | File | Description |
|-------|------|-------------|
| HeroBlock | `HeroBlock.tsx` | Full-width header with CTA |
| RichTextBlock | `RichTextBlock.tsx` | SEO-optimized prose |
| ColumnsBlock | `ColumnsBlock.tsx` | Multi-column layout |
| MediaBlock | `MediaBlock.tsx` | Image/video with caption |
| StepsBlock | `StepsBlock.tsx` | Numbered process |
| QuoteBlock | `QuoteBlock.tsx` | Testimonial/blockquote |
| GalleryBlock | `GalleryBlock.tsx` | Image grid |
| FAQBlock | `FAQBlock.tsx` | Accordion with schema.org |
| PostsBlock | `PostsBlock.tsx` | Blog listing |
| FormBlock | `FormBlock.tsx` | Lead capture form |
| CTABlock | `CTABlock.tsx` | Call-to-action |
| MapBlock | `MapBlock.tsx` | Embedded map |
| CardBlock | `CardBlock.tsx` | Card layout |
| DividerBlock | `DividerBlock.tsx` | Section separator |
| SpacerBlock | `SpacerBlock.tsx` | Vertical spacing |
| HeaderBlock | `HeaderBlock.tsx` | Section header |
| ListBlock | `ListBlock.tsx` | Bullet/numbered list |
| TableBlock | `TableBlock.tsx` | Data table |
| CodeBlock | `CodeBlock.tsx` | Code snippet |
| EmbedBlock | `EmbedBlock.tsx` | External embed |

### Block Renderer

| Component | File | Purpose |
|-----------|------|---------|
| BlockRenderer | `engine/BlockRenderer.tsx` | JSON → component mapper |
| BlockWrapper | `engine/BlockWrapper.tsx` | Styling container |

---

## 4. UI Components (Shadcn-style)

Location: `frontend/src/components/ui/`

### Form Controls

| Component | File | Usage |
|-----------|------|-------|
| Button | `button.tsx` | `<Button variant="default">` |
| Input | `input.tsx` | `<Input type="text">` |
| Textarea | `textarea.tsx` | `<Textarea rows={4}>` |
| Select | `select.tsx` | `<Select><SelectItem>` |
| Switch | `switch.tsx` | `<Switch checked={}>` |
| Slider | `slider.tsx` | `<Slider value={}>` |
| Label | `label.tsx` | `<Label htmlFor="">` |

### Layout

| Component | File | Usage |
|-----------|------|-------|
| Card | `card.tsx` | `<Card><CardHeader>...` |
| Dialog | `dialog.tsx` | `<Dialog><DialogContent>` |
| Sheet | `sheet.tsx` | `<Sheet><SheetContent>` |
| Table | `table.tsx` | `<Table><TableRow>` |
| Tabs | `tabs.tsx` | `<Tabs><TabsContent>` |
| Separator | `separator.tsx` | `<Separator>` |

### Feedback

| Component | File | Usage |
|-----------|------|-------|
| Toast | `toast.tsx` | `toast({ title, description })` |
| Tooltip | `tooltip.tsx` | `<Tooltip><TooltipContent>` |
| DropdownMenu | `dropdown-menu.tsx` | `<DropdownMenu><DropdownMenuItem>` |

---

## 5. Analytics Components

Location: `frontend/src/components/analytics/`

| Component | File | Purpose |
|-----------|------|---------|
| MetricsDashboard | `MetricsDashboard.tsx` | Analytics overview |
| ChartWidget | `ChartWidget.tsx` | Data visualization |
| StatCard | `StatCard.tsx` | Single metric display |

---

## 6. Engine Components

Location: `frontend/src/components/engine/`

| Component | File | Purpose |
|-----------|------|---------|
| BlockRenderer | `BlockRenderer.tsx` | Renders JSON blocks |
| PageRenderer | `PageRenderer.tsx` | Full page rendering |
| ArticleRenderer | `ArticleRenderer.tsx` | Article display |
| PreviewFrame | `PreviewFrame.tsx` | Preview container |

---

## 7. Automations Components

Location: `frontend/src/components/automations/`

| Component | File | Purpose |
|-----------|------|---------|
| AutomationBuilder | `AutomationBuilder.tsx` | Workflow editor |

---

## 8. Usage Examples

### Using Admin Components

```tsx
import { SitesManager } from '@/components/admin/sites/SitesManager';

export default function SitesPage() {
    return <SitesManager client:load />;
}
```

### Using UI Components

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function MyComponent() {
    return (
        <Card>
            <CardHeader>Title</CardHeader>
            <CardContent>
                <Button variant="default">Click</Button>
            </CardContent>
        </Card>
    );
}
```

### Using Blocks

```tsx
import { BlockRenderer } from '@/components/engine/BlockRenderer';

function PageContent({ blocks }) {
    return <BlockRenderer blocks={blocks} />;
}
```

---

## 9. Design System

### Colors (Titanium Pro)

| Name | Value | Usage |
|------|-------|-------|
| Background | `#09090b` (zinc-950) | Page background |
| Primary | `#eab308` (yellow-500) | Accent, buttons |
| Success | `#22c55e` (green-500) | Positive actions |
| Accent | `#a855f7` (purple-500) | Highlights |
| Text | `#ffffff` / `#94a3b8` | Primary / secondary |

### Typography

| Element | Class |
|---------|-------|
| Heading 1 | `text-4xl font-bold` |
| Heading 2 | `text-2xl font-semibold` |
| Body | `text-base text-slate-300` |
| Small | `text-sm text-slate-400` |

### Spacing

| Size | Value | Usage |
|------|-------|-------|
| xs | `4px` | Tight padding |
| sm | `8px` | Compact spacing |
| md | `16px` | Standard spacing |
| lg | `24px` | Section spacing |
| xl | `32px` | Large sections |

---

## 10. Component Creation Guidelines

### File Structure

```tsx
// components/admin/MyFeature/MyComponent.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
    data: MyType;
    onAction?: () => void;
}

export function MyComponent({ data, onAction }: MyComponentProps) {
    const [state, setState] = useState(false);
    
    return (
        <div className="p-4 bg-zinc-900 rounded-lg">
            {/* Component content */}
        </div>
    );
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `MyComponent.tsx` |
| Hook | camelCase, use-prefix | `useMyHook.ts` |
| Utility | camelCase | `formatDate.ts` |
| Type | PascalCase | `MyComponentProps` |
