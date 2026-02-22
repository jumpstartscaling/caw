import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Multi-domain configuration
export default defineConfig({
    site: 'https://jumpstartscaling.com',
    integrations: [
        tailwind(),
        sitemap()
    ],
    output: 'static',
    build: {
        assets: '_assets'
    },
    server: {
        host: '0.0.0.0',
        port: 8100
    },
    vite: {
        server: {
            watch: {
                usePolling: true
            }
        }
    }
});
