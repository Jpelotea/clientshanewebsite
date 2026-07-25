import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.PUBLIC_SITE_URL || process.env.URL || 'https://shane-perez.netlify.app';
const siteReady = process.env.PUBLIC_SITE_READY === 'true';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: siteReady ? [sitemap()] : [],
  build: { assets: '_assets' },
  compressHTML: true
});
