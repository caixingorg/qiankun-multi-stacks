export function createLegacySummary(viewModel = {}) {
  return [
    { label: 'Host source', value: viewModel.fromHost || 'standalone mode' },
    { label: 'App name', value: viewModel.appName || 'unknown' },
    { label: 'Runtime channel', value: viewModel.runtimeChannel || 'stable' },
    { label: 'Shared kernel time', value: viewModel.sharedTime || 'N/A' },
    { label: 'Shared module meta', value: viewModel.moduleMeta || 'N/A' },
    { label: 'Runtime vendor version', value: viewModel.vendorVersion || 'N/A' },
    { label: 'Tenant', value: viewModel.vendorTenant || 'N/A' },
    { label: 'Feature flag', value: String(viewModel.featureEnabled || false) },
    { label: 'Policy', value: viewModel.policySummary || 'No dependency policy provided' },
  ];
}

export function createLegacyPreviewRecords() {
  return [
    { id: 'LG-1001', title: 'Pending migration orders', status: 'queued', owner: 'legacy-team' },
    { id: 'LG-1002', title: 'Manual review backlog', status: 'reviewing', owner: 'ops-support' },
    { id: 'LG-1003', title: 'Archived sync recovery', status: 'done', owner: 'data-fix' },
  ];
}

export function createLegacyDetailSnapshot() {
  return [
    { label: 'recordId', value: 'LG-1001' },
    { label: 'pageIntent', value: 'legacy-history' },
    { label: 'primaryAction', value: 'review migration result' },
    { label: 'lastUpdated', value: '2026-04-04 10:00' },
  ];
}
