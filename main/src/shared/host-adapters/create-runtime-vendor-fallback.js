import { createRuntimeVendorShape } from './vendor-contracts.js';

export function createRuntimeVendorFallback({ appId, tenantCode }) {
  return createRuntimeVendorShape({
    version: 'standalone-fallback',
    tenantCode: tenantCode || appId || 'local-preview',
    featureFlags: {
      enableInjectedVendor: false,
      enableStandaloneMode: true
    },
    requestSource: (appId || 'runtime-vendor') + '-standalone-fallback',
    currency: 'CNY'
  });
}
