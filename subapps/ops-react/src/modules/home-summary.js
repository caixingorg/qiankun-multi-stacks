export function createOpsSummary(viewModel = {}) {
  return [
    { label: 'Host source', value: viewModel.fromHost || 'standalone mode' },
    { label: 'App name', value: viewModel.appName || 'unknown' },
    { label: 'Runtime channel', value: viewModel.runtimeChannel || 'stable' },
    { label: 'Shared kernel time', value: viewModel.sharedTime || 'N/A' },
    { label: 'Module meta', value: viewModel.moduleMeta || 'N/A' },
    { label: 'Vendor version', value: viewModel.vendorVersion || 'N/A' },
    { label: 'Tenant', value: viewModel.vendorTenant || 'N/A' },
    { label: 'Feature flag', value: String(viewModel.featureEnabled || false) },
  ];
}

export function createOpsPreviewRecords() {
  return [
    { id: 'OP-3001', title: 'Cluster stability review', status: 'active', owner: 'sre' },
    { id: 'OP-3002', title: 'Release health watch', status: 'warning', owner: 'release-ops' },
    { id: 'OP-3003', title: 'Incident postmortem queue', status: 'queued', owner: 'platform' },
  ];
}

export function createOpsDetailSnapshot() {
  return [
    { label: 'recordId', value: 'OP-3001' },
    { label: 'pageIntent', value: 'ops-insight' },
    { label: 'primaryAction', value: 'open incident review' },
    { label: 'lastUpdated', value: '2026-04-04 10:10' },
  ];
}
