// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://abh1.xyz',
  adapter: vercel(),
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
