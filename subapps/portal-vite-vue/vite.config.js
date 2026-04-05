import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import path from 'node:path';

const qiankunMode = process.env.QIANKUN_DEV_MODE === 'host';

export default defineConfig({
  resolve: {
    alias: {}
  },
  plugins: [
    vue(),
    qiankun('subapp-vite-vue-portal', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 7301,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:7301',
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
    port: 7301,
    strictPort: true,
  },
});
