export function getLegacyHostContext(viewModel = {}) {
  return {
    fromHost: viewModel.fromHost || 'standalone mode',
    appName: viewModel.appName || 'unknown',
    mode: viewModel.mode || 'standalone',
    runtimeChannel: viewModel.runtimeChannel || 'stable',
    sharedTime: viewModel.sharedTime || 'N/A',
    policySummary: viewModel.policySummary || 'No dependency policy provided',
    vendorTenant: viewModel.vendorTenant || 'N/A',
  };
}
