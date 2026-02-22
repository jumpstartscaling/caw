import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  site: 'https://factory.jumpstartscaling.com',
  base: '/jumpstart',
  compressHTML: true,
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  integrations: [react(), mdx(), sitemap({ changefreq: 'weekly', priority: 0.7, lastmod: new Date() })],
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: ['factory.jumpstartscaling.com', 'www.factory.jumpstartscaling.com', 'jumpstartscaling.com', 'www.jumpstartscaling.com', 'localhost', '127.0.0.1'] },
    build: { cssCodeSplit: true, rollupOptions: { output: { manualChunks: { 'react-vendor': ['react', 'react-dom'] } } } }
  }
});