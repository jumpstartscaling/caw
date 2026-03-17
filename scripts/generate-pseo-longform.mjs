import pg from 'pg';
import { createHash } from 'crypto';

function normalizeSitePrefix(raw) {
  const value = String(raw || 'jss').trim().toLowerCase();
  if (!/^[a-z][a-z0-9_]*$/.test(value)) return 'jss';
  return value;
}

const SITE_PREFIX = normalizeSitePrefix(process.env.SITE_PREFIX || 'jss');
const contentTable = `${SITE_PREFIX}_content`;
const articlesTable = `${SITE_PREFIX}_articles`;
const targetWords = Number.parseInt(process.env.PSEO_TARGET_WORDS || '2000', 10);
const servicesPerCombo = Number.parseInt(process.env.PSEO_SERVICES_PER_ARTICLE_CITY || '5', 10);
const SOURCE = 'pseo-longform';

function makePool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  const url = process.env.DATABASE_URL;
  const ssl = url.includes('sslmode=require') || url.includes('sslmode=no-verify') || !url.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false;
  return new pg.Pool({ connectionString: url, ssl });
}

function pick(list, fallback = '') {
  if (!Array.isArray(list) || list.length === 0) return fallback;
  return list[Math.floor(Math.random() * list.length)];
}

function stableHashInt(input) {
  const hex = createHash('sha1').update(String(input || '')).digest('hex').slice(0, 8);
  return Number.parseInt(hex, 16);
}

function hashValue(input) {
  return createHash('sha1').update(String(input || '')).digest('hex');
}

function toPlainText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clipWords(text, count) {
  const words = toPlainText(text).split(/\s+/).filter(Boolean);
  return words.slice(0, count).join(' ');
}

function countWords(text) {
  return toPlainText(text).split(/\s+/).filter(Boolean).length;
}

function resolveText(rawText, ctx, spintax, track) {
  if (!rawText) return '';
  let out = String(rawText);
  const replacements = {
    City: ctx.city,
    State: ctx.state,
    County: ctx.county || ctx.state,
    Landmark: ctx.landmark || ctx.city,
    local: `${ctx.city}, ${ctx.state}`,
    city: ctx.city,
    state: ctx.state,
    county: ctx.county || '',
    service_type: ctx.serviceType,
    sub_niche: ctx.subNiche,
    software: `${ctx.serviceType} ${ctx.subNiche}`,
    avatar: ctx.avatar,
    offer: ctx.offerHeadline,
    article_title: ctx.articleTitle,
  };
  for (const [key, value] of Object.entries(replacements)) {
    out = out.replace(new RegExp(`\\{${key}\\}`, 'gi'), String(value || ''));
  }

  for (const [category, values] of Object.entries(spintax)) {
    const regex = new RegExp(`\\{${category}\\}`, 'gi');
    out = out.replace(regex, () => {
      const chosen = pick(values, '');
      track('spintax', category, chosen, 'spintax_dictionaries');
      return chosen;
    });
  }

  out = out.replace(/\{([^{}]+\|[^{}]+)\}/g, (_, choices) => {
    const chosen = pick(String(choices).split('|').map((v) => v.trim()).filter(Boolean), '');
    track('inline_spintax', 'inline_choice', chosen, 'inline');
    return chosen;
  });

  return out.replace(/\s+/g, ' ').trim();
}

function renderParagraph(text) {
  return `<p>${text}</p>`;
}

function renderBulletList(items) {
  const li = items.map((item) => `<li>${item}</li>`).join('');
  return `<ul>${li}</ul>`;
}

