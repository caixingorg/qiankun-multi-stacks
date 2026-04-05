(function attachRuntimeVendorFallback() {
  if (window.HostRuntimeVendor) {
    return;
  }

  window.HostRuntimeVendor = {
    version: 'standalone-fallback',
    tenantCode: 'subapp-vue2-legacy',
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
        from: 'subapp-vue2-legacy-standalone-fallback',
        path,
        payload,
        tenantCode: 'subapp-vue2-legacy'
      });
    }
  };
})();
