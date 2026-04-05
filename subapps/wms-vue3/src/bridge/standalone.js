import { renderApp } from '../app';
import { resolveRuntimeVendor } from './host-api.js';

const runtimeChannel = process.env.APP_RUNTIME_CHANNEL === 'rollback' ? 'rollback' : 'stable';
const rollbackEntryActive = process.env.ROLLBACK_ENTRY_MODE === 'true';

const standaloneTargets = [
  { key: 'legacy', title: 'Legacy Vue2', path: '/legacy', childPath: '/orders/pending' },
  { key: 'wms', title: 'WMS Vue3', path: '/wms', childPath: '/wave/board' },
  { key: 'ops', title: 'Ops React', path: '/ops', childPath: '/dashboard' },
  { key: 'viteVue', title: 'Portal Vite Vue', path: '/vite-vue', childPath: '/workspace' },
  { key: 'viteReact', title: 'Console Vite React', path: '/vite-react', childPath: '/audit-log' },
];

function navigateFromStandalone(target) {
  if (!target) {
    return;
  }

  const hostBaseUrl = window.location.protocol + '//' + window.location.hostname + ':7200';
  window.location.href = hostBaseUrl + target.path + (target.childPath || '');
}

function buildStandaloneViewModel() {
  const standaloneVendor = resolveRuntimeVendor();

  return {
    fromHost: 'standalone mode',
    appName: 'subapp-vue3-wms',
    mode: 'standalone',
    runtimeChannel,
    rollbackEntryActive,
    sharedTime: 'N/A',
    moduleMeta: 'N/A',
    featureEnabled: false,
    policySummary: 'Standalone mode without host dependency policy',
    vendorVersion: standaloneVendor.version || 'standalone',
    vendorTenant: standaloneVendor.tenantCode || 'local-preview',
    vendorPrice: standaloneVendor.formatCurrency
      ? standaloneVendor.formatCurrency(5600)
      : 'N/A',
    requestClient: null,
    requestTransport: 'browser-fetch',
    navigationTargets: standaloneTargets.filter((item) => item.key !== 'wms'),
    onNavigate: navigateFromStandalone,
  };
}

export function startStandalone() {
  renderApp({
    viewModel: buildStandaloneViewModel(),
  });
}
