-- MIGRATION: Schema Consolidation (2-Table Plan)
-- Consolidate sites, pages, blocks, and pSEO into site_displays and site_contents.

BEGIN;

-- 1. Create site_displays
CREATE TABLE IF NOT EXISTS site_displays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT UNIQUE NOT NULL,
    palette TEXT DEFAULT 'emerald',
    navigation JSONB DEFAULT '{}',
    footer JSONB DEFAULT '{}',
    scripts JSONB DEFAULT '[]',
    cdn_config JSONB DEFAULT '{}',
    local_seo JSONB DEFAULT '{}',
    site_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create site_contents
CREATE TABLE IF NOT EXISTS site_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES site_displays(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'page', 'block', 'post', 'article', 'pseo_row'
    title TEXT,
    meta_description TEXT,
    body_content TEXT,
    blocks_json JSONB DEFAULT '[]', -- For pages/articles
    attributes JSONB DEFAULT '{}',   -- For pSEO (city, service, etc.)
    is_published BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, slug, content_type)
);

-- 3. Populate site_displays from sites
INSERT INTO site_displays (id, domain, palette, navigation, footer, scripts, cdn_config, local_seo, site_name, created_at)
SELECT 
    id, 
    COALESCE(url, name), 
    COALESCE(theme_config->>'palette', 'emerald'),
    COALESCE(theme_config->'nav', '{}'),
    COALESCE(theme_config->'footer', '{}'),
    COALESCE(theme_config->'scripts', '[]'),
    COALESCE(theme_config->'cdn_config', '{}'),
    COALESCE(theme_config->'local_seo', '{}'),
    COALESCE(theme_config->>'site_name', name),
    date_created
FROM sites
ON CONFLICT (domain) DO NOTHING;

-- 4. Populate site_contents from pages
INSERT INTO site_contents (id, site_id, slug, content_type, title, is_published, created_at)
SELECT 
    id, 
    site_id, 
    COALESCE(slug, ''), 
    'page', 
    title, 
    status = 'published',
    created_at
FROM pages;

-- 5. Map page_blocks into blocks_json for site_contents (complex migration)
-- For simplicity in this SQL, we'll keep site_contents records but we might need a separate script 
-- to bundle page_blocks into the blocks_json column of the parent page.
-- Re-populating page_blocks as individual content_type='block' for now to ensure no data loss.
INSERT INTO site_contents (id, site_id, slug, content_type, title, blocks_json, sort_order, created_at)
SELECT 
    pb.id, 
    p.site_id, 
    COALESCE(p.slug, '') || '/block/' || pb.id, 
    'block', 
    pb.name, 
    pb.data, 
    pb.sort_order, 
    pb.created_at
FROM page_blocks pb
JOIN pages p ON pb.page_id = p.id;

-- 6. Populate site_contents from posts
INSERT INTO site_contents (id, site_id, slug, content_type, title, body_content, is_published, created_at)
SELECT 
    id, 
    site_id, 
    slug, 
    'post', 
    title, 
    content, 
    status = 'published',
    created_at
FROM posts;

-- 7. Populate site_contents from generated_articles
INSERT INTO site_contents (id, site_id, slug, content_type, title, meta_description, body_content, attributes, is_published, created_at)
SELECT 
    id, 
    site_id, 
    slug, 
    'article', 
    title, 
    meta_description, 
    content, 
    jsonb_build_object('category', category, 'tags', tags),
    is_published,
    date_created
FROM generated_articles;

-- 8. Populate site_contents from content_matrix (pSEO rows)
-- This assumes site_id for content_matrix is the same as the site owning the locations/services
-- Adding a sub-query to find a site_id if not present.
INSERT INTO site_contents (slug, content_type, title, meta_description, attributes, created_at)
SELECT 
    slug, 
    'pseo_row', 
    title, 
    meta_description, 
    content_json, 
    created_at
FROM content_matrix;

COMMIT;
