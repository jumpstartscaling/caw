import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const API_BASE = locals.apiBase ?? 'https://api.jumpstartscaling.com';
  const domain = locals.domain || 'chrisamaya.work';
  const siteUrl = domain.includes('://') ? domain : `https://${domain}`;
  const base = siteUrl.replace(/\/$/, '');
  let urls: string[] = [];
  try {
    const res = await fetch(`${API_BASE}/api/tenant/sitemap-urls?domain=${encodeURIComponent(siteUrl)}`);
    if (res.ok) {
      const data = (await res.json()) as { urls?: string[] };
      urls = data.urls ?? [];
    }
  } catch {
    urls = ['/'];
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${base}${path.startsWith('/') ? path : '/' + path}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
