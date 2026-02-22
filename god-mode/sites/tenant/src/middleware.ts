import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const siteId = context.request.headers.get('x-tenant-site-id') ?? null;
  const domain = context.request.headers.get('x-tenant-domain') ?? null;
  const rawTheme = context.request.headers.get('x-tenant-theme-config');

  let themeConfig: App.Locals['themeConfig'] = null;
  if (rawTheme && rawTheme.length > 0) {
    try {
      const decoded = atob(rawTheme);
      themeConfig = JSON.parse(decoded) as App.Locals['themeConfig'];
    } catch {
      themeConfig = null;
    }
  }

  context.locals.siteId = siteId;
  context.locals.domain = domain;
  context.locals.themeConfig = themeConfig;
  context.locals.apiBase =
    (typeof process !== 'undefined' && process.env?.PUBLIC_API_URL) ||
    (typeof process !== 'undefined' && process.env?.GOD_MODE_API_URL) ||
    'https://api.jumpstartscaling.com';

  const response = await next();
  // Cache-Control for CDN: 1h fresh, 24h stale-while-revalidate (portable, works with any CDN)
  if (response.status === 200 && !context.url.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }
  return response;
});
