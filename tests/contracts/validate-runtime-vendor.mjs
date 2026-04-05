import { createRuntimeVendorFallback } from '../../main/src/shared/host-adapters/create-runtime-vendor-fallback.js';

const runtimeVendor = createRuntimeVendorFallback({
  appId: 'contract-test',
  tenantCode: 'contract-test'
});

if (runtimeVendor.version !== 'standalone-fallback') {
  throw new Error('runtime vendor fallback version mismatch');
}

if (runtimeVendor.tenantCode !== 'contract-test') {
  throw new Error('runtime vendor tenantCode mismatch');
}

if (typeof runtimeVendor.formatCurrency !== 'function') {
  throw new Error('runtime vendor missing formatCurrency');
}

if (typeof runtimeVendor.request !== 'function') {
  throw new Error('runtime vendor missing request');
}

console.log('[contracts] runtime vendor validation passed');