function buildLongformSections(ctx, fragments, spintax, track) {
  const active = (type, fallback) => {
    const selected = pick(fragments[type], fallback);
    if (selected) track('fragment', type, selected, 'content_fragments');
    return resolveText(selected || fallback, ctx, spintax, track);
  };

  const articleSnippetA = clipWords(ctx.articleContent, 180);
  const articleSnippetB = clipWords(ctx.articleContent.split(/\s+/).slice(120).join(' '), 180);
  const paragraphs = [
    renderParagraph(resolveText(`${active('intro_hook', `In {city}, growth teams are moving from fragile stacks to dependable architecture.`)} ${active('hero_section', `The winning model blends {service_type} with {sub_niche} and measurable execution.`)}`, ctx, spintax, track)),
    renderParagraph(resolveText(`${active('problem_agitation', `Most teams hit a wall when operations, attribution, and fulfillment are disconnected.`)} ${active('technical_benefits', `{technical_wins}`)}`, ctx, spintax, track)),
    renderParagraph(resolveText(`From "${ctx.articleTitle}", one practical takeaway is this: ${articleSnippetA}. We apply that same principle to {service_type} programs in {city} so strategy, data, and implementation stay synchronized across acquisition, conversion, and retention.`, ctx, spintax, track)),
    renderParagraph(resolveText(`${active('methodology', `Our methodology is scoped, instrumented, and delivered in phases.`)} We start with a system map, align KPIs to accountability, then deploy with tight feedback loops so each sprint compounds ROI.`, ctx, spintax, track)),
    renderParagraph(resolveText(`Local context matters in {city}, {state}. ${active('geo_bridge', `Execution has to reflect local market behavior, sales velocity, and competitive positioning.`)} We combine geo context, service mechanics, and offer positioning to produce a plan that performs under real constraints.`, ctx, spintax, track)),
    renderParagraph(resolveText(`The offer framework for this page centers on "${ctx.offerHeadline}" and a ${ctx.avatar} operator profile. That pairing keeps delivery opinionated and fast: fewer handoffs, clearer implementation sequencing, and less ambiguity during deployment.`, ctx, spintax, track)),
    renderParagraph(resolveText(`Technical blueprint: first, stabilize tracking and data integrity; second, orchestrate ${ctx.serviceType} workflows; third, enforce SLA-driven execution. This architecture makes outcomes inspectable and repeatable while preserving room for niche customization.`, ctx, spintax, track)),
    renderParagraph(resolveText(`In the second half of "${ctx.articleTitle}", the key implementation signal is: ${articleSnippetB}. We convert those ideas into city-level execution by binding each tactic to instrumentation, owner, and weekly review cadence.`, ctx, spintax, track)),
    renderParagraph(resolveText(`${active('results_quantified', `{results_quantified}`)} We avoid vanity metrics and focus on bottleneck reduction, pipeline efficiency, and revenue quality.`, ctx, spintax, track)),
    renderParagraph(resolveText(`${active('social_proof', `{social_proof}`)} ${active('case_study_teaser', `{case_study_tease}`)}`, ctx, spintax, track)),
  ];

  const faqItems = [
    resolveText(`How is this different from generic agency retainers? We anchor every milestone to architecture and instrumentation, not just ad hoc tasks.`, ctx, spintax, track),
    resolveText(`Can this work with our current stack? Yes. We map dependencies and sequence migration to avoid downtime.`, ctx, spintax, track),
    resolveText(`How quickly can we move? Most teams can start implementation within 7-14 days after scoping.`, ctx, spintax, track),
  ];

  let longHtml = paragraphs.join('') + renderBulletList(faqItems);
  while (countWords(longHtml) < targetWords) {
    const expansion = resolveText(
      `${active('technical_benefits', `{technical_wins}`)} ${active('objection_handler', `{objection_handlers}`)} ` +
      `For ${ctx.city}, this is implemented as a practical rollout: owner mapping, automation sequencing, and offer optimization by niche.`,
      ctx,
      spintax,
      track
    );
    longHtml += renderParagraph(expansion);
  }

  const paraList = longHtml.match(/<p>.*?<\/p>/g) || [];
  const chunkSize = Math.ceil(paraList.length / 3);
  const chunk1 = paraList.slice(0, chunkSize).join('');
  const chunk2 = paraList.slice(chunkSize, chunkSize * 2).join('');
  const chunk3 = paraList.slice(chunkSize * 2).join('');

  return {
    chunk1,
    chunk2,
    chunk3,
    wordCount: countWords(longHtml),
  };
}

