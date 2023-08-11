// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:3000',
  build: {
    server: './server'
  },
  base: '/',
  integrations: [tailwind()],
  server: {
    port: 3000,
    proxy: {
      '/api/*': { // forwarding any /api/* requests to our Express server
        target: 'http://localhost:3001', // assuming Express is running on port 8080
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
