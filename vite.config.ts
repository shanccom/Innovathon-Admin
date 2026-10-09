import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative base so assets load correctly on GitHub Pages (e.g. /Innovathon-Admin/) and GAS
  base: './',
});
