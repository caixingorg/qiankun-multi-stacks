import { renderWithQiankun } from 'vite-plugin-qiankun/dist/helper';
import { renderApp, unmountApp } from '../app';
import {
  assertMainContract,
  createViteSubapp,
  getDependencyPolicy,
  getHostNavigation,
  getHostSharedKernel,
  resolveRuntimeVendor,
} from './host-api.js';

const runtimeChannel = import.meta.env.VITE_APP_RUNTIME_CHANNEL === 'rollback' ? 'rollback' : 'stable';
const rollbackEntryActive = import.meta.env.VITE_ROLLBACK_ENTRY_MODE === 'true';

function buildViewModel(props) {
  const sharedKernel = getHostSharedKernel(props);
  const navigation = getHostNavigation(props);
  const dependencyPolicy = getDependencyPolicy(props);
  const runtimeVendor = resolveRuntimeVendor();
  const moduleMeta = sharedKernel.getModuleMeta ? sharedKernel.getModuleMeta() : null;

  // Bridge keeps the child app consuming a stable host-shaped view model.
  return {
    fromHost: props.fromHost || 'qiankun host',
    appName: props.appName || 'subapp-vite-vue-portal',
    mode: 'qiankun',
    runtimeChannel,
    rollbackEntryActive,
    sharedTime: sharedKernel.formatTime ? sharedKernel.formatTime() : 'N/A',
    moduleMeta: moduleMeta ? moduleMeta.name + '@' + moduleMeta.version : 'N/A',
    featureEnabled: sharedKernel.getFeatureFlag
      ? sharedKernel.getFeatureFlag('enablePortalWorkbench')
      : false,
    policySummary: dependencyPolicy.summary || 'No dependency policy provided',
    vendorVersion: runtimeVendor.version || 'N/A',
    vendorTenant: runtimeVendor.tenantCode || 'N/A',
    vendorPrice: runtimeVendor.formatCurrency ? runtimeVendor.formatCurrency(1888) : 'N/A',
    requestClient: sharedKernel.request || null,
    requestTransport: sharedKernel.request ? 'host-shared-kernel' : 'browser-fetch',
    navigationTargets: navigation.getTargets ? navigation.getTargets('viteVue') : [],
    onNavigate: (target) => {
      if (navigation.navigate) {
        navigation.navigate({
          app: target.key,
          childPath: target.childPath,
          from: 'subapp-vite-vue-portal',
        });
      }
    },
  };
}

export function registerMicroApp() {
  renderWithQiankun(createViteSubapp({
    appId: 'vite-vue',
    activeSubApp: 'subapp-vite-vue-portal',
    async onMount({ cleanupBag, hostBridge, props }) {
      assertMainContract(props);

      const resizeHandler = () => {
        console.log('[vite-vue] resize handled safely');
      };
      cleanupBag.addEventListener(window, 'resize', resizeHandler);

      cleanupBag.setInterval(() => {
        console.log('[vite-vue] heartbeat');
      }, 10000);

      if (props.sharedKernel && props.sharedKernel.request) {
        props.sharedKernel.request('/portal/init', { app: 'vite-vue', runtimeChannel }).then((res) => {
          console.log('[vite-vue] shared request result:', res);
        }).catch((error) => {
          hostBridge.emitRuntimeError({
            stage: 'shared-request',
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
  }));
}
