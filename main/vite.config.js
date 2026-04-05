import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 本地开发 API mock 路由表
// key 为路径前缀（startsWith 匹配），value 为返回的 JSON 数据工厂。
// 生产环境由真实后端提供这些端点，此 map 仅在 vite dev server 中有效。
const DEV_MOCK_ROUTES = {
  // ── 子应用挂载初始化 ────────────────────────────────────────────────────
  '/api/legacy/init': () => ({
    ok: true, appId: 'vue2-legacy', serverTime: Date.now(),
    featureFlags: { enableBatchExport: true, enableOrderSplit: false },
  }),
  '/api/legacy/runtime-vendor': () => ({
    ok: true, vendorCapabilities: ['currency', 'date-format', 'tenant-code'],
  }),
  '/api/wms/init': () => ({
    ok: true, appId: 'vue3-wms', warehouseCount: 3,
  }),
  '/api/ops/init': () => ({
    ok: true, appId: 'react-ops', dashboardVersion: 'v2',
  }),
  '/api/portal/init': () => ({
    ok: true, appId: 'vite-vue-portal', workbenchEnabled: true,
  }),
  '/api/console/init': () => ({
    ok: true, appId: 'vite-react-console', auditLogRetentionDays: 90,
  }),
  // ── 认证 / 身份 ──────────────────────────────────────────────────────────
  '/api/auth/me': () => ({
    ok: true,
    id: 'dev-u-001', name: 'dev-admin', displayName: '开发调试用户',
    email: 'dev@localhost.local',
    roles: ['admin', 'ops-manager', 'wms-operator'],
    tenantCode: 'scm-platform',
  }),
  '/api/auth/refresh': () => ({
    ok: true, token: 'mock-refreshed-bearer-' + Date.now(), expiresIn: 3600,
  }),
  // ── 权限 / 导航 ──────────────────────────────────────────────────────────
  '/api/nav/permissions': () => ({
    ok: true,
    permissions: ['legacy:view', 'wms:view', 'ops:view', 'portal:view', 'console:view'],
  }),
  '/api/nav/menus': () => ({
    ok: true, source: 'mock',
    message: '本地开发使用 menu-config.js 静态菜单，不走此接口',
  }),
};

// 本地开发 API mock 插件
// 仅在 dev server 中生效，拦截所有 /api/** 请求并返回语义化 mock JSON，
// 避免无后端环境下出现 404 噪音。生产构建不包含此逻辑。
function devApiMockPlugin() {
  return {
    name: 'dev-api-mock',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        // 按路由前缀匹配，找到最长匹配优先
        const matchedKey = Object.keys(DEV_MOCK_ROUTES)
          .filter((k) => req.url.startsWith(k))
          .sort((a, b) => b.length - a.length)[0];

        const body = matchedKey
          ? DEV_MOCK_ROUTES[matchedKey]()
          : { __mock: true, path: req.url, message: '[dev-mock] 未配置路由，返回通用占位响应' };

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify(body));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiMockPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 7200,
    strictPort: true,
  },
  preview: {
    port: 7200,
    strictPort: true,
  },
});
