/**
 * Admin navigation config – single source of truth for sidebar/nav links.
 * Add new admin sections here; keep hrefs in sync with actual pages.
 */
const BASE = '/jumpstart/admin';

export interface NavItem {
  label: string;
  href: string;
  group: string;
}

export const navConfig: NavItem[] = [
  // Core
  { label: 'Dashboard', href: `${BASE}/`, group: 'Core' },
  { label: 'Leads', href: `${BASE}/leads`, group: 'Core' },
  { label: 'Surveys', href: `${BASE}/scaling-surveys`, group: 'Core' },
  { label: 'Status', href: `${BASE}/status`, group: 'Core' },
  { label: 'Debug', href: `${BASE}/debug`, group: 'Core' },
  // pSEO
  { label: 'Locations', href: `${BASE}/locations`, group: 'pSEO' },
  { label: 'Services', href: `${BASE}/pseo-services`, group: 'pSEO' },
  { label: 'Content Matrix', href: `${BASE}/content-matrix`, group: 'pSEO' },
  // Factory & Content
  { label: 'Content Factory', href: `${BASE}/content-factory`, group: 'Factory' },
  { label: 'Factory Kanban', href: `${BASE}/factory`, group: 'Factory' },
  { label: 'Generated Articles', href: `${BASE}/factory/articles`, group: 'Factory' },
  // Intelligence
  { label: 'Intelligence', href: `${BASE}/intelligence`, group: 'Intelligence' },
  { label: 'Avatars', href: `${BASE}/intelligence/avatars`, group: 'Intelligence' },
  { label: 'Variants', href: `${BASE}/intelligence/variants`, group: 'Intelligence' },
  { label: 'Geo', href: `${BASE}/intelligence/geo`, group: 'Intelligence' },
  { label: 'Spintax', href: `${BASE}/intelligence/spintax`, group: 'Intelligence' },
  { label: 'Patterns', href: `${BASE}/intelligence/patterns`, group: 'Intelligence' },
  // Collections
  { label: 'Collections', href: `${BASE}/collections`, group: 'Collections' },
  { label: 'Page Blocks', href: `${BASE}/collections/page-blocks`, group: 'Collections' },
  { label: 'Offer Blocks', href: `${BASE}/collections/offer-blocks`, group: 'Collections' },
  { label: 'Headlines', href: `${BASE}/collections/headline-inventory`, group: 'Collections' },
  { label: 'Fragments', href: `${BASE}/collections/content-fragments`, group: 'Collections' },
  // SEO
  { label: 'SEO Articles', href: `${BASE}/seo/articles`, group: 'SEO' },
  { label: 'SEO Campaigns', href: `${BASE}/seo/campaigns`, group: 'SEO' },
  { label: 'SEO Wizard', href: `${BASE}/seo/wizard`, group: 'SEO' },
  { label: 'SEO Headlines', href: `${BASE}/seo/headlines`, group: 'SEO' },
  { label: 'SEO Fragments', href: `${BASE}/seo/fragments`, group: 'SEO' },
  // Assembler, Scheduler, Media
  { label: 'Assembler', href: `${BASE}/assembler`, group: 'Content' },
  { label: 'Scheduler', href: `${BASE}/scheduler`, group: 'Content' },
  { label: 'Media', href: `${BASE}/media`, group: 'Content' },
  { label: 'Pages', href: `${BASE}/pages`, group: 'Content' },
  { label: 'Posts', href: `${BASE}/posts`, group: 'Content' },
  // Other
  { label: 'Automations', href: `${BASE}/automations`, group: 'System' },
  { label: 'Analytics', href: `${BASE}/analytics`, group: 'System' },
  { label: 'Sites', href: `${BASE}/sites`, group: 'System' },
  { label: 'Settings', href: `${BASE}/settings`, group: 'System' },
  { label: 'Work Log', href: `${BASE}/system/work-log`, group: 'System' },
  { label: 'Testing', href: `${BASE}/testing`, group: 'System' },
];

export function getNavByGroup(): Record<string, NavItem[]> {
  const byGroup: Record<string, NavItem[]> = {};
  for (const item of navConfig) {
    if (!byGroup[item.group]) byGroup[item.group] = [];
    byGroup[item.group].push(item);
  }
  return byGroup;
}
