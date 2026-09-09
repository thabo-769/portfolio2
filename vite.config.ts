import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Split large vendor libraries into their own chunks to avoid a single
      // ~1MB bundle and improve caching + initial load performance.
      chunkSizeWarningLimit: 700, // three.js is a large-but-cacheable vendor chunk
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replaceAll('\\', '/');
            if (normalizedId.includes('/node_modules/firebase/analytics/') || normalizedId.includes('/node_modules/@firebase/analytics/')) return 'firebase-analytics';
            if (normalizedId.includes('/node_modules/firebase/auth/') || normalizedId.includes('/node_modules/@firebase/auth/')) return 'firebase-auth';
            if (normalizedId.includes('/node_modules/firebase/firestore/') || normalizedId.includes('/node_modules/@firebase/firestore/')) return 'firebase-firestore';
            if (normalizedId.includes('/node_modules/firebase/storage/') || normalizedId.includes('/node_modules/@firebase/storage/')) return 'firebase-storage';
            if (normalizedId.includes('/node_modules/firebase/') || normalizedId.includes('/node_modules/@firebase/')) return 'firebase-core';
            if (normalizedId.includes('/node_modules/lucide-react/')) return 'icons';
            if (normalizedId.includes('/node_modules/react-router')) return 'router';
            if (normalizedId.includes('/node_modules/three/')) return 'three';
            if (normalizedId.includes('/node_modules/framer-motion/') || normalizedId.includes('/node_modules/motion/')) {
              return 'motion';
            }
            if (normalizedId.includes('/node_modules/react/') || normalizedId.includes('/node_modules/react-dom/')) {
              return 'react';
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
  };
});
