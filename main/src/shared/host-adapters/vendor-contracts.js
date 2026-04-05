// Runtime vendor contracts keep the host-provided global and standalone
// fallbacks aligned.
export const RuntimeVendorDefaults = {
  currency: 'CNY',
  tenantCode: 'local-preview',
  version: 'standalone-fallback'
};

export function normalizeCurrency(value, currency = RuntimeVendorDefaults.currency) {
  return currency + ' ' + Number(value || 0).toFixed(2);
}

export function createRuntimeVendorShape({
  version,
  tenantCode,
  featureFlags,
  requestSource,
  currency
}) {
  const resolvedVersion = version || RuntimeVendorDefaults.version;
  const resolvedTenantCode = tenantCode || RuntimeVendorDefaults.tenantCode;
  const resolvedFeatureFlags = featureFlags || {};
  const resolvedSource = requestSource || resolvedVersion;
  const resolvedCurrency = currency || RuntimeVendorDefaults.currency;

  return {
    version: resolvedVersion,
    tenantCode: resolvedTenantCode,
    formatCurrency(value) {
      return normalizeCurrency(value, resolvedCurrency);
    },
    getFeatureFlags() {
      return resolvedFeatureFlags;
    },
    request(path, payload) {
      return Promise.resolve({
        ok: true,
        from: resolvedSource,
        path,
        payload,
        tenantCode: resolvedTenantCode
      });
    }
  };
}