function pickServiceSet(services, article, location, maxCount) {
  const articleText = `${article.title} ${article.excerpt || ''} ${article.content || ''}`.toLowerCase();
  const scored = services.map((service) => {
    const keywords = [service.service_type, service.sub_niche, service.slug]
      .join(' ')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);
    let score = 0;
    for (const k of keywords) {
      if (articleText.includes(k)) score += 1;
    }
    const tie = stableHashInt(`${article.slug}|${location.slug}|${service.slug}`);
    return { service, score, tie };
  });
  scored.sort((a, b) => (b.score - a.score) || (a.tie - b.tie));
  const top = scored.slice(0, maxCount);
  if (top.every((item) => item.score === 0)) {
    const offset = stableHashInt(`${article.slug}|${location.slug}|rotation`) % services.length;
    const rotated = [];
    for (let i = 0; i < maxCount; i += 1) {
      rotated.push(services[(offset + i) % services.length]);
    }
    return rotated;
  }
  return top.map((item) => item.service);
}

function pickCalculatorLinks(toolPages, article, service) {
  const seed = `${article.title} ${article.excerpt || ''} ${service.service_type} ${service.sub_niche}`.toLowerCase();
  const scored = toolPages.map((tool) => {
    const tokens = `${tool.slug} ${tool.title}`.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    let score = 0;
    for (const token of tokens) {
      if (seed.includes(token)) score += 1;
    }
    return { tool, score, tie: stableHashInt(`${article.slug}|${service.slug}|${tool.slug}`) };
  });
  scored.sort((a, b) => (b.score - a.score) || (a.tie - b.tie));
  const topTools = scored.slice(0, 3).map((row) => row.tool);
  const links = [
    {
      href: '/resources/calculators',
      label: 'Open Growth Calculator Hub',
      description: 'Use the full planning suite to model scenarios and prioritize execution.',
    },
  ];
  for (const tool of topTools) {
    links.push({
      href: `/${tool.slug}`,
      label: tool.title,
      description: `Run this model for ${service.service_type} in-market planning.`,
    });
  }
  return links;
}

async function ensureUsageInfra(pool) {
  await pool.query(`
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
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_pseo_element_usage_unique
    ON pseo_element_usage (site_prefix, page_slug, element_group, element_hash);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_pseo_element_usage_group_key
    ON pseo_element_usage (site_prefix, element_group, element_key);
  `);
  await pool.query(`
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
  `);
  await pool.query(`
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
  `);
}

async function insertUsageEvents(pool, pageSlug, events) {
  if (!events.length) return;
  const deduped = new Map();
  for (const event of events) {
    const value = String(event.value || '').trim();
    if (!value) continue;
    const hash = hashValue(value);
    const key = `${event.group}|${pageSlug}|${hash}`;
    if (deduped.has(key)) continue;
    deduped.set(key, {
      elementGroup: event.group,
      elementKey: event.key || 'generic',
      sourceTable: event.sourceTable || null,
      value,
      hash,
    });
  }
  for (const event of deduped.values()) {
    await pool.query(
      `INSERT INTO pseo_element_usage
       (site_prefix, page_slug, element_group, element_key, source_table, element_value, element_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (site_prefix, page_slug, element_group, element_hash) DO NOTHING`,
      [SITE_PREFIX, pageSlug, event.elementGroup, event.elementKey, event.sourceTable, event.value, event.hash]
    );
  }
}

