import { renderApp, unmountApp } from '../app';
import {
  assertMainContract,
  createWebpackSubapp,
  getDependencyPolicy,
  getHostNavigation,
  getHostSharedKernel,
} from './host-api.js';

const runtimeVendor = require('@host/runtime-vendor');
const runtimeChannel = process.env.APP_RUNTIME_CHANNEL === 'rollback' ? 'rollback' : 'stable';
const rollbackEntryActive = process.env.ROLLBACK_ENTRY_MODE === 'true';

function buildVendorInfo() {
  return {
    version: runtimeVendor.version || 'N/A',
    tenantCode: runtimeVendor.tenantCode || 'N/A',
    priceDemo: runtimeVendor.formatCurrency ? runtimeVendor.formatCurrency(5600) : 'N/A',
  };
}

function buildViewModel(props) {
  const sharedKernel = getHostSharedKernel(props);
  const navigation = getHostNavigation(props);
  const dependencyPolicy = getDependencyPolicy(props);
  const vendorInfo = buildVendorInfo();
  const sharedByHostKernel = Array.isArray(dependencyPolicy.sharedByHostKernel)
    ? dependencyPolicy.sharedByHostKernel.join(', ')
    : 'N/A';

  // Bridge keeps the child app consuming a stable host-shaped view model.
  return {
    fromHost: props.fromHost || 'qiankun host',
    appName: props.appName || 'subapp-vue3-wms',
    mode: 'qiankun',
    runtimeChannel,
    rollbackEntryActive,
    sharedTime: sharedKernel.formatTime ? sharedKernel.formatTime() : 'N/A',
    moduleMeta: sharedByHostKernel,
    featureEnabled: sharedKernel.getFeatureFlag
      ? sharedKernel.getFeatureFlag('enableWmsWavePicking')
      : false,
    policySummary: dependencyPolicy.summary || 'No dependency policy provided',
    vendorVersion: vendorInfo.version,
    vendorTenant: vendorInfo.tenantCode,
    vendorPrice: vendorInfo.priceDemo,
    requestClient: sharedKernel.request || null,
    requestTransport: sharedKernel.request ? 'host-shared-kernel' : 'browser-fetch',
    navigationTargets: navigation.getTargets ? navigation.getTargets('wms') : [],
    onNavigate: (target) => {
      if (navigation.navigate) {
        navigation.navigate({
          app: target.key,
          childPath: target.childPath,
          from: 'subapp-vue3-wms',
        });
      }
    },
  };
}

const lifecycle = createWebpackSubapp({
  appId: 'vue3',
  activeSubApp: 'subapp-vue3-wms',
  async onMount({ cleanupBag, hostBridge, props }) {
    assertMainContract(props);

    const resizeHandler = () => {
    console.log('[vue3] resize handled safely');
  };
    cleanupBag.addEventListener(window, 'resize', resizeHandler);

    cleanupBag.setInterval(() => {
    console.log('[vue3] heartbeat');
  }, 10000);

    if (props.sharedKernel && props.sharedKernel.request) {
      props.sharedKernel.request('/wms/init', { app: 'vue3', runtimeChannel }).then((res) => {
      console.log('[vue3] shared request result:', res);
    }).catch((error) => {
      hostBridge.emitRuntimeError({
        stage: 'shared-request',
        error,
      });
    });
    }

    if (runtimeVendor.request) {
      runtimeVendor.request('/wms/runtime-vendor', { app: 'vue3', runtimeChannel }).then((res) => {
      console.log('[vue3] injected runtime vendor result:', res);
    }).catch((error) => {
      hostBridge.emitRuntimeError({
        stage: 'runtime-vendor-request',
        error,
      });
    });
    }

    renderApp({
      container: props.container,
      viewModel: buildViewModel(props),
    });
  },
  async onUnmount() {
    unmountApp();
  }
});

export const bootstrap = lifecycle.bootstrap;
export const mount = lifecycle.mount;
export const unmount = lifecycle.unmount;
