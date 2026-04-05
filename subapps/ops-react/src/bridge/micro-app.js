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
    priceDemo: runtimeVendor.formatCurrency ? runtimeVendor.formatCurrency(3024) : 'N/A',
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
    appName: props.appName || 'subapp-react-ops',
    mode: 'qiankun',
    runtimeChannel,
    rollbackEntryActive,
    sharedTime: sharedKernel.formatTime ? sharedKernel.formatTime() : 'N/A',
    moduleMeta: moduleMeta ? moduleMeta.name + '@' + moduleMeta.version : 'N/A',
    featureEnabled: sharedKernel.getFeatureFlag
      ? sharedKernel.getFeatureFlag('enableOpsCenter')
      : false,
    policySummary: dependencyPolicy.summary || 'No dependency policy provided',
    vendorVersion: vendorInfo.version,
    vendorTenant: vendorInfo.tenantCode,
    vendorPrice: vendorInfo.priceDemo,
    requestClient: sharedKernel.request || null,
    requestTransport: sharedKernel.request ? 'host-shared-kernel' : 'browser-fetch',
    navigationTargets: navigation.getTargets ? navigation.getTargets('ops') : [],
    onNavigate: (target) => {
      if (navigation.navigate) {
        navigation.navigate({
          app: target.key,
          childPath: target.childPath,
          from: 'subapp-react-ops',
        });
      }
    },
  };
}

const lifecycle = createWebpackSubapp({
  appId: 'react',
  activeSubApp: 'subapp-react-ops',
  async onMount({ cleanupBag, hostBridge, props }) {
    assertMainContract(props);

    const resizeHandler = () => {
    console.log('[react] resize handled safely');
  };
    cleanupBag.addEventListener(window, 'resize', resizeHandler);

    cleanupBag.setInterval(() => {
    console.log('[react] heartbeat');
  }, 10000);

    if (props.sharedKernel && props.sharedKernel.request) {
      props.sharedKernel.request('/ops/init', { app: 'react', runtimeChannel }).then((res) => {
      console.log('[react] shared request result:', res);
    }).catch((error) => {
      hostBridge.emitRuntimeError({
        stage: 'shared-request',
        error,
      });
    });
    }

    if (runtimeVendor.request) {
      runtimeVendor.request('/ops/runtime-vendor', { app: 'react', runtimeChannel }).then((res) => {
      console.log('[react] injected runtime vendor result:', res);
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
