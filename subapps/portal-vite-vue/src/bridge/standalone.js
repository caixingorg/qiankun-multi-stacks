import { renderApp } from '../app';
import { resolveRuntimeVendor } from './host-api.js';

const runtimeChannel = import.meta.env.VITE_APP_RUNTIME_CHANNEL === 'rollback' ? 'rollback' : 'stable';
const rollbackEntryActive = import.meta.env.VITE_ROLLBACK_ENTRY_MODE === 'true';

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
  const runtimeVendor = resolveRuntimeVendor();

  return {
    fromHost: 'standalone mode',
    appName: 'subapp-vite-vue-portal',
    mode: 'standalone',
    runtimeChannel,
    rollbackEntryActive,
    sharedTime: 'N/A',
    moduleMeta: 'N/A',
    featureEnabled: false,
    policySummary: 'Standalone mode without host dependency policy',
    vendorVersion: runtimeVendor.version || 'standalone',
    vendorTenant: runtimeVendor.tenantCode || 'local-preview',
    vendorPrice: runtimeVendor.formatCurrency ? runtimeVendor.formatCurrency(1888) : 'N/A',
    requestClient: null,
    requestTransport: 'browser-fetch',
    navigationTargets: standaloneTargets.filter((item) => item.key !== 'viteVue'),
    onNavigate: navigateFromStandalone,
  };
}

export function startStandalone() {
  renderApp({
    viewModel: buildStandaloneViewModel(),
  });
}
