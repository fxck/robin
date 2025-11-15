import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite as TanStackRouterPlugin } from '@tanstack/router-vite-plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps-app',
  
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true, // Fail if port is already in use
  },
  
  preview: {
    port: 4173,
    host: 'localhost',
  },
  
  plugins: [
    react(),
    TanStackRouterPlugin({
      routesDirectory: path.resolve(__dirname, './src/routes'),
      generatedRouteTree: path.resolve(__dirname, './src/routeTree.gen.ts'),
    }),
    nxViteTsPaths(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    outDir: '../../dist/apps/app',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
