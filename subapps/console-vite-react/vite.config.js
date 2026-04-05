import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import qiankun from 'vite-plugin-qiankun';
import path from 'node:path';

const qiankunMode = process.env.QIANKUN_DEV_MODE === 'host';
const rollbackMode = process.env.ROLLBACK_ENTRY_MODE === 'true';
const port = rollbackMode ? 7312 : 7302;
const origin = 'http://localhost:' + port;

export default defineConfig({
  resolve: {
    alias: {}
  },
  plugins: [
    react(),
    qiankun('subapp-vite-react-console', {
      useDevMode: true,
    }),
  ],
  define: {
    'import.meta.env.VITE_APP_RUNTIME_CHANNEL': JSON.stringify(rollbackMode ? 'rollback' : 'stable'),
    'import.meta.env.VITE_ROLLBACK_ENTRY_MODE': JSON.stringify(rollbackMode ? 'true' : 'false'),
  },
  server: {
    port,
    strictPort: true,
    cors: true,
    origin,
    hmr: qiankunMode
      ? false
      : {
          overlay: true,
        },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  preview: {
    port,
    strictPort: true,
  },
});
