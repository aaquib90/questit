import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(workspaceRoot, './src'),
      '@questit': path.resolve(workspaceRoot, '../src')
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});
