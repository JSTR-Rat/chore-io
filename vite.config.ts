// vite.config.ts
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: [
      'localhost',
      'repairs-editing-rough-physically.trycloudflare.com',
      'consecutive-tiles-sox-brokers.trycloudflare.com',
      'guarantees-architectural-balloon-pittsburgh.trycloudflare.com',
    ],
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      configPath: './wrangler.jsonc',
    }),
    tsConfigPaths(),
    tanstackStart(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    tailwindcss(),
  ],
});
