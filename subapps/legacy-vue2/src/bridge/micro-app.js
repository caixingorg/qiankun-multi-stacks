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
    priceDemo: runtimeVendor.formatCurrency ? runtimeVendor.formatCurrency(1288.5) : 'N/A',
  };
}

function buildViewModel(props) {
  const sharedKernel = getHostSharedKernel(props);
  const navigation = getHostNavigation(props);
  const dependencyPolicy = getDependencyPolicy(props);
  const vendorInfo = buildVendorInfo();
  const moduleMeta = sharedKernel.getModuleMeta ? sharedKernel.getModuleMeta() : null;

  // Bridge keeps the child app consuming a stable host-shaped view model.
  return {
    fromHost: props.fromHost || 'qiankun host',
    appName: props.appName || 'subapp-vue2-legacy',
    mode: 'qiankun',
    runtimeChannel,
    rollbackEntryActive,
    sharedTime: sharedKernel.formatTime ? sharedKernel.formatTime() : 'N/A',
    moduleMeta: moduleMeta ? moduleMeta.name + '@' + moduleMeta.version : 'N/A',
    featureEnabled: sharedKernel.getFeatureFlag
      ? sharedKernel.getFeatureFlag('enableLegacyOrderMigration')
      : false,
    policySummary: dependencyPolicy.summary || 'No dependency policy provided',
    vendorVersion: vendorInfo.version,
    vendorTenant: vendorInfo.tenantCode,
    vendorPrice: vendorInfo.priceDemo,
    requestClient: sharedKernel.request || null,
    requestTransport: sharedKernel.request ? 'host-shared-kernel' : 'browser-fetch',
    navigationTargets: navigation.getTargets ? navigation.getTargets('legacy') : [],
    onNavigate: (target) => {
      if (navigation.navigate) {
        navigation.navigate({
          app: target.key,
          childPath: target.childPath,
          from: 'subapp-vue2-legacy',
        });
      }
    },
  };
}

const lifecycle = createWebpackSubapp({
  appId: 'vue2',
  activeSubApp: 'subapp-vue2-legacy',
  async onMount({ cleanupBag, hostBridge, props }) {
    assertMainContract(props);

    const resizeHandler = () => {
    console.log('[vue2] resize handled safely');
  };
    cleanupBag.addEventListener(window, 'resize', resizeHandler);

    cleanupBag.setInterval(() => {
    console.log('[vue2] heartbeat');
  }, 10000);

    if (props.sharedKernel && props.sharedKernel.request) {
      props.sharedKernel.request('/legacy/init', { app: 'vue2', runtimeChannel }).then((res) => {
      console.log('[vue2] shared request result:', res);
    }).catch((error) => {
      hostBridge.emitRuntimeError({
        stage: 'shared-request',
        error,
      });
    });
    }

    if (runtimeVendor.request) {
      runtimeVendor.request('/legacy/runtime-vendor', { app: 'vue2', runtimeChannel }).then((res) => {
      console.log('[vue2] injected runtime vendor result:', res);
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
