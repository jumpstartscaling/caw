-- chrisamaya.work schema

-- Table 1: Complete seed data
CREATE TABLE IF NOT EXISTS caw_seed (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Table 2: Content pages (one row per page)
CREATE TABLE IF NOT EXISTS caw_content (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]',
  palette TEXT NOT NULL DEFAULT 'emerald',
  nav JSONB,
  footer JSONB,
  local_seo JSONB,
  source TEXT DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Blog/knowledge-base articles
CREATE TABLE IF NOT EXISTS caw_articles (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  excerpt     TEXT,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'infrastructure',
  tags        JSONB NOT NULL DEFAULT '[]',
  author      TEXT NOT NULL DEFAULT 'Chris Amaya',
  og_image    TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caw_articles_status ON caw_articles (status);
CREATE INDEX IF NOT EXISTS idx_caw_articles_category ON caw_articles (category);
CREATE INDEX IF NOT EXISTS idx_caw_articles_published ON caw_articles (published_at DESC)
  WHERE status = 'published';

-- Tenant tables for jumpstartscaling.com
CREATE TABLE IF NOT EXISTS jss_seed (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS jss_content (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]',
  palette TEXT NOT NULL DEFAULT 'emerald',
  nav JSONB,
  footer JSONB,
  local_seo JSONB,
  source TEXT DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jss_articles (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  excerpt     TEXT,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'infrastructure',
  tags        JSONB NOT NULL DEFAULT '[]',
  author      TEXT NOT NULL DEFAULT 'Jumpstart Scaling',
  og_image    TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jss_articles_status ON jss_articles (status);
CREATE INDEX IF NOT EXISTS idx_jss_articles_category ON jss_articles (category);
CREATE INDEX IF NOT EXISTS idx_jss_articles_published ON jss_articles (published_at DESC)
  WHERE status = 'published';

-- Shared pSEO element usage tracking (all tenants)
CREATE TABLE IF NOT EXISTS pseo_element_usage (
  id BIGSERIAL PRIMARY KEY,
  site_prefix TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  element_group TEXT NOT NULL,
  element_key TEXT NOT NULL,
  source_table TEXT,
  element_value TEXT NOT NULL,
  element_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pseo_element_usage_unique
  ON pseo_element_usage (site_prefix, page_slug, element_group, element_hash);
CREATE INDEX IF NOT EXISTS idx_pseo_element_usage_group_key
  ON pseo_element_usage (site_prefix, element_group, element_key);

CREATE OR REPLACE VIEW pseo_element_usage_stats AS
SELECT
  site_prefix,
  element_group,
  element_key,
  element_hash,
  MIN(used_at) AS first_used_at,
  MAX(used_at) AS last_used_at,
  COUNT(*)::int AS usage_count,
  COUNT(DISTINCT page_slug)::int AS page_count,
  ARRAY_AGG(DISTINCT page_slug ORDER BY page_slug) AS pages
FROM pseo_element_usage
GROUP BY site_prefix, element_group, element_key, element_hash;

CREATE OR REPLACE VIEW pseo_element_usage_rollup AS
SELECT
  site_prefix,
  element_group,
  element_key,
  COUNT(*)::int AS total_usage_count,
  COUNT(DISTINCT element_hash)::int AS unique_element_count,
  COUNT(DISTINCT page_slug)::int AS page_count
FROM pseo_element_usage
GROUP BY site_prefix, element_group, element_key;
