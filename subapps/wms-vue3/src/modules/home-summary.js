export function createWmsSummary(viewModel = {}) {
  return [
    { label: 'Host source', value: viewModel.fromHost || 'standalone mode' },
    { label: 'App name', value: viewModel.appName || 'unknown' },
    { label: 'Shared kernel time', value: viewModel.sharedTime || 'N/A' },
    { label: 'Ability group', value: viewModel.moduleMeta || 'N/A' },
    { label: 'Vendor version', value: viewModel.vendorVersion || 'N/A' },
    { label: 'Tenant', value: viewModel.vendorTenant || 'N/A' },
    { label: 'Feature flag', value: String(viewModel.featureEnabled || false) },
    { label: 'Policy', value: viewModel.policySummary || 'No dependency policy provided' },
  ];
}

export function createWmsPreviewRecords() {
  return [
    { id: 'WM-2001', title: 'Wave release queue', status: 'running', owner: 'wave-team' },
    { id: 'WM-2002', title: 'Picking exception board', status: 'warning', owner: 'floor-control' },
    { id: 'WM-2003', title: 'Dock staging sync', status: 'ready', owner: 'inbound' },
  ];
}

export function createWmsDetailSnapshot() {
  return [
    { label: 'recordId', value: 'WM-2001' },
    { label: 'pageIntent', value: 'wave-task-board' },
    { label: 'primaryAction', value: 'assign task batch' },
    { label: 'lastUpdated', value: '2026-04-04 10:05' },
  ];
}
