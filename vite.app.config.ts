import { defineConfig } from 'vite';

export default defineConfig({
  root: 'app',
  server: {
    port: 3000
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
