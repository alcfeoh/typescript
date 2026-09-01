import { defineConfig } from 'vite';
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
    }),
  ],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