const pool = makePool();
try {
  await ensureUsageInfra(pool);

  const [templateRes, locationsRes, servicesRes, articlesRes, fragmentsRes, spintaxRes, offersRes, toolsRes, matrixRes] = await Promise.all([
    pool.query(`SELECT nav, footer, palette FROM ${contentTable} ORDER BY CASE WHEN slug = '' THEN 0 ELSE 1 END LIMIT 1`),
    pool.query('SELECT id, city, state, slug FROM locations ORDER BY state, city'),
    pool.query('SELECT id, service_type, sub_niche, slug FROM pseo_services ORDER BY service_type, sub_niche'),
    pool.query(`SELECT slug, title, excerpt, content, category FROM ${articlesTable} WHERE status = 'published' ORDER BY published_at DESC NULLS LAST`),
    pool.query("SELECT fragment_type, fragment_text FROM content_fragments WHERE status = 'active' AND COALESCE(fragment_text,'') != ''"),
    pool.query('SELECT category, data FROM spintax_dictionaries'),
    pool.query('SELECT block_type, avatar_key, data FROM offer_blocks ORDER BY block_type'),
    pool.query(`SELECT slug, title FROM ${contentTable} WHERE slug = 'resources/calculators' OR slug LIKE 'tools/%' ORDER BY slug`),
    pool.query(`SELECT cm.slug, cm.location_id, cm.service_id FROM content_matrix cm`),
  ]);

  const template = templateRes.rows[0] || {};
  const nav = template.nav || {};
  const footer = template.footer || {};
  const palette = template.palette || 'emerald';
  const locations = locationsRes.rows;
  const services = servicesRes.rows;
  const articles = articlesRes.rows;
  const toolPages = toolsRes.rows.filter((row) => row.slug.startsWith('tools/'));
  const matrixByLocSvc = new Map(matrixRes.rows.map((row) => [`${row.location_id}|${row.service_id}`, row.slug]));

  const fragments = {};
  for (const row of fragmentsRes.rows) {
    if (!fragments[row.fragment_type]) fragments[row.fragment_type] = [];
    fragments[row.fragment_type].push(row.fragment_text);
  }
  const spintax = {};
  for (const row of spintaxRes.rows) {
    spintax[row.category] = Array.isArray(row.data) ? row.data : [];
  }
  const offers = offersRes.rows.map((row) => ({
    blockType: row.block_type,
    avatar: row.avatar_key || row.data?.avatar || 'growth-architect',
    headline: row.data?.headline || row.data?.title || 'Technical Strategy Session',
    buttonText: row.data?.button_text || 'Book Session',
  }));
  const offerFallback = offers[0] || {
    blockType: 'technical_strategy_session',
    avatar: 'growth-architect',
    headline: 'Technical Strategy Session',
    buttonText: 'Book Session',
  };

  const planned = [];
  for (const article of articles) {
    for (const location of locations) {
      const selected = pickServiceSet(services, article, location, servicesPerCombo);
      for (const service of selected) {
        const slug = `insights/${article.slug}/${service.slug}-${location.slug}`;
        planned.push({ slug, article, location, service });
      }
    }
  }

  const byArticleCity = new Map();
  const byArticleService = new Map();
  for (const item of planned) {
    const keyA = `${item.article.slug}|${item.location.slug}`;
    const keyB = `${item.article.slug}|${item.service.slug}`;
    if (!byArticleCity.has(keyA)) byArticleCity.set(keyA, []);
    if (!byArticleService.has(keyB)) byArticleService.set(keyB, []);
    byArticleCity.get(keyA).push(item.slug);
    byArticleService.get(keyB).push(item.slug);
  }

  let processed = 0;
  let inserted = 0;
  for (const item of planned) {
    const offer = offers.length ? offers[stableHashInt(item.slug) % offers.length] : offerFallback;
    const usageEvents = [];
    const track = (group, key, value, sourceTable) => usageEvents.push({ group, key, value, sourceTable });

    const ctx = {
      city: item.location.city,
      state: item.location.state,
      county: '',
      landmark: '',
      serviceType: item.service.service_type,
      subNiche: item.service.sub_niche,
      avatar: offer.avatar,
      offerHeadline: offer.headline,
      articleTitle: item.article.title,
      articleContent: item.article.content || '',
    };

    track('article', 'source_article', item.article.slug, articlesTable);
    track('service', 'service_slug', item.service.slug, 'pseo_services');
    track('location', 'location_slug', item.location.slug, 'locations');
    track('offer', offer.blockType, offer.headline, 'offer_blocks');

    const longform = buildLongformSections(ctx, fragments, spintax, track);
    const calcLinks = pickCalculatorLinks(toolPages, item.article, item.service);
    for (const link of calcLinks) track('calculator', 'calculator_link', link.href, contentTable);

    const sameCityKey = `${item.article.slug}|${item.location.slug}`;
    const sameServiceKey = `${item.article.slug}|${item.service.slug}`;
    const relatedInCity = (byArticleCity.get(sameCityKey) || []).filter((slug) => slug !== item.slug).slice(0, 4);
    const relatedByService = (byArticleService.get(sameServiceKey) || []).filter((slug) => slug !== item.slug).slice(0, 6);
    const canonicalMatrixSlug = matrixByLocSvc.get(`${item.location.id}|${item.service.id}`);

    const cityLinksHtml = relatedInCity.map((slug) => {
      track('interlink', 'same_article_city', slug, contentTable);
      return `<a href="/${slug}" style="display:block;padding:.6rem .8rem;border:1px solid rgba(255,255,255,.12);border-radius:.45rem;text-decoration:none;color:#fff">${slug.split('/').slice(-1)[0]}</a>`;
    }).join('');
    const serviceLinksHtml = relatedByService.map((slug) => {
      track('interlink', 'same_article_service', slug, contentTable);
      const cityName = slug.split('-').slice(-2, -1)[0] || 'city';
      return `<a href="/${slug}" style="display:block;padding:.6rem .8rem;border:1px solid rgba(255,255,255,.12);border-radius:.45rem;text-decoration:none;color:#fff">${cityName}</a>`;
    }).join('');
    const canonicalHtml = canonicalMatrixSlug
      ? `<p><a href="/${canonicalMatrixSlug}" style="color:var(--neon-green);text-decoration:underline">Canonical service+city page</a></p>`
      : '';
    if (canonicalMatrixSlug) track('interlink', 'canonical_matrix', canonicalMatrixSlug, 'content_matrix');

    const title = `${item.service.service_type} ${item.service.sub_niche} in ${item.location.city}, ${item.location.state} | ${item.article.title}`;
    const blocks = [
      {
        block_type: 'hero',
        data: {
          badge: `${item.location.city.toUpperCase()}, ${item.location.state} • ${item.service.service_type.toUpperCase()}`,
          headline: `${item.service.service_type} ${item.service.sub_niche} for ${item.location.city}`,
          subhead: `${item.article.title} adapted for ${item.location.city}. Built for execution, instrumentation, and revenue clarity.`,
          cta_label: 'Run Strategy Audit',
          cta_href: '#audit',
          warning_text: `// AVATAR: ${offer.avatar}`,
        },
      },
      { block_type: 'value_prop', data: { title: 'Strategic Context', body: longform.chunk1 } },
      {
        block_type: 'solution_cards',
        data: {
          eyebrow: '// DEPLOYMENT_MODEL',
          title: `${item.service.service_type} execution path`,
          cards: [
            { title: '< ARCHITECTURE />', body: `Designed around ${item.article.category || 'growth'} constraints in ${item.location.city}.`, border_color: 'neon-blue' },
            { title: '< IMPLEMENTATION />', body: `Offer track: ${offer.headline}. Avatar: ${offer.avatar}.`, border_color: 'neon-green' },
            { title: '< OUTCOME />', body: `Targeting repeatable gains with instrumentation-first delivery.`, border_color: 'neon-pink' },
          ],
        },
      },
      { block_type: 'value_prop', data: { title: 'Execution Blueprint', body: longform.chunk2 } },
      {
        block_type: 'icon_bullets',
        data: {
          title: 'How we execute this in market',
          bullets: [
            { icon: '1', title: 'Map', text: `Map data, offer, and sales handoff constraints for ${item.location.city}.` },
            { icon: '2', title: 'Build', text: `Build ${item.service.service_type} workflows around measurable throughput.` },
            { icon: '3', title: 'Optimize', text: 'Optimize weekly with a KPI-first operating loop.' },
          ],
        },
      },
      {
        block_type: 'calculator',
        data: {
          section_title: 'Planning Calculators',
          text: `Use these calculators to model ${item.service.service_type.toLowerCase()} decisions before implementation.`,
          links: calcLinks,
        },
      },
      {
        block_type: 'value_prop',
        data: {
          title: 'Interlinked Intelligence',
          body: `${canonicalHtml}<h3>More service angles for this article + city</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem;margin-bottom:1rem">${cityLinksHtml || '<p>No additional links yet.</p>'}</div><h3>Same service across other cities</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem">${serviceLinksHtml || '<p>No additional links yet.</p>'}</div>`,
        },
      },
      { block_type: 'value_prop', data: { title: 'Implementation Detail', body: longform.chunk3 } },
      {
        block_type: 'authority',
        data: {
          title: `${offer.headline}`,
          body: `<p>Delivery avatar: <strong>${offer.avatar}</strong>. This engagement model is designed for high-accountability execution and rapid iteration.</p><p>Generated from article: <a href="/blog/${item.article.slug}" style="color:var(--neon-green);text-decoration:underline">${item.article.title}</a>.</p>`,
          stats: [
            { value: `${longform.wordCount}+`, label: 'Words per page' },
            { value: '5', label: 'Service variants per city/article' },
            { value: '1', label: 'Single-stack delivery model' },
          ],
        },
      },
      {
        block_type: 'audit_form',
        data: {
          title: offer.headline,
          subhead: `${item.service.service_type} strategy for ${item.location.city}, ${item.location.state}.`,
          form_title: offer.buttonText,
          submit_source: `PSEO_LONGFORM_${SITE_PREFIX}_${item.article.slug}_${item.service.slug}_${item.location.slug}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        },
      },
      {
        block_type: 'cta',
        data: {
          heading: `Build ${item.service.service_type} in ${item.location.city}`,
          text: 'Use the calculator hub, review linked pages, and schedule a scoped roadmap.',
          label: 'Open Calculator Hub',
          href: '/resources/calculators',
        },
      },
    ];

    const localSeo = {
      city: item.location.city,
      state: item.location.state,
      service_slug: item.service.slug,
      service_type: item.service.service_type,
      sub_niche: item.service.sub_niche,
      article_slug: item.article.slug,
      longform_words: longform.wordCount,
      variant_type: 'article_city_service',
    };

    await pool.query(
      `INSERT INTO ${contentTable} (slug, title, blocks, palette, nav, footer, local_seo, source, created_at)
       VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, NOW())
       ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title,
           blocks = EXCLUDED.blocks,
           palette = EXCLUDED.palette,
           nav = EXCLUDED.nav,
           footer = EXCLUDED.footer,
           local_seo = EXCLUDED.local_seo,
           source = EXCLUDED.source`,
      [item.slug, title, JSON.stringify(blocks), palette, JSON.stringify(nav), JSON.stringify(footer), JSON.stringify(localSeo), SOURCE]
    );
    inserted += 1;
    await insertUsageEvents(pool, item.slug, usageEvents);

    processed += 1;
    if (processed % 100 === 0) {
      console.log(`[pseo-longform] processed ${processed}/${planned.length}`);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    site_prefix: SITE_PREFIX,
    target_words: targetWords,
    services_per_article_city: servicesPerCombo,
    cities: locations.length,
    articles: articles.length,
    generated_pages: planned.length,
    upserts: inserted,
    source: SOURCE,
  }, null, 2));
} finally {
  await pool.end();
}
