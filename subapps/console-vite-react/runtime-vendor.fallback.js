(function attachRuntimeVendorFallback() {
  if (window.HostRuntimeVendor) {
    return;
  }

  window.HostRuntimeVendor = {
    version: 'standalone-fallback',
    tenantCode: 'subapp-vite-react-console',
    formatCurrency(value) {
      return 'CNY ' + Number(value || 0).toFixed(2);
    },
    getFeatureFlags() {
      return {
        enableInjectedVendor: false,
        enableStandaloneMode: true
      };
    },
    request(path, payload) {
      return Promise.resolve({
        ok: true,
        from: 'subapp-vite-react-console-standalone-fallback',
        path,
        payload,
        tenantCode: 'subapp-vite-react-console'
      });
    }
  };
})();
