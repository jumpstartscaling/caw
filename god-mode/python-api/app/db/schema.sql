-- God Mode pSEO Factory - PostgreSQL Schema
-- Single source of truth for connection.py and seed_from_exports.py
-- Harris Matrix order: Foundation -> Walls -> Roof -> Assembly Line

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- EXISTING TABLES (preserved verbatim)
-- =============================================================================

-- Leads (contact forms, audit survey, n8n form, etc.)
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    source TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    revenue TEXT,
    budget TEXT,
    problem TEXT,
    form_type TEXT,
    data_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scaling survey (Moat Audit, detailed survey)
CREATE TABLE IF NOT EXISTS scaling_survey_submissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    role TEXT,
    current_revenue TEXT,
    target_revenue TEXT,
    team_size TEXT,
    industry TEXT,
    challenges JSONB,
    marketing_spend TEXT,
    channels JSONB,
    biggest_goal TEXT,
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Request logging (optional, for debugging)
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    endpoint TEXT,
    method TEXT,
    status INTEGER,
    payload JSONB,
    response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Harris matrix (pSEO): locations, services, content
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT,
    neighborhood TEXT,
    slug TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pseo_services (
    id SERIAL PRIMARY KEY,
    service_type TEXT NOT NULL,
    sub_niche TEXT,
    slug TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_matrix (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id),
    service_id INT REFERENCES pseo_services(id),
    slug TEXT UNIQUE,
    title TEXT,
    meta_description TEXT,
    content_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- FOUNDATION: Independent tables (no FKs to new tables)
-- =============================================================================

CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    theme_config JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS theme_config JSONB;

CREATE TABLE IF NOT EXISTS avatar_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    avatar_key VARCHAR(255),
    base_name VARCHAR(255),
    wealth_cluster VARCHAR(255),
    business_niches JSONB,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS avatar_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_key VARCHAR(255),
    variant_type VARCHAR(100),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geo_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_key VARCHAR(255),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cartesian_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_key VARCHAR(255),
    pattern_type VARCHAR(100),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spintax_dictionaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(255) NOT NULL,
    data JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offer_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_type VARCHAR(100),
    avatar_key VARCHAR(255),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_type VARCHAR(100),
    name VARCHAR(255),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS synonym_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(255) NOT NULL,
    terms JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- WALLS: Depend on sites or campaign_masters
-- =============================================================================

CREATE TABLE IF NOT EXISTS campaign_masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    headline_spintax_root TEXT,
    target_word_count INTEGER DEFAULT 1500,
    niche_variables JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'pending',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE SET NULL,
    target_quantity INTEGER DEFAULT 10,
    progress INTEGER DEFAULT 0,
    filters JSONB,
    current_offset INTEGER DEFAULT 0,
    source_type VARCHAR(20) DEFAULT 'new',
    source_article_ids JSONB,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'queued',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE SET NULL,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    html_content TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image VARCHAR(500),
    canonical_url TEXT,
    schema_json JSONB,
    generation_hash VARCHAR(255),
    readability_score DECIMAL(5,2),
    uniqueness_score DECIMAL(5,2),
    is_published BOOLEAN DEFAULT FALSE,
    sync_status VARCHAR(50),
    sitemap_status VARCHAR(50),
    last_refreshed_at TIMESTAMP,
    refresh_count INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    schema_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'published',
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    excerpt TEXT,
    schema_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS headline_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE CASCADE,
    final_title_text TEXT,
    headline_text VARCHAR(500),
    used_on_article UUID REFERENCES generated_articles(id) ON DELETE SET NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'active',
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE CASCADE,
    fragment_type VARCHAR(100),
    content_body TEXT,
    fragment_text TEXT,
    word_count INTEGER,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ANALYTICS (depend on sites)
-- =============================================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    page_path VARCHAR(500),
    session_id VARCHAR(255),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pageviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    page_path VARCHAR(500),
    session_id VARCHAR(255),
    referrer VARCHAR(500),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
    conversion_type VARCHAR(100),
    value DECIMAL(10,2),
    source VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE SET NULL,
    task_type VARCHAR(100),
    scheduled_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details JSONB,
    level VARCHAR(20) DEFAULT 'info',
    status VARCHAR(100),
    user_id UUID,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- ASSEMBLY LINE: Usage tracking, auto-rotation
-- =============================================================================

CREATE TABLE IF NOT EXISTS article_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES generated_articles(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL,
    component_id TEXT NOT NULL,
    slot INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_usage_article ON article_usage(article_id);
CREATE INDEX IF NOT EXISTS idx_article_usage_component ON article_usage(component_type, component_id);

CREATE TABLE IF NOT EXISTS content_refresh_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaign_masters(id) ON DELETE CASCADE,
    schedule_cron VARCHAR(100) NOT NULL,
    refresh_mode VARCHAR(50) DEFAULT 'light',
    min_age_days INTEGER DEFAULT 90,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MIGRATIONS: Add columns for DB-driven template (chrisamaya)
-- =============================================================================

ALTER TABLE page_blocks ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE CASCADE;
ALTER TABLE page_blocks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
