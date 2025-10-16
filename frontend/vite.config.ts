import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8084,
    strictPort: true, // Fail if port is already in use
  },
  plugins: [
    react(),
    nodePolyfills({
      // Include all polyfills needed by Aztec SDK
      include: ['buffer', 'crypto', 'stream', 'util', 'process', 'path', 'os', 'vm'],
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      path: 'path-browserify',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      vm: 'vm-browserify',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['buffer', 'process'],
  },
  build: {
    rollupOptions: {
      plugins: [],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
