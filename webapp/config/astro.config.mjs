// path: webapp/config/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import { fileURLToPath } from 'url';
import {BASE_URL, PORT, API_PORT} from './config.js';


export default defineConfig({
  base: BASE_URL,
  envDir: '../',
  integrations: [
    tailwind({
      configFile: fileURLToPath(new URL('tailwind.config.cjs', import.meta.url)),
    }),
    ],
  server: {
    port: PORT,
    proxy: {
      '/api/*': { // forwarding any /api/* requests to our Express server
        target: 'http://localhost:'+ API_PORT, 
        changeOrigin: true,
        secure: false,
      }
    }
  },
  site: 'http://localhost:'+ PORT,
  build: {
    out: '../dist', // Change this to your desired output directory
  },
});