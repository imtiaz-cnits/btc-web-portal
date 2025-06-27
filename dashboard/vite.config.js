import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  build: {
    outDir: 'dist', // Revert to default 'dist' to match Vite's behavior
    emptyOutDir: true,
  },
});