/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const srcRoot = path.resolve(__dirname, '../../../src/frontend/survey-app/src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': srcRoot,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup.ts',
    css: false,
  },
});
