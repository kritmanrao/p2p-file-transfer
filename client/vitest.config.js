/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,            // <-- THIS is the key for global `test` and `expect`
    environment: 'jsdom',     // simulate a browser for React components
    setupFiles: './tests/setup.jsx', // run setup before tests
  },
});
