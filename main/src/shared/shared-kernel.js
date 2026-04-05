// createSharedKernel builds the intentionally small capability surface that
// main exposes to subapps.
//
// Receives pre-built context objects from main.js so that the shell and every
// subapp share exactly the same envContext, permissionContext, and
// requestClient instances — no secondary construction happens here.
export function createSharedKernel({
  user,
  envContext,
  permissionContext,
  requestClient,
  contractVersion,
}) {
  return {
    version: '1.0.0',
    appName: 'host-shared-kernel',
    formatTime(date = new Date()) {
      const pad = (n) => String(n).padStart(2, '0');
      return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
      ].join('-') +
        ' ' +
        [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':');
    },
    request(path, payload) {
      return requestClient.request(path, {
        ...payload,
        ts: Date.now(),
        from: 'shared-kernel@1.0.0',
      });
    },
    getModuleMeta() {
      return {
        name: this.appName,
        version: this.version,
        abilities: ['formatTime', 'request', 'getModuleMeta', 'getFeatureFlag'],
      };
    },
    getFeatureFlag(flagName) {
      // feature flags 从运行时配置读取，不在主应用代码里硬编码。
      // runtime-config.js 在 main 应用启动前即已运行，此时 window.__MAIN_RUNTIME_CONFIG__ 必然就绪。
      // flag 不存在时 fallback false（默认关闭），避免意外开启未就绪功能。
      const config = (typeof window !== 'undefined' && window.__MAIN_RUNTIME_CONFIG__) || {};
      const flags = config.featureFlags || {};
      return Boolean(flags[flagName]);
    },
    getEnvContext() {
      return envContext;
    },
    getPermissionContext() {
      return permissionContext;
    },
    getContractVersion() {
      return contractVersion || 'v1';
    },
  };
}
