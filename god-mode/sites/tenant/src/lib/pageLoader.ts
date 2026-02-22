/**
 * Page loader for DB-driven template.
 * Fetches page data (page, blocks, palette, nav, footer) from tenant API.
 */

export type PageData = {
  page: { id: string; title: string; slug: string | null; content?: string; schema_json?: unknown };
  blocks: Array<{ id?: string; block_type: string; name?: string; data?: Record<string, unknown> }>;
  palette: string;
  nav: unknown;
  footer: unknown;
  local_seo?: { person?: Record<string, unknown>; service?: Record<string, unknown>; address?: { locality?: string; region?: string; postalCode?: string }; areaServed?: string };
};

export async function getPageData(
  apiBase: string,
  domain: string,
  slug: string
): Promise<PageData | null> {
  const normalizedSlug = (slug || "").trim().replace(/^\/+|\/+$/g, "") || "";
  const url = `${apiBase}/api/tenant/page?domain=${encodeURIComponent(domain)}&slug=${encodeURIComponent(normalizedSlug)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      page?: PageData["page"];
      blocks?: PageData["blocks"];
      palette?: string;
      nav?: unknown;
      footer?: unknown;
      local_seo?: PageData["local_seo"];
    };
    return {
      page: data.page!,
      blocks: data.blocks ?? [],
      palette: data.palette ?? "emerald",
      nav: data.nav ?? null,
      footer: data.footer ?? null,
      ...(data.local_seo && { local_seo: data.local_seo }),
    };
  } catch {
    return null;
  }
}
