import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      types: path.resolve(__dirname, './src/types'),
      components: path.resolve(__dirname, './src/components'),
      services: path.resolve(__dirname, './src/services'),
      stores: path.resolve(__dirname, './src/stores'),
      hooks: path.resolve(__dirname, './src/hooks'),
      utils: path.resolve(__dirname, './src/utils'),
      pages: path.resolve(__dirname, './src/pages'),
      mock: path.resolve(__dirname, './src/mock'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/*.stories.*',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    },
  },
});
