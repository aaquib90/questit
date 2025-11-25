import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appRoot, '..', '..');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@questit/ui': path.resolve(repoRoot, './packages/ui/src'),
      '@questit/toolkit': path.resolve(repoRoot, './packages/toolkit/src'),
      '@questit': path.resolve(repoRoot, './src'),
      '@': path.resolve(appRoot, './src')
    }
  },
  server: {
    fs: {
      allow: [repoRoot]
    }
  }
});
