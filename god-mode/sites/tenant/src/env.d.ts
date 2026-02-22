/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    siteId: string | null;
    domain: string | null;
    apiBase: string;
    themeConfig: {
      palette?: string;
      content_structure?: Record<string, unknown>;
      scripts?: string[];
    } | null;
  }
}
