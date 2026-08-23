// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://abh1.xyz',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap(), react()],
  markdown: {
    shikiConfig: {
      theme: 'vesper'
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
