import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://afotrelle.github.io',
  base: '/',
  integrations: [react()],
  vite: {
    server: {
      host: '0.0.0.0',
    },
  },
});
